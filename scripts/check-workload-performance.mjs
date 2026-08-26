import { spawn } from "node:child_process";
import path from "node:path";

/**
 * Runs the workload benchmark and validates its report.
 *
 * Deliberately threshold-free for now. The milestone gates each assert an
 * absolute budget, and adding one here would mean inventing a number: these
 * scenarios were written to characterise workloads the portfolio never
 * covered -- a dense screen, a document reflowing after a mid-document edit,
 * and a scattered update pattern -- and their first measurements are the
 * finding rather than a passing grade. `scattered-mixed-5000` sits at 8.2ms
 * P95 on an M4 Pro; the CI runner measures `m1` about twice as slow, so any
 * ceiling tight enough to be meaningful today would flake there.
 *
 * What it does enforce is that the report stays well-formed and that every
 * scenario keeps reporting its layout counters, because those counters are
 * what made the dominant cost visible and a report that quietly stopped
 * emitting them would hide it again.
 */
const repositoryRoot = path.resolve(import.meta.dirname, "..");
const REQUIRED_SCENARIOS = [
  "dense-ui",
  "long-document-edit",
  "scattered-paint-5000",
  "scattered-mixed-5000",
];
const REQUIRED_FIELDS = [
  "nodes",
  "samples",
  "initialMs",
  "p50Ms",
  "p95Ms",
  "p99Ms",
  "maxMs",
  "droppedFrameRate",
  "dirtyLayoutNodes",
  "layoutVisitedNodes",
  "layoutChangedNodes",
  "dirtyPaintNodes",
];

const output = await run("cargo", [
  "run",
  "--locked",
  "--release",
  "--quiet",
  "--package",
  "pingo-core",
  "--example",
  "workload_benchmark",
]);
const report = JSON.parse(output.trim().split(/\r?\n/u).at(-1) ?? "null");
if (report === null || report.version !== 1 || !Array.isArray(report.scenarios)) {
  throw new Error("workload benchmark emitted an invalid report");
}
const seen = report.scenarios.map((scenario) => scenario.scenario);
for (const name of REQUIRED_SCENARIOS) {
  if (!seen.includes(name)) throw new Error(`workload report is missing ${name}`);
}
for (const scenario of report.scenarios) {
  for (const field of REQUIRED_FIELDS) {
    if (!Number.isFinite(scenario[field])) {
      throw new Error(`workload ${scenario.scenario} reported no ${field}`);
    }
  }
  if (scenario.p99Ms < scenario.p95Ms || scenario.maxMs < scenario.p99Ms) {
    throw new Error(`workload ${scenario.scenario} percentiles are not monotonic`);
  }
  // A layout pass cannot visit fewer nodes than it dirtied, and cannot visit
  // more than the scene holds plus its root. Either would mean the counter,
  // not the engine, is wrong -- and the counter is the instrument here.
  if (scenario.layoutVisitedNodes > 0 && scenario.layoutVisitedNodes < scenario.dirtyLayoutNodes) {
    throw new Error(`workload ${scenario.scenario} visited fewer nodes than it dirtied`);
  }
  if (scenario.layoutVisitedNodes > scenario.nodes + 1) {
    throw new Error(`workload ${scenario.scenario} visited more nodes than the scene holds`);
  }
}
for (const scenario of report.scenarios) {
  process.stdout.write(
    `workload ${scenario.scenario}: P95 ${scenario.p95Ms.toFixed(3)}ms, ` +
      `layout dirty ${String(scenario.dirtyLayoutNodes)} -> visited ${String(scenario.layoutVisitedNodes)} ` +
      `of ${String(scenario.nodes)}\n`,
  );
}

function run(command, arguments_) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, arguments_, {
      cwd: repositoryRoot,
      stdio: ["ignore", "pipe", "inherit"],
    });
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
