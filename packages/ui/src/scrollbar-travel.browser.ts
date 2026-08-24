import { createElement, createHostedCanvasRoot, type FrameReport } from "@dopejs/pingo";
import { Label, ScrollArea, createPingoUiStyleSheet } from "@dopejs/pingo-ui";
import { afterEach, describe, expect, it } from "vitest";

/**
 * The scrollbar's thumb travels the whole track.
 *
 * The thumb's offset was a `margin-top` percentage, and a percentage margin
 * resolves against the containing block's *width* in CSS. The bar is 8px wide
 * and its track 200px tall, so a thumb that should have run the length of the
 * track moved eight pixels in total -- a scrollbar that looked stuck while the
 * content beside it moved.
 */
const pause = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

describe("scrollbar travel", () => {
  const roots: Array<{ close: () => Promise<void> }> = [];

  afterEach(async () => {
    for (const root of roots.splice(0)) await root.close();
    document.body.replaceChildren();
  });

  const WIDTH = 300;
  const HEIGHT = 240;
  const AREA = 200;

  it("moves the thumb from the top of the track to the bottom", async () => {
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
        style: { flexDirection: "column", padding: "20px" },
        children: createElement("container", {
          width: 260,
          height: AREA,
          style: { flexDirection: "column" },
          children: createElement(ScrollArea, {
            children: Array.from({ length: 20 }, (_, index) =>
              createElement("container", {
                key: String(index),
                padding: 8,
                children: createElement(Label, { children: `row ${String(index)}` }),
              }),
            ),
          }),
        }),
      }),
    );
    while (!frames.some((frame) => frame.cause === "mutation")) await pause(16);
    await pause(400);

    const context = canvas.getContext("2d");
    if (context === null) throw new Error("Chromium did not provide Canvas2D");
    /** Top and bottom of the thumb, found by its own grey in the bar column. */
    const thumb = (): { top: number; bottom: number } => {
      const data = context.getImageData(0, 0, WIDTH, HEIGHT).data;
      let best: { top: number; bottom: number; count: number } | undefined;
      for (let x = WIDTH - 1; x >= WIDTH * 0.7; x -= 1) {
        let top = -1;
        let bottom = -1;
        let count = 0;
        for (let y = 0; y < HEIGHT; y += 1) {
          const index = (y * WIDTH + x) * 4;
          const red = data[index] ?? 255;
          const blue = data[index + 2] ?? 255;
          if (red > 80 && red < 150 && Math.abs(red - blue) < 25 && (data[index + 3] ?? 0) > 200) {
            if (top < 0) top = y;
            bottom = y;
            count += 1;
          }
        }
        if (count > 20 && (best === undefined || count > best.count)) best = { top, bottom, count };
      }
      if (best === undefined) throw new Error("no thumb drawn");
      return { top: best.top, bottom: best.bottom };
    };

    const rest = thumb();
    // Twenty rows of ~33px against a 200px viewport: the thumb is a third of
    // the track and starts at its top.
    expect(rest.bottom - rest.top).toBeGreaterThan(20);
    expect(rest.bottom - rest.top).toBeLessThan(AREA - 20);

    const rect = canvas.getBoundingClientRect();
    for (let step = 0; step < 12; step += 1) {
      canvas.dispatchEvent(
        new WheelEvent("wheel", {
          bubbles: true,
          cancelable: true,
          clientX: rect.left + 100,
          clientY: rect.top + 100,
          deltaY: 80,
          deltaMode: 0,
        }),
      );
      await pause(60);
    }
    await pause(400);

    const end = thumb();
    // It kept its length and ran to the far end of the track: before the fix
    // it travelled the bar's own 8px width and stopped.
    expect(end.bottom - end.top).toBe(rest.bottom - rest.top);
    expect(end.top - rest.top).toBeGreaterThan(AREA / 3);
    expect(end.bottom).toBeGreaterThan(rest.bottom + AREA / 3);
  }, 60_000);
});
