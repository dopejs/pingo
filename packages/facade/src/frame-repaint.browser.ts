import { createElement, createRoot, createWasmCore } from "@dopejs/pingo";
import { afterEach, describe, expect, it } from "vitest";

/**
 * Every presented frame is a full repaint.
 *
 * Core emits no damage rectangles and the DisplayList has no clear command, so
 * the presentation path has to drop the previous frame before replaying the
 * next one. It did not, and every state change that made something smaller,
 * moved it, or removed it left the old pixels on the canvas underneath -- a
 * collapsed section, a scrolled row, and a dropped hover background all ghosted.
 */
describe("frame presentation", () => {
  const disposals: Array<() => void> = [];

  afterEach(() => {
    for (const dispose of disposals.splice(0).reverse()) dispose();
    document.body.replaceChildren();
  });

  async function mount(): Promise<{
    readonly context: CanvasRenderingContext2D;
    readonly root: ReturnType<typeof createRoot>;
  }> {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;
    document.body.append(canvas);
    const context = canvas.getContext("2d", { alpha: true });
    if (context === null) throw new Error("Chromium did not provide Canvas2D");
    const core = await createWasmCore(canvas.width, canvas.height);
    disposals.push(() => core.free?.());
    const root = createRoot(context, core);
    disposals.push(() => root.unmount());
    return { context, root };
  }

  function pixel(context: CanvasRenderingContext2D, x: number, y: number): readonly number[] {
    return [...context.getImageData(x, y, 1, 1).data];
  }

  it("leaves nothing of the previous frame where the new one draws nothing", async () => {
    const { context, root } = await mount();
    root.render(
      createElement("container", { width: 150, height: 150, backgroundColor: "#ff0000" }),
    );
    expect(pixel(context, 120, 120)).toEqual([255, 0, 0, 255]);

    root.render(createElement("container", { width: 40, height: 40, backgroundColor: "#0000ff" }));
    expect(pixel(context, 120, 120)).toEqual([0, 0, 0, 0]);
    expect(pixel(context, 20, 20)).toEqual([0, 0, 255, 255]);
  });

  it("leaves nothing behind when a subtree is removed entirely", async () => {
    const { context, root } = await mount();
    const panel = (open: boolean) =>
      createElement("container", {
        width: 100,
        style: { flexDirection: "column" },
        children: [
          createElement("container", { width: 100, height: 20, backgroundColor: "#008000" }),
          ...(open
            ? [createElement("container", { width: 100, height: 60, backgroundColor: "#ff0000" })]
            : []),
        ],
      });

    root.render(panel(true));
    expect(pixel(context, 50, 50)).toEqual([255, 0, 0, 255]);
    root.render(panel(false));
    expect(pixel(context, 50, 50)).toEqual([0, 0, 0, 0]);
    // The part that stayed is still drawn.
    expect(pixel(context, 50, 10)).toEqual([0, 128, 0, 255]);
  });
});
