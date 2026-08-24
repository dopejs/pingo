import { createElement, createHostedCanvasRoot, type FrameReport } from "@dopejs/pingo";
import { Slider, createPingoUiStyleSheet } from "@dopejs/pingo-ui";
import { afterEach, describe, expect, it } from "vitest";

/**
 * A drag follows the pointer for its whole length.
 *
 * `createDrag` keeps the press position in its closure, and both draggable
 * controls built a fresh one on every render. The press committed a value,
 * that re-rendered the component, and the node was handed a handler set that
 * had never seen a press -- so every move after the first was dropped on the
 * `origin === undefined` guard. The thumb jumped to where the pointer went
 * down and then stopped following it, and the seam moved once and stuck.
 * `createDrag`'s own unit tests all passed: the primitive was never wrong,
 * only its wiring, which is why this drives a whole component instead.
 *
 * Resizable has the same wiring and is covered by `useDrag`'s own test: its
 * handle is 4px wide, and a synthesised pointer cannot be captured, so a drag
 * here would leave the handle on its first move for reasons that have nothing
 * to do with what is being tested.
 */
const pause = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

async function waitUntil(check: () => boolean, timeoutMs = 5000): Promise<boolean> {
  const end = performance.now() + timeoutMs;
  while (performance.now() < end) {
    if (check()) return true;
    await pause(16);
  }
  return check();
}

describe("drag tracking", () => {
  const roots: Array<{ close: () => Promise<void> }> = [];

  afterEach(async () => {
    for (const root of roots.splice(0)) await root.close();
    document.body.replaceChildren();
  });

  const WIDTH = 400;
  const HEIGHT = 200;

  async function mount(tree: unknown): Promise<{
    canvas: HTMLCanvasElement;
    semantics: () => readonly Record<string, unknown>[];
  }> {
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.cssText = `display:block;width:${String(WIDTH)}px;height:${String(HEIGHT)}px`;
    canvas.tabIndex = 0;
    document.body.append(canvas);
    const frames: FrameReport[] = [];
    let snapshot: Record<string, unknown>[] = [];
    // No transport preference: the same default a real application takes.
    const root = await createHostedCanvasRoot(canvas, {
      styleSheets: [createPingoUiStyleSheet()],
      onFrame: (report) => frames.push(report),
      transport: { preference: "main-thread", strict: true },
      onSemantics: (nodes: unknown) => {
        snapshot = Array.isArray(nodes) ? (nodes as Record<string, unknown>[]) : [];
      },
    });
    roots.push(root);
    root.render(tree as never);
    expect(await waitUntil(() => frames.length > 0)).toBe(true);
    expect(await waitUntil(() => snapshot.length > 0)).toBe(true);
    // Both controls map the pointer through their own measured box, and that
    // measurement is a frame late by construction.
    await pause(800);
    return { canvas, semantics: () => snapshot };
  }

  function pointer(canvas: HTMLCanvasElement, type: string, x: number, y: number): void {
    const rect = canvas.getBoundingClientRect();
    canvas.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        buttons: type === "pointerup" ? 0 : 1,
        clientX: rect.left + x,
        clientY: rect.top + y,
        pointerId: 9,
        pointerType: "mouse",
        isPrimary: true,
        pressure: type === "pointerup" ? 0 : 0.5,
      }),
    );
  }

  it("moves a slider with the pointer, not only to where it went down", async () => {
    const changes: number[] = [];
    const { canvas, semantics } = await mount(
      createElement("container", {
        width: WIDTH,
        height: HEIGHT,
        style: { flexDirection: "column", padding: "20px" },
        children: createElement(Slider, {
          defaultValue: 10,
          semanticLabel: "音量",
          onValueChange: (value: number) => changes.push(value),
        }),
      }),
    );
    const slider = (): Record<string, number> =>
      (semantics().find((node) => String(node.role) === "slider")?.bounds ?? {}) as Record<
        string,
        number
      >;
    const track = slider();
    const y = (track.top ?? 0) + (track.height ?? 0) / 2;
    const at = (ratio: number): number => (track.left ?? 0) + (track.width ?? 0) * ratio;
    const value = (): number =>
      Number(semantics().find((node) => String(node.role) === "slider")?.value ?? Number.NaN);

    pointer(canvas, "pointermove", at(0.25), y);
    await pause(60);
    pointer(canvas, "pointerdown", at(0.25), y);
    expect(await waitUntil(() => value() > 20 && value() < 30, 2000)).toBe(true);
    const pressed = value();

    // Three moves, each further along: every one has to land.
    for (const ratio of [0.5, 0.75, 0.95]) {
      const before = value();
      pointer(canvas, "pointermove", at(ratio), y);
      expect(await waitUntil(() => value() > before, 2000)).toBe(true);
    }
    expect(value()).toBeGreaterThan(90);
    expect(value()).toBeGreaterThan(pressed);

    // Back down the track, so a drag is not one-way.
    const high = value();
    pointer(canvas, "pointermove", at(0.4), y);
    expect(await waitUntil(() => value() < high, 2000)).toBe(true);
    pointer(canvas, "pointerup", at(0.4), y);
    // A synthesised pointer cannot be captured, so this stays on the track;
    // holding the drag past the node's edge is what `createDrag` takes the
    // capture for and is covered where a real pointer exists.

    // A moved slider reports every value it passed through, not just the press.
    expect(changes.length).toBeGreaterThan(3);
    // The default step is 1, as shadcn has it: no 47.68518518518518.
    expect(changes.every((entry) => Number.isInteger(entry))).toBe(true);
  }, 60_000);
});
