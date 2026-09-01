import { spawn } from "node:child_process";

/**
 * The E15 exit gate is that editing latency does not grow with document
 * length, so the growth ratio is the assertion and the absolute limits are the
 * floor under it. The ratio band is generous in both directions on purpose:
 * the two runs are measured back to back on the same machine, so a ratio near
 * one is the signal and anything far from one is worth reading, whichever way
 * it points.
 */
const maximumGrowthRatio = 1.25;
const maximumP95Ms = 8;
const maximumP99Ms = 16.7;
const maximumDroppedFrameRate = 0.005;

const output = await runCapture("cargo", [
  "run",
  "--locked",
  "--release",
  "--package",
  "pingo-core",
  "--example",
  "e15_document_benchmark",
]);
const line = output
  .trim()
  .split("\n")
  .findLast((candidate) => candidate.startsWith("{"));
if (line === undefined) throw new Error("E15 document benchmark produced no JSON report");
const report = JSON.parse(line);
for (const field of ["shortP95Ms", "longP95Ms", "longP99Ms", "growthRatio", "droppedFrameRate"]) {
  if (typeof report[field] !== "number" || !Number.isFinite(report[field])) {
    throw new Error(`E15 document benchmark field ${field} is invalid`);
  }
}
if (report.longBlocks < 5000) {
  throw new Error(`E15 document fixture is ${String(report.longBlocks)} blocks; 5000 is the floor`);
}
if (report.growthRatio > maximumGrowthRatio) {
  throw new Error(
    `E15 editing latency grew ${String(report.growthRatio)}x from ${String(
      report.shortBlocks,
    )} to ${String(report.longBlocks)} blocks; the limit is ${String(maximumGrowthRatio)}x`,
  );
}
if (report.longP95Ms > maximumP95Ms) {
  throw new Error(
    `E15 editing P95 ${String(report.longP95Ms)}ms exceeds ${String(maximumP95Ms)}ms`,
  );
}
if (report.longP99Ms > maximumP99Ms) {
  throw new Error(
    `E15 editing P99 ${String(report.longP99Ms)}ms exceeds ${String(maximumP99Ms)}ms`,
  );
}
if (report.droppedFrameRate >= maximumDroppedFrameRate) {
  throw new Error(
    `E15 dropped-frame rate ${String(report.droppedFrameRate)} must be below ${String(
      maximumDroppedFrameRate,
    )}`,
  );
}
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

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
