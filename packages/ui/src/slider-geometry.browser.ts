import { createElement, createHostedCanvasRoot, type FrameReport } from "@dopejs/pingo";
import { Slider, createPingoUiStyleSheet } from "@dopejs/pingo-ui";
import { afterEach, describe, expect, it } from "vitest";

/**
 * The thumb sits on the track, at the end of the filled range.
 *
 * Every part of a slider is absolutely positioned with no `top`, which in CSS
 * means the static position: where the child would sit as the container's only
 * flex item. The engine read auto insets as the content box's corner instead,
 * so the 6px track and the 16px thumb both started at the top edge and the
 * thumb hung five pixels below the line it belongs on. The skin was also
 * centring on the wrong axis -- `justify-content` on a row centres along it,
 * and every part here is out of flow, so it centred nothing.
 */
const pause = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

describe("slider geometry", () => {
  const roots: Array<{ close: () => Promise<void> }> = [];

  afterEach(async () => {
    for (const root of roots.splice(0)) await root.close();
    document.body.replaceChildren();
  });

  const WIDTH = 400;
  const HEIGHT = 80;
  const PADDING = 20;
  const TRACK = WIDTH - 2 * PADDING;

  it("centres the track and the thumb on one line", async () => {
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.cssText = `display:block;width:${String(WIDTH)}px;height:${String(HEIGHT)}px`;
    document.body.append(canvas);
    const frames: FrameReport[] = [];
    const root = await createHostedCanvasRoot(canvas, {
      styleSheets: [createPingoUiStyleSheet()],
      onFrame: (report) => frames.push(report),
      transport: { preference: "main-thread", strict: true },
    });
    roots.push(root);
    root.render(
      createElement("container", {
        width: WIDTH,
        height: HEIGHT,
        backgroundColor: "#ffffffff",
        style: { flexDirection: "column", padding: `${String(PADDING)}px` },
        children: createElement(Slider, { defaultValue: 40, semanticLabel: "音量" }),
      }),
    );
    expect(
      await (async (): Promise<boolean> => {
        const end = performance.now() + 4000;
        while (performance.now() < end) {
          if (frames.some((frame) => frame.cause === "mutation")) return true;
          await pause(16);
        }
        return false;
      })(),
    ).toBe(true);
    await pause(250);

    const context = canvas.getContext("2d");
    if (context === null) throw new Error("Chromium did not provide Canvas2D");
    const data = context.getImageData(0, 0, WIDTH, HEIGHT).data;
    const dark = (x: number, y: number): boolean => {
      const index = (y * WIDTH + x) * 4;
      return (data[index] ?? 255) < 120 && (data[index + 3] ?? 0) > 200;
    };
    /** Rows holding ink, and the horizontal span of each. */
    const rows = new Map<number, { first: number; last: number }>();
    for (let y = 0; y < HEIGHT; y += 1) {
      let first = -1;
      let last = -1;
      for (let x = 0; x < WIDTH; x += 1) {
        if (!dark(x, y)) continue;
        if (first < 0) first = x;
        last = x;
      }
      if (first >= 0) rows.set(y, { first, last });
    }
    const inked = [...rows.keys()];
    const top = Math.min(...inked);
    const bottom = Math.max(...inked);

    // The thumb is the tallest part, 16px, and the slider's box is 20px tall
    // inside 20px of padding: centred, it runs from 22 to 37 around 29.5.
    const middle = PADDING + 10;
    expect(bottom - top + 1).toBe(16);
    expect(Math.abs((top + bottom + 1) / 2 - middle)).toBeLessThanOrEqual(1);

    // The filled range starts at the track's left edge and is 6px tall, so the
    // rows that reach it are the middle six of the sixteen -- centred on the
    // same line, which is the whole point.
    const filled = inked.filter((y) => (rows.get(y)?.first ?? WIDTH) <= PADDING + 1);
    expect(filled).toHaveLength(6);
    const filledMiddle = (Math.min(...filled) + Math.max(...filled) + 1) / 2;
    expect(Math.abs(filledMiddle - middle)).toBeLessThanOrEqual(1);

    // The thumb is centred on the value, not hung off its right: 40% of the
    // track, and its own 16px split either side of that.
    const value = PADDING + TRACK * 0.4;
    const thumbRow = rows.get(top);
    expect(thumbRow).toBeDefined();
    const thumbCentre = ((thumbRow?.first ?? 0) + (thumbRow?.last ?? 0)) / 2;
    expect(Math.abs(thumbCentre - value)).toBeLessThanOrEqual(2);
  }, 60_000);
});
