import { spawn } from "node:child_process";

// Measured on the reference machine: probe P95 75us at 400 rows and 642us at
// 4,000 rows, against frame P95 of 1.2ms and 12ms for the same scenes. The
// bounds below sit well clear of that while still failing if the query stops
// being pollable from an end-to-end test.
//
// The growth bound is the real assertion. The probe walks the retained paint
// tree once, so a 10x scene must cost about 10x; anything approaching 100x
// means something turned the walk quadratic.
const maximumProbeP95Micros = 4_000;
const maximumProbeShareOfFrame = 0.5;
const maximumGrowthFactor = 20;

const output = await runCapture("cargo", [
  "run",
  "--locked",
  "--release",
  "--package",
  "pingo-core",
  "--example",
  "e14_painted_text_benchmark",
]);
const line = output
  .trim()
  .split("\n")
  .findLast((candidate) => candidate.startsWith("{"));
if (line === undefined) throw new Error("E14 painted-text benchmark produced no JSON report");
const report = JSON.parse(line);
if (!Array.isArray(report.cases) || report.cases.length === 0) {
  throw new Error("E14 painted-text benchmark reported no cases");
}

for (const entry of report.cases) {
  for (const field of ["rows", "records", "probeP50Micros", "probeP95Micros", "frameP95Micros"]) {
    if (typeof entry[field] !== "number" || !Number.isFinite(entry[field])) {
      throw new Error(`E14 painted-text benchmark field ${field} is invalid`);
    }
  }
  // A run that reported nothing would look arbitrarily fast.
  if (entry.records !== entry.rows) {
    throw new Error(
      `E14 case ${String(entry.rows)} rows reported ${String(entry.records)} painted records`,
    );
  }
  if (entry.probeP95Micros > maximumProbeP95Micros) {
    throw new Error(
      `E14 probe P95 ${String(entry.probeP95Micros)}us exceeds ${String(maximumProbeP95Micros)}us`,
    );
  }
  const share = entry.probeP95Micros / entry.frameP95Micros;
  if (share > maximumProbeShareOfFrame) {
    throw new Error(
      `E14 probe costs ${(share * 100).toFixed(1)}% of the frame it describes, above ${String(
        maximumProbeShareOfFrame * 100,
      )}%`,
    );
  }
}

const byRows = new Map();
for (const entry of report.cases) {
  const existing = byRows.get(entry.rows);
  if (existing === undefined || entry.probeP50Micros < existing) {
    byRows.set(entry.rows, entry.probeP50Micros);
  }
}
const sizes = [...byRows.keys()].sort((left, right) => left - right);
if (sizes.length < 2) throw new Error("E14 benchmark needs two scene sizes");
const smallest = sizes[0];
const largest = sizes[sizes.length - 1];
const growth = byRows.get(largest) / byRows.get(smallest);
if (growth > maximumGrowthFactor) {
  throw new Error(
    `E14 probe grew ${growth.toFixed(2)}x for a ${(largest / smallest).toFixed(0)}x scene, above ${String(maximumGrowthFactor)}x`,
  );
}

process.stdout.write(`${JSON.stringify({ ...report, probeGrowthFactor: growth }, null, 2)}\n`);

function runCapture(command, arguments_) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, arguments_, { stdio: ["ignore", "pipe", "inherit"] });
    let stdout = "";
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve(stdout);
      else
        reject(new Error(`${command} failed with code ${String(code)} signal ${String(signal)}`));
    });
  });
}
