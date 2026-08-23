import { createElement, createRoot, createWasmCore, type PingoNode } from "@dopejs/pingo";
import { afterEach, describe, expect, it } from "vitest";

/**
 * Rounded `FillColorBorder` geometry against real Canvas2D pixels.
 *
 * The fake-context replay tests cover the command decoding; only real pixels
 * show whether the ring between the outer and the inner corner arc is actually
 * covered. It was not: the side wedges stopped at the padding-box corners,
 * which is the right boundary only for a square corner, so every rounded corner
 * lost the curved part of its border and showed the background through it.
 */
describe("rounded color border", () => {
  const disposals: Array<() => void> = [];

  afterEach(() => {
    for (const dispose of disposals.splice(0).reverse()) dispose();
    document.body.replaceChildren();
  });

  async function render(node: PingoNode): Promise<CanvasRenderingContext2D> {
    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 120;
    document.body.append(canvas);
    const context = canvas.getContext("2d", { alpha: true });
    if (context === null) throw new Error("Chromium did not provide Canvas2D");
    const core = await createWasmCore(canvas.width, canvas.height);
    disposals.push(() => core.free?.());
    const root = createRoot(context, core);
    disposals.push(() => root.unmount());
    root.render(node);
    return context;
  }

  /** `[red, green, blue, alpha]` at one device pixel. */
  function pixel(context: CanvasRenderingContext2D, x: number, y: number): readonly number[] {
    return [...context.getImageData(x, y, 1, 1).data];
  }

  // A 20px corner radius with a 6px border: the ring at the corner runs between
  // an outer arc of radius 20 and an inner arc of radius 14, both centred on
  // (20, 20). Samples sit well inside a band rather than on an edge so
  // antialiasing cannot decide the assertion.
  const box = {
    borderRadius: "20px",
    borderStyle: "solid",
    borderWidth: "6px",
    backgroundColor: "#ffffff",
  } as const;

  it("paints the ring between the outer and inner corner arc", async () => {
    const context = await render(
      createElement("container", {
        width: 120,
        height: 80,
        style: { ...box, borderColor: "#ff0000" },
      }),
    );
    // Radius 17 at 225 degrees: inside the ring, on the corner diagonal.
    expect(pixel(context, 8, 8)).toEqual([255, 0, 0, 255]);
    // Radius 10: inside the inner arc, so the background and not the border.
    expect(pixel(context, 13, 13)).toEqual([255, 255, 255, 255]);
    // Radius 24: outside the outer arc, so nothing was painted at all.
    expect(pixel(context, 3, 3)).toEqual([0, 0, 0, 0]);
    // The straight runs stay put: 3px into the top edge, away from both corners.
    expect(pixel(context, 60, 3)).toEqual([255, 0, 0, 255]);
    expect(pixel(context, 60, 8)).toEqual([255, 255, 255, 255]);
  });

  it("splits a corner between two side colors along the corner diagonal", async () => {
    const context = await render(
      createElement("container", {
        width: 120,
        height: 80,
        style: {
          ...box,
          borderTopColor: "#ff0000",
          borderRightColor: "#ff0000",
          borderBottomColor: "#ff0000",
          borderLeftColor: "#00c000",
        },
      }),
    );
    // Both samples sit in the same corner ring, on opposite sides of the
    // diagonal through the centre of the corner circle.
    expect(pixel(context, 3, 17)).toEqual([0, 192, 0, 255]);
    expect(pixel(context, 17, 3)).toEqual([255, 0, 0, 255]);
    // And the ring is covered on the diagonal itself, where the two wedges meet
    // and antialiasing blends them. Only the blue channel separates either
    // border color from the white background underneath.
    const seam = pixel(context, 8, 8);
    expect([seam[2], seam[3]]).toEqual([0, 255]);
  });
});
