import {
  createElement,
  createHostedCanvasRoot,
  getByRole,
  queryAllByRole,
  type PaintedTextSnapshot,
} from "@dopejs/pingo";
import { afterEach, describe, expect, it } from "vitest";

/**
 * The painted-text render oracle, cross-checked against the semantic tree.
 *
 * The semantic tree says what the Scene *means*; this says what paint *drew*.
 * Between them sit visibility, `display: none`, paint order, virtualization and
 * the subtree cache, and under incremental Pictures the frame's DisplayList is
 * a single `DrawPicture` -- so neither the DisplayList nor the semantic tree
 * can answer "did the user actually see that string". A real browser is where
 * both halves run against the shipped WASM Core.
 */
describe("painted-text render oracle", () => {
  const roots: Array<{ close(): Promise<void> }> = [];

  afterEach(async () => {
    for (const root of roots.splice(0).reverse()) await root.close();
    document.body.replaceChildren();
  });

  it("agrees with the semantic tree, and omits what was never drawn", async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 200;
    document.body.append(canvas);
    const snapshots: PaintedTextSnapshot[] = [];
    const errors: Error[] = [];
    const root = await createHostedCanvasRoot(canvas, {
      onPaintedText: (snapshot) => snapshots.push(snapshot),
      onHostError: (error) => errors.push(error),
      transport: { preference: "main-thread", strict: true },
    });
    roots.push(root);
    root.render(
      createElement("container", {
        children: [
          createElement("container", {
            semanticRole: "button",
            semanticLabel: "Save",
            children: createElement("text", { value: "Save" }),
          }),
          createElement("container", {
            style: { display: "none" },
            children: createElement("text", { value: "never-drawn" }),
          }),
        ],
      }),
    );

    await withTimeout(
      waitUntil(() => queryAllByRole(document.body, "button").length === 1),
      3_000,
      "semantic mirror population",
    );
    // The mirror is fed by the same frame the probe describes, but the two
    // arrive as separate callbacks, so wait for the render side too.
    await withTimeout(
      waitUntil(() => painted().some((record) => record.text === "Save")),
      3_000,
      "painted-text population",
    );

    // The semantic claim and the render claim must be about the same node.
    const button = getByRole(document.body, "button", { name: "Save" });
    expect(button.getBoundingClientRect().width).toBeGreaterThan(0);
    const save = painted().find((record) => record.text === "Save");
    expect(save).toBeDefined();
    expect(save?.unattributed).toBe(false);
    expect(save?.originClipped).toBe(false);

    // `display: none` removes a node from paint entirely, so its string is in
    // neither view. A snapshot test would have to be told to look for that.
    expect(painted().some((record) => record.text.includes("never-drawn"))).toBe(false);
    expect(document.body.textContent?.includes("never-drawn")).toBe(false);

    expect(snapshots.at(-1)?.truncated).toBe(false);
    expect(root.paintedText()).toEqual(snapshots.at(-1));
    expect(errors).toEqual([]);

    function painted(): PaintedTextSnapshot["records"] {
      return snapshots.at(-1)?.records ?? [];
    }
  });

  it("stays inert when nothing asked for it", async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 80;
    document.body.append(canvas);
    const root = await createHostedCanvasRoot(canvas, {
      transport: { preference: "main-thread", strict: true },
    });
    roots.push(root);
    root.render(createElement("text", { value: "quiet" }));
    await new Promise<void>((resolve) => setTimeout(resolve, 50));
    // No callback, no probe: Core is never asked to walk its paint cache.
    expect(root.paintedText()).toBeUndefined();
  });

  async function waitUntil(predicate: () => boolean): Promise<void> {
    while (!predicate()) await new Promise<void>((resolve) => setTimeout(resolve, 5));
  }

  async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
    let handle: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        promise,
        new Promise<never>((_resolve, reject) => {
          handle = setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs);
        }),
      ]);
    } finally {
      if (handle !== undefined) clearTimeout(handle);
    }
  }
});
