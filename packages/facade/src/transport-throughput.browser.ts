// How many frames each transport actually delivers for a given input rate.
//
// The fallback chain is tested for behavioural equivalence -- the M9
// differential asserts all three transports publish the same Picture lifecycle
// -- but nothing measured what they cost, and they are not equivalent. Driving
// one scroll per animation frame, SharedArrayBuffer delivers a frame per
// scroll and postMessage tops out around half that.
//
// Which matters more than it first looks, because the SAB path requires
// cross-origin isolation, which requires COOP and COEP response headers, which
// a consumer on a static host cannot set. postMessage is not the fallback for
// those deployments; it is the only path they have. So its ceiling is the
// engine's ceiling for them, and it belongs in a gate.
//
// Ratios rather than durations: the delivered-frame count is a count, and
// counts are the same on every machine.
import { afterEach, describe, expect, it } from "vitest";

import {
  createElement,
  createHostedCanvasRoot,
  type FrameReport,
  type HostTransportMode,
  type HostedCanvasRoot,
  type ViewHandle,
} from "./index";

const roots: HostedCanvasRoot[] = [];
const ROWS = 200;
const ROW_HEIGHT = 40;
const VIEWPORT = { width: 360, height: 480 };
const TICKS = 60;

/**
 * Floors, not targets.
 *
 * postMessage's was 0.4 when this was written, recording a path that delivered
 * about 0.55 because the Worker's render clock defaulted to 60Hz and it waited
 * for that clock while SAB bypassed it. Now that the main thread supplies the
 * display's cadence the same path measures 0.99 alone, so the floor rises with
 * it -- that was the point of the number existing.
 *
 * 0.7 rather than 0.9, because alone is not the condition that matters. Under
 * the whole browser suite the same case measured 49, 50, 51, 52, 54 and 55
 * frames of 60 across six runs, while main-thread and SAB held 60 every time.
 * 0.8 sat on the low edge of that spread and flaked; 0.7 clears it by seven
 * frames and still fails the 0.55 this path used to deliver.
 */
const MINIMUM_DELIVERY = new Map<HostTransportMode, number>([
  ["main-thread", 0.9],
  ["sab", 0.9],
  ["post-message", 0.7],
]);

afterEach(async () => {
  while (roots.length > 0) await roots.pop()?.close();
  document.body.replaceChildren();
});

describe("transport throughput", () => {
  it.each(["main-thread", "post-message", "sab"] as const)(
    "%s delivers frames for a scroll per animation frame",
    async (mode) => {
      if (mode === "sab") expect(crossOriginIsolated).toBe(true);
      const { reports, handle, root } = await mount(mode);
      expect(root.decision.mode).toBe(mode);
      await settle(reports);

      const before = reports.length;
      for (let tick = 1; tick <= TICKS; tick += 1) {
        handle.current?.scrollTo(0, tick * 10);
        await nextFrame();
      }
      const delivered = reports.length - before;
      const ratio = delivered / TICKS;
      const floor = MINIMUM_DELIVERY.get(mode) ?? 0;
      expect(
        ratio,
        `${mode} delivered ${String(delivered)} frames for ${String(TICKS)} scrolls`,
      ).toBeGreaterThanOrEqual(floor);
    },
    120_000,
  );
});

async function mount(mode: HostTransportMode): Promise<{
  handle: { current: ViewHandle | null };
  reports: FrameReport[];
  root: HostedCanvasRoot;
}> {
  const canvas = document.createElement("canvas");
  canvas.width = VIEWPORT.width;
  canvas.height = VIEWPORT.height;
  document.body.append(canvas);
  const reports: FrameReport[] = [];
  const handle = { current: null as ViewHandle | null };
  const root = await createHostedCanvasRoot(canvas, {
    onFrame: (report) => reports.push(report),
    rasterCache: false,
    transport: { preference: mode, strict: true },
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
        children: Array.from({ length: ROWS }, (_, index) =>
          createElement("container", {
            key: index,
            width: VIEWPORT.width,
            height: ROW_HEIGHT,
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
        ),
      }),
    }),
  );
  return { handle, reports, root };
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
  for (let frame = 0; frame < 8; frame += 1) await nextFrame();
}
