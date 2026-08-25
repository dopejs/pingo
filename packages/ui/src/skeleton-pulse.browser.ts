import { createElement, createHostedCanvasRoot, type FrameReport } from "@dopejs/pingo";
import { Skeleton, createPingoUiStyleSheet } from "@dopejs/pingo-ui";
import { afterEach, describe, expect, it } from "vitest";

/**
 * A skeleton pulses, and Core owns the pulse.
 *
 * It was a still grey box: shadcn's placeholder is `animate-pulse`, and a
 * placeholder that does not move reads as content that failed to load rather
 * than content on its way. The timeline belongs to Core so the pulse keeps
 * running while the Shell is busy -- which is exactly when a placeholder is
 * on screen.
 */
const pause = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

describe("skeleton pulse", () => {
  const roots: Array<{ close: () => Promise<void> }> = [];

  afterEach(async () => {
    for (const root of roots.splice(0)) await root.close();
    document.body.replaceChildren();
  });

  const WIDTH = 200;
  const HEIGHT = 100;

  async function sample(animated: boolean): Promise<{ values: number[]; frames: number }> {
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.cssText = `display:block;width:${String(WIDTH)}px;height:${String(HEIGHT)}px`;
    document.body.append(canvas);
    const reports: FrameReport[] = [];
    const root = await createHostedCanvasRoot(canvas, {
      styleSheets: [createPingoUiStyleSheet()],
      onFrame: (report) => reports.push(report),
      transport: { preference: "main-thread", strict: true },
    });
    roots.push(root);
    root.render(
      createElement("container", {
        width: WIDTH,
        height: HEIGHT,
        backgroundColor: "#ffffffff",
        style: { flexDirection: "column", padding: "20px" },
        children: createElement(Skeleton, { width: 160, height: 40, animated }),
      }),
    );
    while (!reports.some((report) => report.cause === "mutation")) await pause(16);
    const context = canvas.getContext("2d");
    if (context === null) throw new Error("Chromium did not provide Canvas2D");
    // The bar's own grey, read at its centre: the pulse fades it towards the
    // white behind it and back.
    const grey = (): number => context.getImageData(100, 40, 1, 1).data[0] ?? 0;
    const values: number[] = [];
    for (let step = 0; step < 14; step += 1) {
      await pause(120);
      values.push(grey());
    }
    const frames = reports.filter((report) => report.cause === "animation").length;
    return { values, frames };
  }

  it("fades and returns, on frames Core drives itself", async () => {
    const pulsing = await sample(true);
    const spread = Math.max(...pulsing.values) - Math.min(...pulsing.values);
    // The swing is small because the bar is: `$accent` is #f4f4f5, and half
    // of it over white is #f9f9fa. That is shadcn's own arithmetic --
    // `bg-accent` under `animate-pulse` -- so the test asserts the rhythm is
    // there rather than inventing a darker placeholder to make it obvious.
    expect(spread).toBeGreaterThan(3);
    expect(pulsing.frames).toBeGreaterThan(5);

    const still = await sample(false);
    expect(Math.max(...still.values) - Math.min(...still.values)).toBe(0);
    expect(still.frames).toBe(0);
  }, 60_000);
});
