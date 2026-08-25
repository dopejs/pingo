/**
 * The gate names a release candidate report cites as its provenance.
 *
 * A reviewer reads the report to decide whether a commit may be released, so
 * every name here has to be something they can actually re-run or look up.
 * Entries containing ":" are pnpm scripts and `m9-candidate-gates.test.mjs`
 * cross-checks them against package.json; the rest name a capability that
 * several scripts cover together. That check exists because the first entry
 * used to be `m8:check`, which stopped being a script when the per-milestone
 * chains were flattened, leaving the audit artifact pointing at nothing.
 */
export const REQUIRED_GATES = Object.freeze([
  "check:full",
  "picture-contracts",
  "optimized-inline-browser-differential",
  "main-postMessage-SAB-lifecycle",
  "native-wasm-differential",
  "rich-scroll-performance",
  "accelerated-30-minute-soak",
  "wasm-reproducibility-and-budget",
  "qualification-v2",
  "api-abi-snapshots",
  "release-tarballs",
]);

/** The report ran as the last step of a `release:gate` whose gates all passed. */
export const GATE_CONTEXT_PASSED = "passed-in-current-release-gate";

/** The report was produced on its own, so it says nothing about the gates. */
export const GATE_CONTEXT_STANDALONE = "standalone-report-only";

/** The flag `release:gate` passes to claim {@link GATE_CONTEXT_PASSED}. */
export const GATES_PASSED_FLAG = "--gates-passed";
