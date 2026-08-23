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

  /** Everything painted: how many pixels, and the rows they span. */
  function paintedRows(canvas: HTMLCanvasElement, height: number) {
    const context = canvas.getContext("2d");
    if (context === null) throw new Error("Chromium did not provide Canvas2D");
    const data = context.getImageData(0, 0, WIDTH, height).data;
    let top = -1;
    let bottom = -1;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < WIDTH; x += 1) {
        if ((data[(y * WIDTH + x) * 4 + 3] ?? 0) < 20) continue;
        if (top < 0) top = y;
        bottom = y;
        break;
      }
    }
    return { top, bottom };
  }

  // Every anchored overlay in the previews. They used to be rendered open,
  // which is what a static preview needed and reads as stuck now that the
  // previews respond to the pointer.
  it.each([
    "select-basic",
    "combobox-basic",
    "date-picker-basic",
    "popover-basic",
    "popover-rich",
    "dropdown-menu-basic",
    "hover-card-basic",
  ])("opens %s from the trigger rather than starting open", async (name) => {
    const { canvas, height } = await mount(name);
    const closed = paintedRows(canvas, height);
    // A closed overlay is a trigger and nothing else: one control's worth of
    // rows, not a panel below it.
    expect(closed.bottom - closed.top).toBeLessThan(60);

    const rect = canvas.getBoundingClientRect();
    const y = closed.top + 10;
    const context = canvas.getContext("2d");
    if (context === null) throw new Error("Chromium did not provide Canvas2D");
    const row = context.getImageData(0, y, WIDTH, 1).data;
    let x = -1;
    for (let column = 0; column < WIDTH; column += 1) {
      if ((row[column * 4 + 3] ?? 0) >= 20) {
        x = column + 20;
        break;
      }
    }
    expect(x).toBeGreaterThan(0);
    // A hover card opens on the move; the rest on the press.
    for (const [type, buttons] of [
      ["pointermove", 0],
      ["pointerdown", 1],
      ["pointerup", 0],
    ] as const) {
      canvas.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          buttons,
          clientX: rect.left + x,
          clientY: rect.top + y,
          pointerId: 3,
        }),
      );
    }
    canvas.dispatchEvent(
      new MouseEvent("click", { bubbles: true, clientX: rect.left + x, clientY: rect.top + y }),
    );
    expect(await waitUntil(() => paintedRows(canvas, height).bottom > closed.bottom + 20)).toBe(
      true,
    );
  });

  // The hover card is left out: it opens on hover and closes when the pointer
  // leaves, which the test below covers. The rest open on a press, and an
  // anchored overlay has no backdrop to absorb the next one -- Core moves focus
  // to whatever a press hits, so focus leaving the anchor is what puts them
  // away. Without it only Escape did.
  it.each([
    "select-basic",
    "combobox-basic",
    "date-picker-basic",
    "popover-basic",
    "popover-rich",
    "dropdown-menu-basic",
  ])("closes %s from a press outside it", async (name) => {
    const { canvas, height } = await mount(name);
    const closed = paintedRows(canvas, height);
    const rect = canvas.getBoundingClientRect();
    const press = (x: number, y: number): void => {
      for (const [type, buttons] of [
        ["pointerdown", 1],
        ["pointerup", 0],
      ] as const) {
        canvas.dispatchEvent(
          new PointerEvent(type, {
            bubbles: true,
            buttons,
            clientX: rect.left + x,
            clientY: rect.top + y,
            pointerId: 4,
          }),
        );
      }
      canvas.dispatchEvent(
        new MouseEvent("click", { bubbles: true, clientX: rect.left + x, clientY: rect.top + y }),
      );
    };
    press(WIDTH / 2, closed.top + 10);
    expect(await waitUntil(() => paintedRows(canvas, height).bottom > closed.bottom + 20)).toBe(
      true,
    );

    press(20, height - 10);
    expect(await waitUntil(() => paintedRows(canvas, height).bottom <= closed.bottom + 4)).toBe(
      true,
    );
  });

  // Same six, opened and then pressed *inside*. The dismissal watches focus
  // leaving the anchor, and a press inside moves focus to a node within it, so
  // the `focusin` that follows has to cancel the close.
  it.each([
    "select-basic",
    "combobox-basic",
    "date-picker-basic",
    "popover-basic",
    "popover-rich",
    "dropdown-menu-basic",
  ])("keeps %s open when the press lands inside the panel", async (name) => {
    const { canvas, height } = await mount(name);
    const closed = paintedRows(canvas, height);
    const rect = canvas.getBoundingClientRect();
    const press = (x: number, y: number): void => {
      for (const [type, buttons] of [
        ["pointerdown", 1],
        ["pointerup", 0],
      ] as const) {
        canvas.dispatchEvent(
          new PointerEvent(type, {
            bubbles: true,
            buttons,
            clientX: rect.left + x,
            clientY: rect.top + y,
            pointerId: 8,
          }),
        );
      }
      canvas.dispatchEvent(
        new MouseEvent("click", { bubbles: true, clientX: rect.left + x, clientY: rect.top + y }),
      );
    };
    press(WIDTH / 2, closed.top + 10);
    expect(await waitUntil(() => paintedRows(canvas, height).bottom > closed.bottom + 20)).toBe(
      true,
    );
    const opened = paintedRows(canvas, height);
    // The panel has to be wholly inside the preview, or a press meant for it
    // lands past its edge and reads as a press outside.
    expect(opened.bottom).toBeLessThan(height - 1);

    // Just inside the panel's top border, which is padding rather than an item:
    // selecting one is supposed to close the menu.
    press(WIDTH / 2, closed.bottom + 11);
    await waitUntil(() => false, 200);
    expect(paintedRows(canvas, height).bottom).toBeGreaterThan(closed.bottom + 20);
  });

  it("spans the calendar header across the weeks below it", async () => {
    const { canvas, height } = await mount("date-picker-basic");
    const rect = canvas.getBoundingClientRect();
    for (const [type, buttons] of [
      ["pointerdown", 1],
      ["pointerup", 0],
    ] as const) {
      canvas.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          buttons,
          clientX: rect.left + WIDTH / 2,
          clientY: rect.top + 30,
          pointerId: 9,
        }),
      );
    }
    canvas.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        clientX: rect.left + WIDTH / 2,
        clientY: rect.top + 30,
      }),
    );
    expect(await waitUntil(() => paintedRows(canvas, height).bottom > 200)).toBe(true);

    const context = canvas.getContext("2d");
    if (context === null) throw new Error("Chromium did not provide Canvas2D");
    const data = context.getImageData(0, 0, WIDTH, height).data;
    // Dark ink only: the panel's border and background are far too light.
    const darkSpan = (y: number): number => {
      let left = -1;
      let right = -1;
      for (let x = 0; x < WIDTH; x += 1) {
        const index = (y * WIDTH + x) * 4;
        if ((data[index + 3] ?? 0) < 40 || (data[index] ?? 255) > 150) continue;
        if (left < 0) left = x;
        right = x;
      }
      return right - left;
    };
    let header = 0;
    let weeks = 0;
    for (let y = 60; y < height; y += 1) {
      const span = darkSpan(y);
      if (y < 95) header = Math.max(header, span);
      else weeks = Math.max(weeks, span);
    }
    // The month title and its two arrows sit on the same axis as the seven
    // columns. A shrink-to-fit calendar left the header at the width of its own
    // three items -- about half the grid -- with both arrows beside the title.
    expect(weeks).toBeGreaterThan(150);
    expect(header).toBeGreaterThan(weeks - 20);
  });

  it("closes a hover card when the pointer leaves it", async () => {
    const { canvas, height } = await mount("hover-card-basic");
    const closed = paintedRows(canvas, height);
    const rect = canvas.getBoundingClientRect();
    const move = (x: number, y: number): void => {
      canvas.dispatchEvent(
        new PointerEvent("pointermove", {
          bubbles: true,
          buttons: 0,
          clientX: rect.left + x,
          clientY: rect.top + y,
          pointerId: 7,
        }),
      );
    };
    move(WIDTH / 2, closed.top + 8);
    expect(await waitUntil(() => paintedRows(canvas, height).bottom > closed.bottom + 20)).toBe(
      true,
    );
    move(20, height - 10);
    expect(await waitUntil(() => paintedRows(canvas, height).bottom <= closed.bottom + 4)).toBe(
      true,
    );
  });

  it.each(["combobox-basic", "date-picker-basic"])(
    "drops %s's panel below its trigger instead of over it",
    async (name) => {
      const { canvas, height } = await mount(name);
      const closed = paintedRows(canvas, height);
      const rect = canvas.getBoundingClientRect();
      for (const [type, buttons] of [
        ["pointerdown", 1],
        ["pointerup", 0],
      ] as const) {
        canvas.dispatchEvent(
          new PointerEvent(type, {
            bubbles: true,
            buttons,
            clientX: rect.left + WIDTH / 2,
            clientY: rect.top + closed.top + 10,
            pointerId: 6,
          }),
        );
      }
      canvas.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          clientX: rect.left + WIDTH / 2,
          clientY: rect.top + closed.top + 10,
        }),
      );
      expect(await waitUntil(() => paintedRows(canvas, height).bottom > closed.bottom + 20)).toBe(
        true,
      );

      // The skin places a panel with `top: 100%`, and a percentage needs a
      // definite basis the engine does not have for a column's height, so it
      // resolved to zero and the panel covered its own trigger. These two never
      // measured; the popover and the menus already did.
      const context = canvas.getContext("2d");
      if (context === null) throw new Error("Chromium did not provide Canvas2D");
      const data = context.getImageData(0, 0, WIDTH, height).data;
      let gap = 0;
      for (let y = closed.bottom + 1; y < height; y += 1) {
        let ink = false;
        for (let x = 0; x < WIDTH; x += 1) {
          if ((data[(y * WIDTH + x) * 4 + 3] ?? 0) >= 20) {
            ink = true;
            break;
          }
        }
        if (ink) break;
        gap += 1;
      }
      // A clear band between the trigger and the panel: they do not overlap.
      expect(gap).toBeGreaterThanOrEqual(2);
    },
  );

  it("gives a select's list the width of the control it drops out of", async () => {
    const { canvas, height } = await mount("select-basic");
    const rect = canvas.getBoundingClientRect();
    const closed = paintedRows(canvas, height);
    for (const [type, buttons] of [
      ["pointerdown", 1],
      ["pointerup", 0],
    ] as const) {
      canvas.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          buttons,
          clientX: rect.left + WIDTH / 2,
          clientY: rect.top + closed.top + 10,
          pointerId: 5,
        }),
      );
    }
    canvas.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        clientX: rect.left + WIDTH / 2,
        clientY: rect.top + closed.top + 10,
      }),
    );
    expect(await waitUntil(() => paintedRows(canvas, height).bottom > closed.bottom + 20)).toBe(
      true,
    );

    const context = canvas.getContext("2d");
    if (context === null) throw new Error("Chromium did not provide Canvas2D");
    // Opaque only: the panel's shadow is faint and would widen its extent.
    const extent = (y: number): readonly [number, number] => {
      const row = context.getImageData(0, y, WIDTH, 1).data;
      let left = -1;
      let right = -1;
      for (let column = 0; column < WIDTH; column += 1) {
        if ((row[column * 4 + 3] ?? 0) < 250) continue;
        if (left < 0) left = column;
        right = column;
      }
      return [left, right];
    };
    const trigger = extent(closed.top + 18);
    const panel = extent(paintedRows(canvas, height).bottom - 18);
    // The list took a fixed 260px content box -- 270 with its padding and
    // border -- so it stood 10px narrower than the trigger it belongs to.
    expect(panel).toEqual(trigger);
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
