// Exploratory probe, not a gate. It drives a scroll in a real browser and
// reports the per-frame work the Canvas2D replayer actually does -- the axis
// every existing performance gate stops short of, because they all measure the
// native Core and stop at the DisplayList.
import { afterEach, describe, it } from "vitest";

import {
  createElement,
  createHostedCanvasRoot,
  createImage,
  type FrameReport,
  type HostedCanvasRoot,
  type ViewHandle,
  type VirtualListProps,
} from "./index";

const roots: HostedCanvasRoot[] = [];
const ROWS = 400;
const ROW_HEIGHT = 48;
const VIEWPORT = { width: 360, height: 480 };
const SCROLL_STEPS = 120;
const SCROLL_PIXELS_PER_STEP = 12;

const avatar = createImage(
  new Uint8Array([255, 64, 64, 255, 64, 255, 64, 255, 64, 64, 255, 255, 255, 220, 64, 255]),
  2,
  2,
  { label: "probe avatar" },
);

afterEach(async () => {
  while (roots.length > 0) await roots.pop()?.close();
  document.body.replaceChildren();
});

describe("replay cost probe", () => {
  it("reports per-frame replay work for a scrolling list", async () => {
    const summaries: Record<string, unknown>[] = [];
    summaries.push(await measurePlain({ pictures: true, rasterCache: false }));
    summaries.push(await measurePlain({ pictures: false, rasterCache: false }));
    summaries.push(await measurePlain({ pictures: true, rasterCache: true }));
    summaries.push(await measureVirtual());
    // The browser runner does not forward console output, so the probe reports
    // by failing with its result. This file is exploratory and never a gate.
    throw new Error(`REPLAY_COST_PROBE\n${JSON.stringify(summaries, null, 1)}`);
  }, 180_000);
});

// A plain scroll container holding every row, scrolled by the Core-owned
// ViewHandle so no Shell mutation is involved.
async function measurePlain(options: {
  pictures: boolean;
  rasterCache: boolean;
}): Promise<Record<string, unknown>> {
  const canvas = mountCanvas();
  const reports: FrameReport[] = [];
  const handle = { current: null as ViewHandle | null };
  const root = await createHostedCanvasRoot(canvas, {
    incrementalPicturesEnabled: options.pictures,
    onFrame: (report) => reports.push(report),
    rasterCache: options.rasterCache,
    transport: { preference: "main-thread", strict: true },
  });
  roots.push(root);
  root.render(
    createElement("scroll", {
      ref: handle,
      width: VIEWPORT.width,
      height: VIEWPORT.height,
      children: createElement("container", {
        width: VIEWPORT.width,
        height: ROWS * ROW_HEIGHT,
        children: Array.from({ length: ROWS }, (_, index) => row(index)),
      }),
    }),
  );
  await settle(reports, 1);

  const firstScrollFrame = reports.length;
  for (let step = 1; step <= SCROLL_STEPS; step += 1) {
    handle.current?.scrollTo(0, step * SCROLL_PIXELS_PER_STEP);
    await nextFrame();
  }
  await nextFrame();
  const summary = summarize(
    `plain scroll (pictures=${String(options.pictures)} raster=${String(options.rasterCache)})`,
    reports.slice(firstScrollFrame),
  );
  await roots.pop()?.close();
  canvas.remove();
  return summary;
}

