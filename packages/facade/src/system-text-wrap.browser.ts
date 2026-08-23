import { createElement, createRoot, createWasmCore, type PingoNode } from "@dopejs/pingo";
import { afterEach, describe, expect, it } from "vitest";

/**
 * System-font fallback wrapping against the browser's own measurements.
 *
 * Core breaks fallback lines from the per-code-point advances the Host measures.
 * Those were requested only for editable runs, so ordinary text wrapped against
 * an estimate of 0.6em per code point: a full-width CJK run was thought to be
 * 40% narrower than the browser draws it, never reached the wrap width, and ran
 * out of whatever box it was in. Only a real browser can measure this, which is
 * why it is a browser test rather than a unit test.
 */
describe("system-font fallback wrapping", () => {
  const disposals: Array<() => void> = [];

  afterEach(() => {
    for (const dispose of disposals.splice(0).reverse()) dispose();
    document.body.replaceChildren();
  });

  const WIDTH = 800;
  const HEIGHT = 200;
  const PADDING = 24;
  const BOX = 340;

  async function render(value: string): Promise<CanvasRenderingContext2D> {
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    document.body.append(canvas);
    const context = canvas.getContext("2d", { alpha: true });
    if (context === null) throw new Error("Chromium did not provide Canvas2D");
    const core = await createWasmCore(canvas.width, canvas.height);
    disposals.push(() => core.free?.());
    const root = createRoot(context, core);
    disposals.push(() => root.unmount());
    root.render(card(value));
    return context;
  }

  function card(value: string): PingoNode {
    return createElement("container", {
      width: BOX,
      style: {
        flexDirection: "column",
        padding: `${String(PADDING)}px`,
        backgroundColor: "#ffffff",
      },
      children: createElement("text", { value }),
    });
  }

  /** Bounding box of everything drawn that is not the white card background. */
  function inkBox(context: CanvasRenderingContext2D): {
    readonly right: number;
    readonly height: number;
  } {
    const data = context.getImageData(0, 0, WIDTH, HEIGHT).data;
    let right = -1;
    let top = HEIGHT;
    let bottom = -1;
    for (let y = 0; y < HEIGHT; y += 1) {
      for (let x = 0; x < WIDTH; x += 1) {
        const index = (y * WIDTH + x) * 4;
        if ((data[index + 3] ?? 0) < 20) continue;
        if (
          (data[index] ?? 0) > 240 &&
          (data[index + 1] ?? 0) > 240 &&
          (data[index + 2] ?? 0) > 240
        )
          continue;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
    return { right, height: bottom - top + 1 };
  }

  it("keeps a full-width run inside its box by wrapping it", async () => {
    const context = await render("将你的更改同步到所有设备，或仅保存在本地。");
    const ink = inkBox(context);
    expect(ink.right).toBeGreaterThan(0);
    expect(ink.right).toBeLessThanOrEqual(BOX - PADDING);
    // One 16px line of glyphs cannot be this tall; two lines of 19.2px can.
    expect(ink.height).toBeGreaterThan(20);
  });

  it("leaves a run that fits on the line it was measured on", async () => {
    const context = await render("Sync your changes.");
    const ink = inkBox(context);
    expect(ink.right).toBeLessThanOrEqual(BOX - PADDING);
    expect(ink.height).toBeLessThanOrEqual(20);
  });
});
