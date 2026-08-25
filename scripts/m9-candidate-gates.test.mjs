import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import {
  GATE_CONTEXT_PASSED,
  GATE_CONTEXT_STANDALONE,
  GATES_PASSED_FLAG,
  REQUIRED_GATES,
} from "./m9-candidate-gates.mjs";

const packageManifest = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);
const scripts = packageManifest.scripts;
const candidateScript = await readFile(
  new URL("./m9-candidate-report.mjs", import.meta.url),
  "utf8",
);

describe("release candidate gate provenance", () => {
  it("names only gates a reviewer can re-run", () => {
    const named = REQUIRED_GATES.filter((gate) => gate.includes(":"));
    expect(named.length).toBeGreaterThan(0);
    for (const gate of named) expect(Object.keys(scripts)).toContain(gate);
  });

  it("describes the remaining gates without inventing script names", () => {
    for (const gate of REQUIRED_GATES) {
      if (gate.includes(":")) continue;
      expect(gate).toMatch(/^[A-Za-z0-9]+(-[A-Za-z0-9]+)+$/u);
    }
  });

  // The flag is the only way a report can claim its gates passed, so a
  // release:gate that forgets it silently downgrades every candidate report to
  // `standalone-report-only` while the release procedure still promises the
  // stronger value.
  it("lets release:gate reach the passed context", () => {
    expect(scripts["release:gate"]).toContain(`pnpm m9:candidate ${GATES_PASSED_FLAG}`);
    expect(candidateScript).toContain("process.argv.includes(GATES_PASSED_FLAG)");
  });

  it("keeps the two contexts distinguishable", () => {
    expect(GATE_CONTEXT_PASSED).not.toBe(GATE_CONTEXT_STANDALONE);
    expect(scripts["m9:candidate"]).toBeDefined();
  });
});