// Same rows, materialized through the virtual contract, so only the visible
// window exists as Scene nodes. Driven by re-rendering with a new scrollY,
// which is what the virtual list contract exposes.
async function measureVirtual(): Promise<Record<string, unknown>> {
  const canvas = mountCanvas();
  const reports: FrameReport[] = [];
  const root = await createHostedCanvasRoot(canvas, {
    onFrame: (report) => reports.push(report),
    rasterCache: false,
    transport: { preference: "main-thread", strict: true },
  });
  roots.push(root);
  const render = (scrollY: number) => {
    const props = {
      width: VIEWPORT.width,
      height: VIEWPORT.height,
      itemCount: ROWS,
      estimatedItemHeight: ROW_HEIGHT,
      scrollY,
      renderItem: (index: number) => row(index),
    } satisfies VirtualListProps;
    root.render(createElement<typeof props>("virtualList", props));
  };
  render(0);
  await settle(reports, 1);

  const firstScrollFrame = reports.length;
  for (let step = 1; step <= SCROLL_STEPS; step += 1) {
    render(step * SCROLL_PIXELS_PER_STEP);
    await nextFrame();
  }
  await nextFrame();
  const summary = summarize(
    "virtualList (pictures=true raster=false)",
    reports.slice(firstScrollFrame),
  );
  await roots.pop()?.close();
  canvas.remove();
  return summary;
}

function summarize(config: string, frames: readonly FrameReport[]): Record<string, unknown> {
  return {
    config,
    scrollFrames: frames.length,
    // What the replayer executed. `commands` counts recursively expanded
    // picture contents, so it is real Canvas2D work, not wire size.
    commands: stats(frames.map((report) => report.commands)),
    pictures: stats(frames.map((report) => report.pictures)),
    displayListBytes: stats(frames.map((report) => report.displayListBytes)),
    mutationBytes: stats(frames.map((report) => report.mutationBytes)),
    sceneNodes: stats(frames.map((report) => report.core?.sceneNodes ?? 0)),
    dirtyPaintNodes: stats(frames.map((report) => report.core?.dirtyPaintNodes ?? 0)),
    layoutVisitedNodes: stats(frames.map((report) => report.core?.layoutVisitedNodes ?? 0)),
    rasterHits: sum(frames.map((report) => report.rasterFrame?.hits ?? 0)),
    rasterMisses: sum(frames.map((report) => report.rasterFrame?.misses ?? 0)),
    framesWithTiming: frames.filter((report) => report.replayMs !== undefined).length,
  };
}

function row(index: number) {
  return createElement("container", {
    key: index,
    width: VIEWPORT.width,
    height: ROW_HEIGHT,
    direction: "row",
    gap: 8,
    padding: [6, 10, 6, 10],
    backgroundColor: index % 2 === 0 ? "#142238ff" : "#1c3048ff",
    children: [
      createElement("image", { key: "avatar", source: avatar, width: 32, height: 32 }),
      createElement("container", {
        key: "lines",
        width: 220,
        height: 36,
        children: [
          createElement("text", {
            key: "title",
            color: "#ffffffff",
            fontSize: 13,
            value: `Row ${String(index).padStart(3, "0")} title text`,
          }),
          createElement("text", {
            key: "subtitle",
            color: "#9fb4ccff",
            fontSize: 11,
            value: `secondary line for row ${String(index)}`,
          }),
        ],
      }),
      createElement("container", {
        key: "badge",
        width: 44,
        height: 20,
        backgroundColor: "#ffb020ff",
      }),
    ],
  });
}

function mountCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = VIEWPORT.width;
  canvas.height = VIEWPORT.height;
  document.body.append(canvas);
  return canvas;
}

function stats(values: readonly number[]): Record<string, number> {
  const finite = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (finite.length === 0) return { count: 0 };
  const at = (q: number) => finite[Math.min(finite.length - 1, Math.floor(q * finite.length))] ?? 0;
  return {
    total: finite.reduce((a, b) => a + b, 0),
    p50: at(0.5),
    p95: at(0.95),
    max: finite[finite.length - 1] ?? 0,
  };
}

function sum(values: readonly number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

function nextFrame(): Promise<void> {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

async function settle(reports: readonly FrameReport[], atLeast: number): Promise<void> {
  const deadline = performance.now() + 5_000;
  while (reports.length < atLeast) {
    if (performance.now() >= deadline) throw new Error("probe never produced a frame");
    await nextFrame();
  }
}
