import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { copyFile, mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import path from "node:path";
import { createGzip } from "node:zlib";

import { bootstrapAndLocatePinnedWasmOpt, locatePinnedWasmOpt } from "./wasm-opt-toolchain.mjs";

/**
 * One budget per shipped profile.
 *
 * Two artifacts are two products. A canvas engine that renders text and one
 * that also carries a document editor are not the same download, and holding
 * both to one number is what turns "add a capability" into "break the gate".
 * The base profile keeps the 400 KiB `docs/design.md` has always required, so
 * an application that does not want an editor never pays for one.
 *
 * Each profile states a product hard limit and an engineering gate holding a
 * 16 KiB reserve under it -- the structure M9 fixed for the base profile. The
 * build gates on the engineering number for every profile; the product number
 * is what the release candidate checks. Before this, base gated on its
 * engineering budget while rich-text gated on the product ceiling, which is
 * why the rich artifact had 773 bytes of room and the base one had 20,260.
 */
const PROFILES = {
  "base": {
    engineeringMaximumGzipBytes: 384 * 1024,
    productMaximumGzipBytes: 400 * 1024,
  },
  // Sized for the editor work `docs/e15-rich-text-design.md` still names --
  // caret placement from a point, document IME, undo keybindings -- so the
  // ceiling does not have to be renegotiated in the middle of a feature.
  "rich-text": {
    engineeringMaximumGzipBytes: 424 * 1024,
    productMaximumGzipBytes: 440 * 1024,
  },
};
const expectedRustc = "rustc 1.96.0 (ac68faa20 2026-05-25)";
const expectedWasmOpt = "wasm-opt version 117 (version_117)";
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// wasm-pack reads the pass list out of the crate manifest, so that is the only
// place it can be stated. A second copy here is how the recorded manifest ends
// up reporting passes the build did not run.
const optimizationPasses = await readOptimizationPasses();
const buildDirectory = path.join(repositoryRoot, "target/core-wasm-package");
const packageDirectory = path.join(repositoryRoot, "packages/host/wasm");
const wasmPackVersion = (await runCapture("wasm-pack", ["--version"])).trim();
if (wasmPackVersion !== "wasm-pack 0.14.0") {
  throw new Error(`product Core requires wasm-pack 0.14.0; received ${wasmPackVersion}`);
}
const rustcVersion = (await runCapture("rustc", ["--version"])).trim();
if (rustcVersion !== expectedRustc) {
  throw new Error(`product Core requires ${expectedRustc}; received ${rustcVersion}`);
}
const verifyReproducible = process.argv.includes("--verify-reproducible");
/**
 * Rich text is an optional Core module.
 *
 * Compiling it in costs about 19 KB gzip, which does not fit under the base
 * profile's budget alongside everything else the Core already carries. The E15
 * design named this outcome and its answer: ship rich text as a module a build
 * opts into.
 *
 * `PINGO_RICH_TEXT=1 pnpm core:wasm` produces that artifact and measures it
 * against the rich-text profile's own budget. See
 * docs/wasm-size-attribution.md.
 */
const richText = process.env.PINGO_RICH_TEXT === "1";
const profileName = richText ? "rich-text" : "base";
const { engineeringMaximumGzipBytes, productMaximumGzipBytes } = PROFILES[profileName];
let cleanRoots = [];
let result;
let wasmOptVersion;
try {
  if (verifyReproducible) {
    const firstRoot = await mkdtemp(path.join(tmpdir(), "pingo-m9-wasm-a-"));
    const secondRoot = await mkdtemp(path.join(tmpdir(), "pingo-m9-wasm-b-"));
    cleanRoots = [firstRoot, secondRoot];
    const verified = await buildAndVerifyWasmOpt(
      path.join(firstRoot, "package"),
      path.join(firstRoot, "target"),
    );
    const first = verified.result;
    wasmOptVersion = verified.version;
    const second = await build(path.join(secondRoot, "package"), path.join(secondRoot, "target"));
    if (
      first.sha256 !== second.sha256 ||
      first.rawBytes !== second.rawBytes ||
      first.gzipBytes !== second.gzipBytes
    ) {
      throw new Error(
        `clean WASM builds differ: ${first.sha256}/${String(first.rawBytes)}/${String(first.gzipBytes)} vs ${second.sha256}/${String(second.rawBytes)}/${String(second.gzipBytes)}`,
      );
    }
    result = second;
  } else {
    const verified = await buildAndVerifyWasmOpt(buildDirectory);
    result = verified.result;
    wasmOptVersion = verified.version;
  }

  await mkdir(packageDirectory, { recursive: true });
  const artifacts = ["pingo_core.js", "pingo_core.d.ts", "pingo_core_bg.wasm"];
  await Promise.all(
    artifacts.map((artifact) =>
      copyFile(path.join(result.outputDirectory, artifact), path.join(packageDirectory, artifact)),
    ),
  );

  const report = {
    attribution: result.attribution,
    engineeringMaximumGzipBytes,
    gzipBytes: result.gzipBytes,
    maximumGzipBytes: engineeringMaximumGzipBytes,
    optimizationPasses,
    profile: profileName,
    productMaximumGzipBytes,
    rawBytes: result.rawBytes,
    reproducibleCleanBuilds: verifyReproducible ? 2 : 0,
    richText,
    rustc: rustcVersion,
    sha256: result.sha256,
    target: "web",
    tool: wasmPackVersion,
    version: 2,
    wasmOpt: wasmOptVersion,
  };
  await writeFile(
    path.join(packageDirectory, "manifest.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );
  process.stdout.write(
    `Product Core WASM: ${String(result.rawBytes)} bytes raw, ${String(result.gzipBytes)} bytes gzip${verifyReproducible ? ", two clean builds byte-identical" : ""}\n`,
  );
  if (result.gzipBytes > engineeringMaximumGzipBytes) {
    throw new Error(
      `${profileName} Core WASM is ${String(result.gzipBytes)} gzip bytes; the profile's engineering budget is ${String(engineeringMaximumGzipBytes)} and its product ceiling is ${String(productMaximumGzipBytes)}`,
    );
  }
} finally {
  await Promise.all(cleanRoots.map((root) => rm(root, { force: true, recursive: true })));
}

async function readOptimizationPasses() {
  const manifestPath = path.join(repositoryRoot, "core/pingo-core/Cargo.toml");
  const manifest = await readFile(manifestPath, "utf8");
  const section = /^\[package\.metadata\.wasm-pack\.profile\.release\]$/mu.exec(manifest);
  if (section === null) {
    throw new Error(`${manifestPath} has no [package.metadata.wasm-pack.profile.release] section`);
  }
  const array = /^wasm-opt = \[$(?<body>[\s\S]*?)^\]$/mu.exec(manifest.slice(section.index));
  if (array?.groups === undefined) {
    throw new Error(`${manifestPath} has no multi-line wasm-opt pass list`);
  }
  const passes = [...array.groups.body.matchAll(/"(?<pass>[^"]+)"/gu)].map(
    (match) => match.groups?.pass ?? "",
  );
  if (passes.length === 0) {
    throw new Error(`${manifestPath} declares an empty wasm-opt pass list`);
  }
  return passes;
}

async function build(outputDirectory, cargoTargetDirectory) {
  await mkdir(outputDirectory, { recursive: true });
  await run(
    "wasm-pack",
    [
      "build",
      "core/pingo-core",
      "--target",
      "web",
      "--release",
      "--out-dir",
      outputDirectory,
      "--out-name",
      "pingo_core",
      ...(richText ? [] : ["--", "--no-default-features"]),
    ],
    cargoTargetDirectory === undefined ? undefined : { CARGO_TARGET_DIR: cargoTargetDirectory },
  );
  const wasmPath = path.join(outputDirectory, "pingo_core_bg.wasm");
  const [{ size: rawBytes }, gzipBytes, wasmBytes] = await Promise.all([
    stat(wasmPath),
    gzipSize(wasmPath),
    readFile(wasmPath),
  ]);
  return {
    attribution: attributeWasmSections(wasmBytes),
    gzipBytes,
    outputDirectory,
    rawBytes,
    sha256: createHash("sha256").update(wasmBytes).digest("hex"),
  };
}

async function buildAndVerifyWasmOpt(outputDirectory, cargoTargetDirectory) {
  return bootstrapAndLocatePinnedWasmOpt({
    build: async () => build(outputDirectory, cargoTargetDirectory),
    locate: async () =>
      locatePinnedWasmOpt({
        expectedVersion: expectedWasmOpt,
        readVersion: async (executable) => runCapture(executable, ["--version"]),
      }),
  });
}

function run(command, arguments_, environment) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, arguments_, {
      cwd: repositoryRoot,
      env: environment === undefined ? process.env : { ...process.env, ...environment },
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else
        reject(new Error(`${command} failed with code ${String(code)} signal ${String(signal)}`));
    });
  });
}

