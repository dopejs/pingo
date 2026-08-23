import { createElement, createHostedCanvasRoot, type FrameReport } from "@dopejs/pingo";
import {
  Combobox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  createPingoUiStyleSheet,
} from "@dopejs/pingo-ui";
import { afterEach, describe, expect, it } from "vitest";

/**
 * An option row is as wide as the list it sits in.
 *
 * The rows carry no width of their own: they fill the panel because a flex
 * column stretches its children, and that is what makes the hover and the
 * selected highlight span the row rather than shrink-wrap the label. The
 * panels scroll, so their children may overflow -- and the engine read the
 * cross size of the line off the constraint that relaxation had already set to
 * infinity, so every row in a scrolling panel fell back to shrink-to-fit and
 * the highlight became a pill around the text.
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

describe("option row width", () => {
  const roots: Array<{ close: () => Promise<void> }> = [];

  afterEach(async () => {
    for (const root of roots.splice(0)) await root.close();
    document.body.replaceChildren();
  });

  const WIDTH = 420;
  const HEIGHT = 320;
  /** The panel is `$border-width` and `$popover-padding` inside the anchor. */
  const PANEL_INSETS = 2 * 1 + 2 * 4;
  const ANCHOR_WIDTH = 280;

  const ITEMS = [
    { value: "pingo", label: "@dopejs/pingo" },
    { value: "pingo-ui", label: "@dopejs/pingo-ui" },
    { value: "pingo-editing", label: "@dopejs/pingo-editing" },
  ];

  async function openAndMeasure(tree: unknown, role: string): Promise<number[]> {
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.cssText = `display:block;width:${String(WIDTH)}px;height:${String(HEIGHT)}px`;
    document.body.append(canvas);
    const frames: FrameReport[] = [];
    let semantics: Array<Record<string, unknown>> = [];
    // No transport preference: the same default a real application takes.
    const root = await createHostedCanvasRoot(canvas, {
      styleSheets: [createPingoUiStyleSheet()],
      onFrame: (report) => frames.push(report),
      onSemantics: (snapshot: unknown) => {
        semantics = Array.isArray(snapshot) ? (snapshot as Record<string, unknown>[]) : [];
      },
    });
    roots.push(root);
    root.render(tree as never);
    expect(await waitUntil(() => frames.length > 0)).toBe(true);
    expect(await waitUntil(() => semantics.length > 0)).toBe(true);

    const bounds = (node: Record<string, unknown> | undefined): Record<string, number> =>
      (node?.bounds ?? {}) as Record<string, number>;
    const rect = canvas.getBoundingClientRect();
    const trigger = bounds(semantics.find((node) => String(node.role) === "button"));
    const x = rect.left + (trigger.left ?? 0) + 20;
    const y = rect.top + (trigger.top ?? 0) + 10;
    for (const [type, buttons] of [
      ["pointermove", 0],
      ["pointerdown", 1],
      ["pointerup", 0],
    ] as const) {
      canvas.dispatchEvent(
        new PointerEvent(type, { bubbles: true, buttons, clientX: x, clientY: y, pointerId: 3 }),
      );
    }
    canvas.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: x, clientY: y }));
    expect(await waitUntil(() => semantics.some((node) => String(node.role) === role), 2000)).toBe(
      true,
    );
    // The panel is placed a frame after it mounts; the rows are laid out with it.
    await pause(250);
    return semantics
      .filter((node) => String(node.role) === role)
      .map((node) => Math.round(bounds(node).width ?? 0));
  }

  /** Anchor with a definite width, as every real caller and preview gives it. */
  const anchored = (child: unknown): unknown =>
    createElement("container", {
      width: WIDTH,
      height: HEIGHT,
      style: { flexDirection: "column", alignItems: "center", paddingTop: "16px" },
      children: createElement("container", {
        width: ANCHOR_WIDTH,
        style: { flexDirection: "column" },
        children: child as never,
      }),
    });

  it("fills the select's list with every option", async () => {
    const widths = await openAndMeasure(
      anchored(
        createElement(Select, {
          value: "pingo-ui",
          onValueChange: () => undefined,
          children: [
            createElement(SelectTrigger, { placeholder: "选择一个包" }),
            createElement(SelectContent, {
              children: ITEMS.map((item) =>
                createElement(SelectItem, { value: item.value, children: item.label }),
              ),
            }),
          ],
        }),
      ),
      "menuitem",
    );
    expect(widths).toEqual(ITEMS.map(() => ANCHOR_WIDTH - PANEL_INSETS));
  }, 60_000);

  it("fills the combobox's list with every option", async () => {
    const widths = await openAndMeasure(
      anchored(
        createElement(Combobox, {
          items: ITEMS,
          defaultValue: "pingo-ui",
          onValueChange: () => undefined,
        }),
      ),
      "option",
    );
    // One list, one width, and wider than the longest label draws.
    expect(new Set(widths).size).toBe(1);
    expect(widths).toHaveLength(ITEMS.length);
    expect(widths[0]).toBeGreaterThan(ANCHOR_WIDTH - 3 * PANEL_INSETS);
  }, 60_000);
});
