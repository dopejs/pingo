import { createElement, createHostedCanvasRoot, type FrameReport } from "@dopejs/pingo";
import { Label, ScrollArea, createPingoUiStyleSheet } from "@dopejs/pingo-ui";
import { afterEach, describe, expect, it } from "vitest";

/**
 * Core draws the scrollbar, so scrolling costs the Shell nothing.
 *
 * The bar used to be Shell-drawn: the component observed the scrolled content's
 * box, derived the thumb from it and re-rendered. Every scroll frame therefore
 * became a Shell render and a commit -- two presented frames per scroll step,
 * the content moving in one and the thumb catching up in the next -- which is
 * what made a scroll look unsteady. Its offset was a `margin-top` percentage
 * too, and those resolve against the containing block's *width*: the bar is
 * 8px wide, so the thumb's whole travel was eight pixels of a 200px track.
 */
const pause = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

describe("scrollbar", () => {
  const roots: Array<{ close: () => Promise<void> }> = [];

  afterEach(async () => {
    for (const root of roots.splice(0)) await root.close();
    document.body.replaceChildren();
  });

  const WIDTH = 300;
  const HEIGHT = 240;
  const AREA = 200;

  async function mount(
    props: Record<string, unknown>,
  ): Promise<{ canvas: HTMLCanvasElement; frames: FrameReport[] }> {
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
            ...props,
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
    return { canvas, frames };
  }

  /** Top and bottom of the drawn thumb, in the rightmost column that has one. */
  function thumb(canvas: HTMLCanvasElement): { top: number; bottom: number } | undefined {
    const context = canvas.getContext("2d");
    if (context === null) throw new Error("Chromium did not provide Canvas2D");
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
        if (red > 60 && red < 200 && Math.abs(red - blue) < 30 && (data[index + 3] ?? 0) > 200) {
          if (top < 0) top = y;
          bottom = y;
          count += 1;
        }
      }
      if (count > 15 && (best === undefined || count > best.count)) best = { top, bottom, count };
    }
    return best;
  }

  function wheel(canvas: HTMLCanvasElement, times: number): void {
    const rect = canvas.getBoundingClientRect();
    for (let step = 0; step < times; step += 1) {
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
    }
  }

  it("runs the thumb the length of the track", async () => {
    const { canvas } = await mount({});
    const rest = thumb(canvas);
    expect(rest).toBeDefined();
    expect((rest?.bottom ?? 0) - (rest?.top ?? 0)).toBeGreaterThan(20);

    for (let burst = 0; burst < 12; burst += 1) {
      wheel(canvas, 1);
      await pause(50);
    }
    await pause(400);
    const end = thumb(canvas);
    expect(end).toBeDefined();
    // Same length, far down the track: it travelled eight pixels before.
    expect((end?.bottom ?? 0) - (end?.top ?? 0)).toBe((rest?.bottom ?? 0) - (rest?.top ?? 0));
    expect((end?.top ?? 0) - (rest?.top ?? 0)).toBeGreaterThan(AREA / 3);
  }, 60_000);

  it("costs the shell nothing to scroll", async () => {
    const { canvas, frames } = await mount({});
    const before = frames.length;
    const mutationsBefore = frames.filter((frame) => frame.cause === "mutation").length;
    for (let step = 0; step < 10; step += 1) {
      wheel(canvas, 1);
      await pause(40);
    }
    await pause(300);
    const during = frames.slice(before);
    // Input frames only: a Shell-drawn bar produced a mutation frame for every
    // one of them, so each scroll step was presented twice.
    expect(during.filter((frame) => frame.cause === "input").length).toBeGreaterThan(5);
    expect(frames.filter((frame) => frame.cause === "mutation").length).toBe(mutationsBefore);
  }, 60_000);

  it("draws no bar when the caller asks for none", async () => {
    const { canvas } = await mount({ hideScrollbar: true });
    expect(thumb(canvas)).toBeUndefined();
  }, 60_000);

  it("takes the colours a caller names", async () => {
    // `scrollbar-color` is a real CSS property and its initial `auto` leaves
    // the pair to the user agent, which is Core. A named pair replaces both
    // and adds the track the overlay default does not draw.
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
          style: { flexDirection: "column", scrollbarColor: "#ff0000ff #0000ffff" },
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
    const data = context.getImageData(0, 0, WIDTH, HEIGHT).data;
    let red = 0;
    let blue = 0;
    for (let index = 0; index < data.length; index += 4) {
      const r = data[index] ?? 0;
      const g = data[index + 1] ?? 0;
      const b = data[index + 2] ?? 0;
      if (r > 200 && g < 60 && b < 60) red += 1;
      if (b > 200 && g < 60 && r < 60) blue += 1;
    }
    // The thumb in red over its track in blue, and the track is the longer of
    // the two because the thumb is only the visible fraction of it.
    expect(red).toBeGreaterThan(50);
    expect(blue).toBeGreaterThan(red);
  }, 60_000);

  it("scrolls a virtual window without materializing it", async () => {
    // Virtualization is a View-level contract, so this is the same component
    // with a data window instead of children -- a hundred thousand rows and a
    // bar sized from the estimate, with only a screenful ever mounted.
    const rendered = new Set<number>();
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
            virtual: {
              itemCount: 100_000,
              estimatedItemSize: 30,
              renderItem: (index: number) => {
                rendered.add(index);
                return createElement("container", {
                  style: { height: "30px", flexDirection: "column" },
                  children: createElement(Label, { children: `row ${String(index)}` }),
                });
              },
            },
          }),
        }),
      }),
    );
    while (!frames.some((frame) => frame.cause === "mutation")) await pause(16);
    await pause(400);
    // A screenful, not a hundred thousand.
    expect(rendered.size).toBeLessThan(40);
    // And the thumb is the visible fraction of three million pixels: tiny, but
    // never smaller than the minimum a thumb is allowed to be.
    const rest = thumb(canvas);
    expect(rest).toBeDefined();
    expect((rest?.bottom ?? 0) - (rest?.top ?? 0)).toBeGreaterThan(8);
    expect((rest?.bottom ?? 0) - (rest?.top ?? 0)).toBeLessThan(40);
  }, 60_000);
});
