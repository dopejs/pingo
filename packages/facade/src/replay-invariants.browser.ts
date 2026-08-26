// What a pure scroll frame is allowed to cost the backend.
//
// Every performance gate in this repository measures the native Core and stops
// at the DisplayList. The three defects that actually moved the frame rate --
// recorded in design.md under the M5 fixes -- were all on the other side of
// that line, and all three were found by noticing a count, not a duration:
//
//   * `dirtyPaintNodes` equal to `sceneNodes`, because compaction refilled
//     every dirty bit, so every scroll frame repainted the whole Scene;
//   * `hits=0, misses=8` every frame, because a tile was keyed by the picture
//     it came from, so a scroll replayed the whole list once per tile;
//   * a frame with no new DisplayList replaying the previous one, which
//     changed no pixel and cost more than any other phase. That third one is
//     only partly covered here; the assertion below says where the gap is.
//
// Counts are also the only measure that survives CI: a shared runner's
// milliseconds are noise, while these numbers are identical on every machine.
// So this asserts counts, and never a duration.
import { afterEach, describe, expect, it } from "vitest";

import {
  createElement,
  createHostedCanvasRoot,
  type FrameReport,
  type HostedCanvasRoot,
  type ViewHandle,
} from "./index";

const roots: HostedCanvasRoot[] = [];
const ROWS = 60;
const ROW_HEIGHT = 40;
const VIEWPORT = { width: 320, height: 240 };
const SCROLL_STEPS = 20;

afterEach(async () => {
  while (roots.length > 0) await roots.pop()?.close();
  document.body.replaceChildren();
});

describe("pure scroll replay invariants", () => {
  it.each([false, true])(
    "holds with rasterCache=%s",
    async (rasterCache) => {
      const { reports, handle } = await mount(rasterCache);
      await settle(reports);

      const firstScrollFrame = reports.length;
      for (let step = 1; step <= SCROLL_STEPS; step += 1) {
        handle.current?.scrollTo(0, step * 8);
        await nextFrame();
      }
      const scrollFrames = reports.slice(firstScrollFrame);
      expect(scrollFrames.length).toBeGreaterThan(SCROLL_STEPS / 2);

      // Nothing is mutating, so the Shell is not involved and layout does not run.
      for (const report of scrollFrames) {
        expect(report.mutationBytes).toBe(0);
        expect(report.core?.layoutVisitedNodes).toBe(0);
      }

      // A scroll moves a subtree; it does not change what is in it. If the
      // replayer's work grows frame over frame, something is being rebuilt or
      // duplicated, and the count says so before any clock would.
      expect(distinct(scrollFrames, (report) => report.commands)).toHaveLength(1);
      expect(distinct(scrollFrames, (report) => report.pictures)).toHaveLength(1);
      expect(distinct(scrollFrames, (report) => report.displayListBytes)).toHaveLength(1);

      // The dirty-fill defect made these equal. A scroll dirties the scrolled
      // subtree, never the whole Scene.
      for (const report of scrollFrames) {
        const scene = report.core?.sceneNodes ?? 0;
        expect(scene).toBeGreaterThan(1);
        expect(report.core?.dirtyPaintNodes ?? scene).toBeLessThan(scene);
      }

      // The tile defect showed up as a miss on every frame, each one replaying
      // the whole list into a tile. Bypassing is the correct outcome here --
      // a scrolled picture is new every frame and can never be reused -- so what
      // must not happen is paying for the attempt.
      if (rasterCache) {
        for (const report of scrollFrames) {
          expect(report.rasterFrame?.misses).toBe(0);
        }
      }

      // Core stops producing frames once the scroll settles.
      //
      // Narrower than it looks, and stated as what it is: this catches Core
      // emitting a DisplayList when nothing changed, not the M5 clock defect
      // itself. That defect lived in `advance`, which replayed the previous
      // list when Core returned none, and `replayLastFrame` reports no frame --
      // so restoring it would leave this assertion green. Catching that needs a
      // replay counter, which `FrameReport` does not carry today.
      const afterScroll = reports.length;
      for (let frame = 0; frame < 10; frame += 1) await nextFrame();
      expect(reports.length - afterScroll).toBe(0);
    },
    60_000,
  );
});

async function mount(rasterCache: boolean): Promise<{
  handle: { current: ViewHandle | null };
  reports: FrameReport[];
}> {
  const canvas = document.createElement("canvas");
  canvas.width = VIEWPORT.width;
  canvas.height = VIEWPORT.height;
  document.body.append(canvas);
  const reports: FrameReport[] = [];
  const handle = { current: null as ViewHandle | null };
  const root = await createHostedCanvasRoot(canvas, {
    onFrame: (report) => reports.push(report),
    rasterCache,
    transport: { preference: "main-thread", strict: true },
  });
  roots.push(root);
  const rows = Array.from({ length: ROWS }, (_, index) =>
    createElement("container", {
      key: index,
      width: VIEWPORT.width,
      height: ROW_HEIGHT,
      direction: "row",
      gap: 6,
      backgroundColor: index % 2 === 0 ? "#1c3048ff" : "#142238ff",
      children: [
        createElement("text", {
          key: "label",
          color: "#ffffffff",
          fontSize: 12,
          value: `Row ${String(index)}`,
        }),
      ],
    }),
  );
  root.render(
    createElement("scroll", {
      ref: handle,
      width: VIEWPORT.width,
      height: VIEWPORT.height,
      children: createElement("container", {
        width: VIEWPORT.width,
        height: ROWS * ROW_HEIGHT,
        children: rows,
      }),
    }),
  );
  return { handle, reports };
}

function distinct(
  reports: readonly FrameReport[],
  read: (report: FrameReport) => number,
): number[] {
  return [...new Set(reports.map(read))];
}

function nextFrame(): Promise<void> {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

async function settle(reports: readonly FrameReport[]): Promise<void> {
  const deadline = performance.now() + 5_000;
  while (reports.length === 0) {
    if (performance.now() >= deadline) throw new Error("scene never produced a frame");
    await nextFrame();
  }
  for (let frame = 0; frame < 6; frame += 1) await nextFrame();
}
