import { readdir, readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

// pingo has no descendant selectors, so dark is a same-node compound rule
// (`.pui-card.pui-dark`) and every themed node has to carry the marker itself.
// When each component derived the marker by hand -- through four different
// idioms, at one point -- a component could skip the step, and skipping it
// fails silently: it renders its light skin on a dark surface with nothing red
// anywhere. `skin()` in packages/ui/src/theme.ts is the sole owner of the
// literal now, and that ownership is what this guards.
const componentsDir = new URL("../packages/ui/src/components/", import.meta.url);
const themeModule = new URL("../packages/ui/src/theme.ts", import.meta.url);
const MARKER = "pui-dark";

describe("the dark marker has one owner", () => {
  it("appears in no component source", async () => {
    const entries = await readdir(componentsDir);
    const sources = entries.filter((entry) => entry.endsWith(".ts") && !entry.endsWith(".test.ts"));
    expect(sources.length).toBeGreaterThan(0);
    const offenders = [];
    for (const entry of sources) {
      const source = await readFile(new URL(entry, componentsDir), "utf8");
      if (source.includes(MARKER)) offenders.push(entry);
    }
    expect(offenders).toStrictEqual([]);
  });

  it("is still applied by skin", async () => {
    expect(await readFile(themeModule, "utf8")).toContain(MARKER);
  });
});
