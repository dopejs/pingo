import { createElement, createHostedCanvasRoot, type FrameReport } from "@dopejs/pingo";
import { afterEach, describe, expect, it } from "vitest";

/**
 * The caret keeps up with what was typed.
 *
 * Core places it from per-code-point advances, and the Host measures the ones
 * the Scene string contains. Editing needs no Shell re-render, so everything
 * typed after that was in no Scene string and had no measurement: the caret
 * fell back to an estimate of 0.6em per code point and drifted further right
 * with every keystroke. A narrow letter like `l` is about 3px at 14px where the
 * estimate is 8.4px, so twelve of them left the caret 65px past the text -- and
 * it never came back, because the value never returns to the Scene.
 */
interface BrowserEditContext extends EventTarget {
  readonly text: string;
}

async function waitUntil(check: () => boolean, timeoutMs = 3000): Promise<boolean> {
  const end = performance.now() + timeoutMs;
  while (performance.now() < end) {
    if (check()) return true;
    await new Promise((resolve) => setTimeout(resolve, 8));
  }
  return check();
}

describe("caret advance", () => {
  const roots: Array<{ close: () => Promise<void> }> = [];

  afterEach(async () => {
    for (const root of roots.splice(0)) await root.close();
    document.body.replaceChildren();
  });

  const WIDTH = 400;
  const HEIGHT = 60;

  /** Columns holding dark ink: the glyphs and the caret, nothing else. */
  function darkColumns(canvas: HTMLCanvasElement): number[] {
    const context = canvas.getContext("2d");
    if (context === null) throw new Error("Chromium did not provide Canvas2D");
    const data = context.getImageData(0, 0, WIDTH, HEIGHT).data;
    const columns: number[] = [];
    for (let x = 0; x < WIDTH; x += 1) {
      for (let y = 0; y < HEIGHT; y += 1) {
        const index = (y * WIDTH + x) * 4;
        if ((data[index + 3] ?? 0) > 40 && (data[index] ?? 255) < 120) {
          columns.push(x);
          break;
        }
      }
    }
    return columns;
  }

  /** Widest run of blank columns between two inked ones. */
  function widestGap(columns: readonly number[]): number {
    let widest = 0;
    for (let index = 1; index < columns.length; index += 1) {
      widest = Math.max(widest, (columns[index] ?? 0) - (columns[index - 1] ?? 0) - 1);
    }
    return widest;
  }

  it("keeps the caret against the text through a run of narrow letters", async () => {
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
      createElement("editableText", {
        value: "",
        revision: 1n,
        color: "#000000",
        fontSize: 14,
        height: 40,
        width: 360,
      }),
    );
    await waitUntil(() => frames.some((frame) => frame.cause === "mutation"));

    const rect = canvas.getBoundingClientRect();
    for (const [type, buttons] of [
      ["pointerdown", 1],
      ["pointerup", 0],
    ] as const) {
      canvas.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          buttons,
          clientX: rect.left + 20,
          clientY: rect.top + 20,
          pointerId: 4,
        }),
      );
    }
    const editContext = (): BrowserEditContext => {
      const context = Reflect.get(canvas, "editContext") as BrowserEditContext | undefined;
      if (context === undefined) throw new Error("EditContext is unavailable");
      return context;
    };
    await waitUntil(() => editContext().text === "");

    // `l` is the widest gap between a measured advance and the 0.6em estimate,
    // so twelve of them is the clearest signal the drift is gone.
    let typed = "";
    for (const chunk of ["llll", "llll", "llll"]) {
      editContext().dispatchEvent(
        Object.assign(new Event("textupdate"), {
          selectionEnd: typed.length + chunk.length,
          selectionStart: typed.length + chunk.length,
          text: chunk,
          updateRangeEnd: typed.length,
          updateRangeStart: typed.length,
        }),
      );
      typed += chunk;
      await waitUntil(() => editContext().text === typed);
      await waitUntil(() => false, 40);

      // The caret sits against the last glyph, so the row of ink has no wide
      // hole in it. It was 23px after four letters and 65px after twelve.
      expect(widestGap(darkColumns(canvas))).toBeLessThanOrEqual(4);
    }
  }, 60_000);
});