function attributeWasmSections(bytes) {
  const names = [
    "custom",
    "type",
    "import",
    "function",
    "table",
    "memory",
    "global",
    "export",
    "start",
    "element",
    "code",
    "data",
    "dataCount",
    "tag",
  ];
  if (bytes.length < 8 || bytes.readUInt32LE(0) !== 0x6d736100 || bytes.readUInt32LE(4) !== 1) {
    throw new Error("generated artifact is not a canonical WebAssembly v1 module");
  }
  const sections = { header: 8 };
  let offset = 8;
  while (offset < bytes.length) {
    const start = offset;
    const id = bytes[offset];
    offset += 1;
    const length = readLebU32(bytes, offset);
    offset = length.offset;
    const end = offset + length.value;
    if (end > bytes.length) throw new Error("WASM section exceeds the module boundary");
    let name = names[id] ?? `unknown-${String(id)}`;
    if (id === 0) {
      const customLength = readLebU32(bytes, offset);
      const nameEnd = customLength.offset + customLength.value;
      if (nameEnd > end) throw new Error("WASM custom-section name exceeds its boundary");
      name = `custom:${bytes.subarray(customLength.offset, nameEnd).toString("utf8")}`;
    }
    sections[name] = (sections[name] ?? 0) + end - start;
    offset = end;
  }
  const attributed = Object.values(sections).reduce((sum, value) => sum + value, 0);
  if (attributed !== bytes.length) throw new Error("WASM section attribution is incomplete");
  return Object.fromEntries(Object.entries(sections).sort((left, right) => right[1] - left[1]));
}

function readLebU32(bytes, initialOffset) {
  let offset = initialOffset;
  let value = 0;
  let shift = 0;
  for (let index = 0; index < 5; index += 1) {
    if (offset >= bytes.length) throw new Error("truncated WASM LEB128 value");
    const byte = bytes[offset];
    offset += 1;
    value |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) return { offset, value: value >>> 0 };
    shift += 7;
  }
  throw new Error("WASM LEB128 value exceeds u32");
}

function runCapture(command, arguments_) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, arguments_, {
      cwd: repositoryRoot,
      stdio: ["ignore", "pipe", "inherit"],
    });
    let output = "";
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      output += chunk;
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve(output);
      else
        reject(new Error(`${command} failed with code ${String(code)} signal ${String(signal)}`));
    });
  });
}

function gzipSize(filename) {
  return new Promise((resolve, reject) => {
    let bytes = 0;
    const input = createReadStream(filename);
    const gzip = createGzip({ level: 9 });
    input.once("error", reject);
    gzip.once("error", reject);
    gzip.on("data", (chunk) => {
      bytes += chunk.length;
    });
    gzip.once("end", () => resolve(bytes));
    input.pipe(gzip);
  });
}
