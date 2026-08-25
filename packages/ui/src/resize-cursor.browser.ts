import {
  createElement,
  createHostedCanvasRoot,
  type FrameReport,
  type PingoNode,
} from "@dopejs/pingo";
import { Resizable, createPingoUiStyleSheet } from "@dopejs/pingo-ui";
import { afterEach, describe, expect, it } from "vitest";

/**
 * A resize handle says which way it moves, and stays usable saying it.
 *
 * The seam wore `cursor: pointer`, which tells a user the thing under it
 * navigates; a splitter names its axis instead. Neither `col-resize` nor
 * `row-resize` was in the CSS subset, and adding them exposed two
 * hand-written copies of the cursor keyword list -- one in Core's hover
 * resolution, one in the event-transaction validator. The second rejected the
 * record, which failed the whole batch: the handle lost its hover, its press
 * and its drag along with its cursor.
 */
const pause = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

describe("resize cursor", () => {
  const roots: Array<{ close: () => Promise<void> }> = [];

  afterEach(async () => {
    for (const root of roots.splice(0)) await root.close();
    document.body.replaceChildren();
  });

  const WIDTH = 300;
  const HEIGHT = 220;

  async function seam(direction: "row" | "column"): Promise<{
    cursor: string;
    dragged: boolean;
  }> {
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.cssText = `display:block;width:${String(WIDTH)}px;height:${String(HEIGHT)}px`;
    document.body.append(canvas);
    const frames: FrameReport[] = [];
    const splits: number[] = [];
    let semantics: Record<string, unknown>[] = [];
    const root = await createHostedCanvasRoot(canvas, {
      styleSheets: [createPingoUiStyleSheet()],
      onFrame: (report) => frames.push(report),
      onSemantics: (nodes: unknown) => {
        semantics = Array.isArray(nodes) ? (nodes as Record<string, unknown>[]) : [];
      },
      transport: { preference: "main-thread", strict: true },
    });
    roots.push(root);
    const pane = (color: string): PingoNode =>
      createElement("container", {
        backgroundColor: color,
        style: { width: "100%", height: "100%" },
      });
    root.render(
      createElement("container", {
        width: WIDTH,
        height: HEIGHT,
        style: { flexDirection: "column", padding: "20px" },
        children: createElement("container", {
          width: 240,
          height: 160,
          style: { flexDirection: "column" },
          children: createElement(Resizable, {
            direction,
            defaultSplit: 0.5,
            first: pane("#3b82f6ff"),
            second: pane("#6366f1ff"),
            onSplitChange: (split: number) => splits.push(split),
          }),
        }),
      }),
    );
    while (!frames.some((report) => report.cause === "mutation")) await pause(16);
    await pause(300);

    const bounds = (semantics.find((node) => String(node.role) === "separator")?.bounds ??
      {}) as Record<string, number>;
    const x = (bounds.left ?? 0) + (bounds.width ?? 0) / 2;
    const y = (bounds.top ?? 0) + (bounds.height ?? 0) / 2;
    const rect = canvas.getBoundingClientRect();
    const at = (kind: string, offset: number, buttons: number): void => {
      canvas.dispatchEvent(
        new PointerEvent(kind, {
          bubbles: true,
          buttons,
          clientX: rect.left + x + (direction === "row" ? offset : 0),
          clientY: rect.top + y + (direction === "row" ? 0 : offset),
          pointerId: 5,
          pointerType: "mouse",
          isPrimary: true,
        }),
      );
    };
    at("pointermove", 0, 0);
    await pause(200);
    const cursor = canvas.style.cursor;

    // The same hit that names the cursor is the one that starts the drag: a
    // rejected transaction takes both. The moves stay on the handle because a
    // synthesised pointer cannot be captured, and without capture a drag ends
    // where the pointer leaves the node.
    at("pointerdown", 0, 1);
    await pause(80);
    for (const offset of [1, 2]) {
      at("pointermove", offset, 1);
      await pause(80);
    }
    at("pointerup", 2, 0);
    await pause(120);
    return { cursor, dragged: splits.length > 0 };
  }

  it("names the axis the seam moves along, and still drags", async () => {
    expect(await seam("row")).toEqual({ cursor: "col-resize", dragged: true });
    expect(await seam("column")).toEqual({ cursor: "row-resize", dragged: true });
  }, 60_000);
});
