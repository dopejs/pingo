import { createElement, createHostedCanvasRoot, type FrameReport } from "@dopejs/pingo";
import { Table, createPingoUiStyleSheet, type TableColumn } from "@dopejs/pingo-ui";
import { afterEach, describe, expect, it } from "vitest";

/**
 * A table's body columns line up with its header's.
 *
 * Both read the same column spec, so they can only disagree if the rows are
 * measured against something other than the table's width -- and they were.
 * A rendered virtual item is wrapped in an anonymous box that carried no style
 * at all, so Core fell back to a `flex-start` row and the caller's row shrank
 * to its own content; and the list, being scrollable, had relaxed the wrapper's
 * maximum width to infinity, so nothing inside a virtual item could stretch or
 * resolve a percentage either. Every flexible column collapsed in the body
 * while the header kept its share.
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

type Row = { readonly name: string; readonly size: string };

const ROWS: readonly Row[] = [
  { name: "年度规划.docx", size: "2.4 MB" },
  { name: "封面.jpg", size: "1.1 MB" },
  { name: "会议录音.m4a", size: "18.7 MB" },
];

const COLUMNS: readonly TableColumn<Row>[] = [
  // No width: this column takes the remainder, which is the case that failed.
  { key: "name", header: "名称", cell: (row) => createElement("text", { value: row.name }) },
  {
    key: "size",
    header: "大小",
    width: 96,
    align: "end",
    cell: (row) => createElement("text", { value: row.size }),
  },
];

describe("table columns", () => {
  const roots: Array<{ close: () => Promise<void> }> = [];

  afterEach(async () => {
    for (const root of roots.splice(0)) await root.close();
    document.body.replaceChildren();
  });

  const WIDTH = 520;
  const HEIGHT = 300;

  it("gives a body row the same width and columns as the header", async () => {
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.cssText = `display:block;width:${String(WIDTH)}px;height:${String(HEIGHT)}px`;
    document.body.append(canvas);
    const frames: FrameReport[] = [];
    let semantics: Array<Record<string, unknown>> = [];
    const root = await createHostedCanvasRoot(canvas, {
      styleSheets: [createPingoUiStyleSheet()],
      onFrame: (report) => frames.push(report),
      onSemantics: (snapshot: unknown) => {
        semantics = Array.isArray(snapshot) ? (snapshot as Record<string, unknown>[]) : [];
      },
    });
    roots.push(root);
    root.render(
      createElement("container", {
        width: WIDTH,
        height: HEIGHT,
        style: { flexDirection: "column" },
        children: Table<Row>({
          columns: COLUMNS,
          rowCount: ROWS.length,
          getRow: (index) => ROWS[index]!,
        }),
      }),
    );
    expect(await waitUntil(() => frames.length > 0)).toBe(true);
    // The window is planned by Core, so the rows arrive a frame after the list.
    expect(
      await waitUntil(() => semantics.filter((node) => String(node.role) === "row").length > 1),
    ).toBe(true);
    await pause(250);

    const bounds = (node: Record<string, unknown>): Record<string, number> =>
      (node.bounds ?? {}) as Record<string, number>;
    const width = (node: Record<string, unknown>): number => Math.round(bounds(node).width ?? 0);
    const rows = semantics.filter((node) => String(node.role) === "row");
    const headerCells = semantics.filter((node) => String(node.role) === "columnheader");

    expect(headerCells.map(width)).toEqual([WIDTH - 96, 96]);
    // Every body row fills the table, exactly as the header does.
    expect(rows.map(width)).toEqual(rows.map(() => WIDTH));
    expect(rows.length).toBe(ROWS.length + 1);
  }, 60_000);
});
