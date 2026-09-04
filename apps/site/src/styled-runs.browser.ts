import {
  createElement,
  createHostedCanvasRoot,
  loadFont,
  type PaintedTextSnapshot,
  type PingoFont,
} from "@dopejs/pingo";
import { afterEach, describe, expect, it } from "vitest";

import wasmManifest from "../../../packages/host/wasm/manifest.json";

/**
 * A run table reaches the Core and changes what it draws.
 *
 * Everything below this is unit-tested on one side of the boundary or the
 * other: the reconciler tiles the table, the Rust decoder validates it. Neither
 * says the two halves met. The painted-text probe is Core reporting the strings
 * it actually drew, so a node that came out as one run is a node whose table
 * was ignored -- which is exactly what happens when the module is built without
 * `rich-text`.
 *
 * Both builds are pinned, not just the rich one. `PINGO_RICH_TEXT=1` is what
 * the deployed site is built with, while the published module leaves the
 * capability out to fit its budget, and "the table is ignored" is that build's
 * contract rather than an accident. A test that only ran against one of them
 * would let the other drift.
 *
 * The font is explicit because a run table needs one: without a font the Core
 * has nothing to shape with and draws the node through the host's system-font
 * fallback, which paints it in one style and never reads the table.
 */
async function waitUntil(check: () => boolean, timeoutMs = 5000): Promise<boolean> {
  const end = performance.now() + timeoutMs;
  while (performance.now() < end) {
    if (check()) return true;
    await new Promise((resolve) => setTimeout(resolve, 8));
  }
  return check();
}

describe("styled runs", () => {
  const roots: Array<{ close: () => Promise<void> }> = [];

  afterEach(async () => {
    for (const root of roots.splice(0)) await root.close();
    document.body.replaceChildren();
  });

  async function paint(node: unknown): Promise<PaintedTextSnapshot> {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 160;
    document.body.append(canvas);
    let latest: PaintedTextSnapshot | undefined;
    const root = await createHostedCanvasRoot(canvas, {
      onPaintedText: (snapshot) => {
        latest = snapshot;
      },
    });
    roots.push(root);
    root.render(node as never);
    await waitUntil(() => latest !== undefined && latest.records.length > 0);
    if (latest === undefined) throw new Error("no frame reported painted text");
    return latest;
  }

  // Codicon is an icon font, so the "characters" below are its glyphs. What
  // matters here is that it is a real SFNT the Core can shape, which is what
  // puts the node on the shaped-run channel rather than the fallback one.
  const VALUE = "\uea60\uea61\uea62\uea63\uea64\uea65\uea66";
  let font: PingoFont | undefined;

  async function codicon(): Promise<PingoFont> {
    font ??= await loadFont(
      new URL(
        "../../../node_modules/.pnpm/playwright-core@1.62.1/node_modules/playwright-core/lib/vite/traceViewer/codicon.DCmgc-ay.ttf",
        import.meta.url,
      ),
      { fallbackFamily: "Codicon" },
    );
    return font;
  }

  function paragraph(
    face: PingoFont,
    runs?: readonly { start: number; end: number; color: string }[],
  ) {
    return createElement("container", {
      width: 400,
      height: 160,
      backgroundColor: "#ffffffff",
      padding: 12,
      children: createElement("text", {
        value: VALUE,
        font: face,
        fontSize: 18,
        lineHeight: 28,
        color: "#000000ff",
        ...(runs === undefined ? {} : { runs }),
      }),
    });
  }

  /** Whether the module under test was built with the rich-text capability. */
  const rich = wasmManifest.richText;

  it("splits a value into one shaped run per span the table names", async () => {
    const face = await codicon();
    const plain = await paint(paragraph(face));
    expect(plain.records.map((record) => record.channel)).toEqual(["shapedRun"]);
    expect(plain.records.map((record) => record.text)).toEqual([VALUE]);

    const styled = await paint(paragraph(face, [{ start: 2, end: 5, color: "#ff0000" }]));
    // One node, three shaped runs: the span the caller named and the two the
    // reconciler filled around it. A module built without the capability draws
    // one, because it accepts the table and then never reads it.
    expect(styled.records).toHaveLength(rich ? 3 : 1);
    expect(styled.records.every((record) => record.channel === "shapedRun")).toBe(true);
    expect(new Set(styled.records.map((record) => record.nodeId)).size).toBe(1);
    expect(styled.records[0]?.nodeId).toBe(plain.records[0]?.nodeId);
    expect(styled.records.every((record) => !record.unattributed)).toBe(true);
    // Each record reports the node's whole value, not its own span: the
    // DisplayList carries no source range for a run, so this is the finest
    // attribution the probe can give for a shaped run.
    expect(styled.records.map((record) => record.text)).toEqual(
      Array.from({ length: rich ? 3 : 1 }, () => VALUE),
    );
  });

  it("styles a document block from the table the Shell declared", async () => {
    const face = await codicon();
    const document_ = createElement("container", {
      width: 400,
      height: 160,
      backgroundColor: "#ffffffff",
      padding: 12,
      document: { revision: 1n, blocks: [{ key: 11, lenUtf16: VALUE.length }] },
      children: createElement("text", {
        blockKey: 11,
        value: VALUE,
        font: face,
        fontSize: 18,
        lineHeight: 28,
        color: "#000000ff",
        runs: [{ start: 2, end: 5, color: "#ff0000" }],
      }),
    });
    const painted = await paint(document_);

    // A block carries an editing display, because Core owns the caret in it.
    // That display's own mark table describes what is being typed and says
    // nothing about a document nobody has typed in, and taking its silence for
    // "no styling" left every mark a document was loaded with unpainted.
    expect(painted.records).toHaveLength(rich ? 3 : 1);
    expect(new Set(painted.records.map((record) => record.nodeId)).size).toBe(1);
  });

  it("returns to one span when the table is dropped, releasing what it interned", async () => {
    const face = await codicon();
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 160;
    document.body.append(canvas);
    let latest: PaintedTextSnapshot | undefined;
    const root = await createHostedCanvasRoot(canvas, {
      onPaintedText: (snapshot) => {
        latest = snapshot;
      },
    });
    roots.push(root);

    root.render(paragraph(face, [{ start: 2, end: 5, color: "#ff0000" }]));
    const spans = rich ? 3 : 1;
    await waitUntil(() => latest !== undefined && latest.records.length === spans);
    expect(latest?.records).toHaveLength(spans);

    // The same node, now single-style. A resource the Shell released while the
    // Core still referenced it would fail the commit rather than come back as
    // one span, so this is the release path as well as the binding one.
    root.render(paragraph(face));
    await waitUntil(() => latest !== undefined && latest.records.length === 1);
    expect(latest?.records.map((record) => record.text)).toEqual([VALUE]);
    expect(root.failed).toBe(false);
  });
});
