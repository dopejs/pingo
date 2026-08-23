import { createHostedCanvasRoot, type FrameReport } from "@dopejs/pingo";
import { createPingoUiStyleSheet } from "@dopejs/pingo-ui";
import { afterEach, describe, expect, it } from "vitest";

import type { PreviewDemo } from "./preview/contract";

/**
 * Documentation previews are centred, and the toggles in them respond.
 *
 * Both were reported from the published site. The previews were pinned to the
 * left because `align-items: stretch` -- the CSS initial value every unstyled
 * column gets -- made a shrink-to-fit container fill its parent, leaving the
 * stage's `align-items: center` nothing to centre. The toggles did nothing
 * because Checkbox and Switch were controlled-only and the demos passed a
 * literal `checked` with a no-op handler.
 */
async function waitUntil(check: () => boolean, timeoutMs = 3000): Promise<boolean> {
  const end = performance.now() + timeoutMs;
  while (performance.now() < end) {
    if (check()) return true;
    await new Promise((resolve) => setTimeout(resolve, 8));
  }
  return check();
}

describe("documentation previews", () => {
  const roots: Array<{ close: () => Promise<void> }> = [];

  afterEach(async () => {
    for (const root of roots.splice(0)) await root.close();
    document.body.replaceChildren();
  });

  const WIDTH = 900;

  async function mount(name: string): Promise<{
    readonly canvas: HTMLCanvasElement;
    readonly height: number;
  }> {
    const module = (await import(`./demos/components/${name}.tsx`)) as { default: PreviewDemo };
    const demo = module.default;
    const height = demo.height ?? 240;
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = height;
    document.body.append(canvas);
    const frames: FrameReport[] = [];
    const root = await createHostedCanvasRoot(canvas, {
      styleSheets: [createPingoUiStyleSheet()],
      onFrame: (report) => frames.push(report),
      transport: { preference: "main-thread", strict: true },
    });
    roots.push(root);
    root.render(demo.render({ width: WIDTH, height }));
    await waitUntil(() => frames.some((frame) => frame.cause === "mutation"));
    return { canvas, height };
  }

  /** Horizontal extent of everything painted, in canvas pixels. */
  function inkColumns(canvas: HTMLCanvasElement): {
    readonly left: number;
    readonly right: number;
  } {
    const context = canvas.getContext("2d");
    if (context === null) throw new Error("Chromium did not provide Canvas2D");
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let left = canvas.width;
    let right = -1;
    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        if ((data[(y * canvas.width + x) * 4 + 3] ?? 0) < 20) continue;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
    return { left, right };
  }

  // One demo per shape that used to fail: a component that is a bare column
  // (Form), a column built by the demo helper (Checkbox), and a component that
  // fills a fixed-width wrapper (Alert).
  it.each(["form-basic", "checkbox-basic", "alert-basic"])(
    "centres %s on the stage",
    async (name) => {
      const { canvas } = await mount(name);
      const { left, right } = inkColumns(canvas);
      expect(right).toBeGreaterThan(left);
      // Equal margins, to within the antialiasing of the outermost edges.
      expect(Math.abs(left - (WIDTH - 1 - right))).toBeLessThanOrEqual(2);
    },
  );

  it.each(["checkbox-basic", "switch-basic"])("toggles %s from a click", async (name) => {
    const { canvas, height } = await mount(name);
    const before = canvas.getContext("2d")?.getImageData(0, 0, WIDTH, height).data;
    if (before === undefined) throw new Error("no pixels");
    const { left } = inkColumns(canvas);
    const rect = canvas.getBoundingClientRect();
    // The first control's own box, a few pixels in from its top-left corner.
    const x = rect.left + left + 6;
    const y = rect.top + inkRows(canvas).top + 6;
    for (const [type, buttons] of [
      ["pointerdown", 1],
      ["pointerup", 0],
    ] as const) {
      canvas.dispatchEvent(
        new PointerEvent(type, { bubbles: true, buttons, clientX: x, clientY: y, pointerId: 8 }),
      );
    }
    canvas.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: x, clientY: y }));

    const changed = await waitUntil(() => {
      const after = canvas.getContext("2d")?.getImageData(0, 0, WIDTH, height).data;
      if (after === undefined) return false;
      for (let index = 0; index < after.length; index += 1) {
        if (after[index] !== before[index]) return true;
      }
      return false;
    });
    expect(changed).toBe(true);
  });

  it("puts the caret against the digit in an OTP slot, not at its edge", async () => {
    const { canvas, height } = await mount("input-otp-basic");
    // Only the digits and the caret are dark; the slot borders are not.
    const dark = (): number[] => {
      const context = canvas.getContext("2d");
      if (context === null) throw new Error("Chromium did not provide Canvas2D");
      const data = context.getImageData(0, 0, WIDTH, height).data;
      const columns: number[] = [];
      for (let x = 0; x < WIDTH; x += 1) {
        for (let y = 0; y < height; y += 1) {
          const index = (y * WIDTH + x) * 4;
          if ((data[index + 3] ?? 0) > 40 && (data[index] ?? 255) < 120) {
            columns.push(x);
            break;
          }
        }
      }
      return columns;
    };
    const before = dark();
    const firstDigit = before[0];
    if (firstDigit === undefined) throw new Error("the demo drew no digits");
    // The first digit's ink ends where the run of adjacent columns does.
    let digitEnd = firstDigit;
    for (const column of before) {
      if (column > digitEnd + 1) break;
      digitEnd = column;
    }

    const rect = canvas.getBoundingClientRect();
    for (const [type, buttons] of [
      ["pointerdown", 1],
      ["pointerup", 0],
    ] as const) {
      canvas.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          buttons,
          clientX: rect.left + digitEnd + 12,
          clientY: rect.top + height / 2,
          pointerId: 9,
        }),
      );
    }
    expect(await waitUntil(() => dark().length > before.length)).toBe(true);

    // The slot centres one digit, and the caret has to follow it there. It used
    // to be built from advances alone, which start every line at zero, so it
    // stood at the slot's left edge -- a whole digit away from its own text.
    const caret = dark().find((column) => !before.includes(column));
    expect(caret).toBeGreaterThan(digitEnd);
  });

  /** Vertical extent of everything painted, in canvas pixels. */
  function inkRows(canvas: HTMLCanvasElement): { readonly top: number } {
    const context = canvas.getContext("2d");
    if (context === null) throw new Error("Chromium did not provide Canvas2D");
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        if ((data[(y * canvas.width + x) * 4 + 3] ?? 0) >= 20) return { top: y };
      }
    }
    return { top: 0 };
  }
});
