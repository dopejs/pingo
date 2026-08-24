import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  createPingoUiStyleSheet,
} from "@dopejs/pingo-ui";
import {
  createElement,
  createHostedCanvasRoot,
  useSignal,
  type FrameReport,
  type PingoNode,
} from "@dopejs/pingo";
import { afterEach, describe, expect, it } from "vitest";

/**
 * An anchored panel stays on the surface wherever its trigger is.
 *
 * The skin can only say "below"; how much room that leaves is a runtime fact,
 * so the panel is measured, flipped to the roomier side and capped to what it
 * lands on. Without the cap being enforced by the panel itself the list drew
 * straight through its own border and off the surface, and without preferring
 * the roomier side a trigger with no side that fits stayed pinned below.
 */
const pause = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

async function waitUntil(check: () => boolean, timeoutMs = 2000): Promise<boolean> {
  const end = performance.now() + timeoutMs;
  while (performance.now() < end) {
    if (check()) return true;
    await pause(8);
  }
  return check();
}

describe("anchored placement", () => {
  const roots: Array<{ close: () => Promise<void> }> = [];

  afterEach(async () => {
    for (const root of roots.splice(0)) await root.close();
    document.body.replaceChildren();
  });

  const WIDTH = 400;
  const HEIGHT = 300;

  /** Opens a six-item select whose trigger sits `top` pixels down the surface. */
  async function open(top: number): Promise<{
    readonly closed: { top: number; bottom: number };
    readonly opened: { top: number; bottom: number };
    readonly canvas: HTMLCanvasElement;
  }> {
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
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
        style: { flexDirection: "column", paddingTop: `${String(top)}px`, alignItems: "center" },
        children: createElement("container", {
          width: 200,
          style: { flexDirection: "column" },
          children: createElement(Select, {
            value: "b",
            onValueChange: () => undefined,
            children: [
              createElement(SelectTrigger, { placeholder: "pick" }),
              createElement(SelectContent, {
                children: ["a", "b", "c", "d", "e", "f"].map((value) =>
                  createElement(SelectItem, { key: value, value, children: `item ${value}` }),
                ),
              }),
            ],
          }),
        }),
      }),
    );
    expect(await waitUntil(() => frames.some((frame) => frame.cause === "mutation"))).toBe(true);
    const ink = (): { top: number; bottom: number } => {
      const context = canvas.getContext("2d");
      if (context === null) throw new Error("Chromium did not provide Canvas2D");
      const data = context.getImageData(0, 0, WIDTH, HEIGHT).data;
      let first = -1;
      let last = -1;
      for (let y = 0; y < HEIGHT; y += 1) {
        for (let x = 0; x < WIDTH; x += 1) {
          if ((data[(y * WIDTH + x) * 4 + 3] ?? 0) < 20) continue;
          if (first < 0) first = y;
          last = y;
          break;
        }
      }
      return { top: first, bottom: last };
    };
    const closed = ink();
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
          clientY: rect.top + top + 10,
          pointerId: 3,
        }),
      );
    }
    canvas.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        clientX: rect.left + WIDTH / 2,
        clientY: rect.top + top + 10,
      }),
    );
    expect(
      await waitUntil(() => {
        const now = ink();
        return now.bottom > closed.bottom + 10 || now.top < closed.top - 10;
      }),
    ).toBe(true);
    await pause(120);
    return { closed, opened: ink(), canvas };
  }

  it("opens and selects while the page re-renders under the press", async () => {
    // The condition that broke every anchored overlay in real use: something
    // re-renders between the focus leaving the anchor and the focus arriving
    // inside it. Pairing those two events per render lost the cancellation, so
    // the panel closed itself on the very press that opened it -- a select that
    // "cannot be opened" -- and a press on an item closed the panel before the
    // click could select anything.
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    document.body.append(canvas);
    const frames: FrameReport[] = [];
    const picked: string[] = [];
    const semantics: Array<Record<string, unknown>> = [];
    const root = await createHostedCanvasRoot(canvas, {
      styleSheets: [createPingoUiStyleSheet()],
      onFrame: (report) => frames.push(report),
      onSemantics: (snapshot: unknown) => {
        semantics.length = 0;
        semantics.push(...(Array.isArray(snapshot) ? (snapshot as Record<string, unknown>[]) : []));
      },
      transport: { preference: "main-thread", strict: true },
    });
    roots.push(root);
    function Page(): PingoNode {
      const ticks = useSignal(0);
      return createElement("container", {
        width: WIDTH,
        height: HEIGHT,
        style: { flexDirection: "column", paddingTop: "10px", alignItems: "center" },
        onPointerDown: () => ticks.set(ticks.peek() + 1),
        children: createElement("container", {
          width: 200,
          style: { flexDirection: "column" },
          children: createElement(Select, {
            value: "b",
            onValueChange: (value: string) => picked.push(value),
            // Reading the counter is what makes the press re-render the overlay.
            semanticLabel: `press ${String(ticks.get())}`,
            children: [
              createElement(SelectTrigger, { placeholder: "pick" }),
              createElement(SelectContent, {
                children: ["a", "b", "c"].map((value) =>
                  createElement(SelectItem, { key: value, value, children: `item ${value}` }),
                ),
              }),
            ],
          }),
        }),
      });
    }
    root.render(createElement(Page, {}));
    expect(await waitUntil(() => frames.some((frame) => frame.cause === "mutation"))).toBe(true);

    const rect = canvas.getBoundingClientRect();
    const click = async (x: number, y: number): Promise<void> => {
      canvas.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          buttons: 1,
          clientX: rect.left + x,
          clientY: rect.top + y,
          pointerId: 3,
        }),
      );
      await pause(40);
      canvas.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
          buttons: 0,
          clientX: rect.left + x,
          clientY: rect.top + y,
          pointerId: 3,
        }),
      );
      canvas.dispatchEvent(
        new MouseEvent("click", { bubbles: true, clientX: rect.left + x, clientY: rect.top + y }),
      );
      await pause(150);
    };
    const bounds = (node: Record<string, unknown> | undefined): Record<string, number> =>
      (node?.bounds ?? {}) as Record<string, number>;

    const trigger = bounds(semantics.find((node) => String(node.role) === "button"));
    await click((trigger.left ?? 0) + 20, (trigger.top ?? 0) + 10);
    const items = semantics.filter((node) => String(node.role) === "menuitem");
    expect(items).toHaveLength(3);

    const third = bounds(items[2]);
    await click((third.left ?? 0) + 20, (third.top ?? 0) + (third.height ?? 0) / 2);
    expect(picked).toEqual(["c"]);
    expect(semantics.filter((node) => String(node.role) === "menuitem")).toHaveLength(0);
  });

  it("drops below a trigger with room under it", async () => {
    const { closed, opened } = await open(10);
    expect(opened.top).toBe(closed.top);
    expect(opened.bottom).toBeGreaterThan(closed.bottom);
    // The whole panel is on the surface rather than running off the bottom.
    expect(opened.bottom).toBeLessThan(HEIGHT - 1);
  });

  it("flips above a trigger with no room under it", async () => {
    const { closed, opened } = await open(240);
    expect(opened.bottom).toBe(closed.bottom);
    expect(opened.top).toBeLessThan(closed.top - 20);
    expect(opened.top).toBeGreaterThanOrEqual(0);
  });

  it("caps a panel that fits on neither side, and lets it scroll", async () => {
    const { closed, opened, canvas } = await open(120);
    // Capped to the room below rather than drawn through the surface edge.
    expect(opened.bottom).toBeLessThanOrEqual(HEIGHT - 1);

    const context = canvas.getContext("2d");
    if (context === null) throw new Error("Chromium did not provide Canvas2D");
    // Text, not the scrollbar: Core draws the panel's bar down its right edge
    // from the first row, and it is a faded foreground rather than the near
    // black a glyph is. Anything above the glyphs would answer "did the list
    // move" with the bar's own position, which moves the other way.
    const GLYPH_INK = 60;
    const firstDarkRow = (): number => {
      const data = context.getImageData(0, 0, WIDTH, HEIGHT).data;
      for (let y = closed.bottom + 12; y <= opened.bottom; y += 1) {
        for (let x = 0; x < WIDTH; x += 1) {
          const index = (y * WIDTH + x) * 4;
          if ((data[index + 3] ?? 0) > 40 && (data[index] ?? 255) < GLYPH_INK) return y;
        }
      }
      return -1;
    };
    const before = firstDarkRow();
    expect(before).toBeGreaterThan(0);
    const rect = canvas.getBoundingClientRect();
    canvas.dispatchEvent(
      new WheelEvent("wheel", {
        bubbles: true,
        cancelable: true,
        deltaY: 60,
        clientX: rect.left + WIDTH / 2,
        clientY: rect.top + (opened.top + opened.bottom) / 2,
      }),
    );
    await pause(200);
    // The items a cap cuts off are still reachable.
    expect(firstDarkRow()).toBeLessThan(before);
  });
});
