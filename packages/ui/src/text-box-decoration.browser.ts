import { createElement, createHostedCanvasRoot, type FrameReport } from "@dopejs/pingo";
import { afterEach, describe, expect, it } from "vitest";

/**
 * A text node wears its padding and its corner radius.
 *
 * The style subset used to declare `padding-*` and `border-radius` as applying
 * to views only, so the Shell dropped them from any text node. Everything the
 * skin draws as a chip is a text node -- a pagination page, a calendar day, a
 * menubar trigger -- so each of them painted its background as a hard square
 * clamped to the glyphs: no padding to sit in and no radius to round.
 */
async function waitUntil(check: () => boolean, timeoutMs = 4000): Promise<boolean> {
  const end = performance.now() + timeoutMs;
  while (performance.now() < end) {
    if (check()) return true;
    await new Promise((resolve) => setTimeout(resolve, 8));
  }
  return check();
}

describe("text box decoration", () => {
  const roots: Array<{ close: () => Promise<void> }> = [];

  afterEach(async () => {
    for (const root of roots.splice(0)) await root.close();
    document.body.replaceChildren();
  });

  const WIDTH = 200;
  const HEIGHT = 80;

  it("pads the box and rounds the fill", async () => {
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    document.body.append(canvas);
    const frames: FrameReport[] = [];
    const root = await createHostedCanvasRoot(canvas, {
      onFrame: (report) => frames.push(report),
      transport: { preference: "main-thread", strict: true },
    });
    roots.push(root);
    root.render(
      createElement("container", {
        style: { flexDirection: "column", alignItems: "flex-start", padding: "10px" },
        children: createElement("text", {
          value: "8",
          fontSize: 16,
          color: "#ffffffff",
          style: {
            backgroundColor: "#000000",
            borderRadius: "10px",
            paddingTop: "8px",
            paddingBottom: "8px",
            paddingLeft: "14px",
            paddingRight: "14px",
          },
        }),
      }),
    );
    expect(await waitUntil(() => frames.some((frame) => frame.cause === "mutation"))).toBe(true);

    const context = canvas.getContext("2d");
    if (context === null) throw new Error("Chromium did not provide Canvas2D");
    const data = context.getImageData(0, 0, WIDTH, HEIGHT).data;
    const painted = (x: number, y: number): boolean => (data[(y * WIDTH + x) * 4 + 3] ?? 0) > 40;
    const white = (x: number, y: number): boolean => {
      const index = (y * WIDTH + x) * 4;
      return (data[index + 3] ?? 0) > 40 && (data[index] ?? 0) > 200;
    };

    let left = WIDTH;
    let top = HEIGHT;
    let right = -1;
    let bottom = -1;
    for (let y = 0; y < HEIGHT; y += 1) {
      for (let x = 0; x < WIDTH; x += 1) {
        if (!painted(x, y)) continue;
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
    }
    // The chip is the glyph plus 14px each side and 8px above and below. A "8"
    // at 16px is around 9px wide, so the box clears 30 either way -- it was the
    // bare glyph before, under 12px wide.
    expect(right - left + 1).toBeGreaterThan(30);
    expect(bottom - top + 1).toBeGreaterThan(28);

    // The corner is inside a 10px radius, so nothing is painted there.
    expect(painted(left, top)).toBe(false);
    expect(painted(left + 1, top + 1)).toBe(false);
    // The middle of the box is filled, and the glyph inside it is white.
    const midX = Math.round((left + right) / 2);
    const midY = Math.round((top + bottom) / 2);
    expect(painted(midX, midY)).toBe(true);
    let glyph = false;
    for (let y = top; y <= bottom; y += 1) {
      for (let x = left; x <= right; x += 1) if (white(x, y)) glyph = true;
    }
    expect(glyph).toBe(true);

    // The glyph sits inside the padding rather than at the box's own origin:
    // the first 10 columns of the chip are background only.
    let inkInPadding = false;
    for (let y = top; y <= bottom; y += 1) {
      for (let x = left; x < left + 10; x += 1) if (white(x, y)) inkInPadding = true;
    }
    expect(inkInPadding).toBe(false);
  }, 60_000);
});
