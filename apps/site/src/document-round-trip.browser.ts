import type { DocumentSelectionState } from "@dopejs/pingo";
import { Editor } from "@dopejs/pingo/editor";
import {
  createElement,
  createHostedCanvasRoot,
  encodeInputBatch,
  type DocumentSelectionReport,
  type EditTransaction,
  type StructureRequest,
} from "@dopejs/pingo";
import { afterEach, describe, expect, it } from "vitest";

import wasmManifest from "../../../packages/host/wasm/manifest.json";

/**
 * The document round trip, end to end against a real Core.
 *
 * The Shell declares an ordered block sequence on commit; the Core maintains
 * one flat position space over it and owns the caret, the selection and undo.
 * What comes back is a transaction per block whose text changed, a structure
 * request when the edit needs a schema decision the Shell owns, and the
 * selection Core moved.
 *
 * Every part of this was unit-tested on one side of the boundary. None of it
 * said the two halves met: before this, `configureDocument` had no way to reach
 * a commit and the host decoded only the transactions, so the structure
 * requests and selections went straight into the floor.
 */
const rich = wasmManifest.richText;

/**
 * The selection Core last reported, once one satisfying `want` has arrived.
 *
 * Configuring a document reports its initial selection, so waiting for "at
 * least one report" reads that one and races whatever the test just asked for.
 */
async function waitForSelection(
  harness: { readonly selections: readonly DocumentSelectionReport[] },
  want: (selection: DocumentSelectionState) => boolean,
): Promise<DocumentSelectionState> {
  await waitUntil(() => harness.selections.some((report) => want(report.selection)));
  const found = harness.selections.filter((report) => want(report.selection)).at(-1);
  if (found === undefined) throw new Error("Core reported no matching selection");
  return found.selection;
}

async function waitUntil(check: () => boolean, timeoutMs = 5000): Promise<boolean> {
  const end = performance.now() + timeoutMs;
  while (performance.now() < end) {
    if (check()) return true;
    await new Promise((resolve) => setTimeout(resolve, 8));
  }
  return check();
}

describe.skipIf(!rich)("document round trip", () => {
  const roots: Array<{ close: () => Promise<void> }> = [];

  afterEach(async () => {
    for (const root of roots.splice(0)) await root.close();
    document.body.replaceChildren();
  });

  const BLOCKS = [
    { key: 1, text: "first block" },
    { key: 2, text: "second block" },
  ];

  /** A Shell document seeded from the same projection the Core was given. */
  function shellDocument(): Editor {
    return new Editor({
      document: {
        blocks: BLOCKS.map((block) => ({
          key: block.key,
          type: "paragraph" as const,
          attributes: {},
          text: block.text,
          marks: [],
        })),
      },
    });
  }

  interface Harness {
    readonly root: Awaited<ReturnType<typeof createHostedCanvasRoot>>;
    readonly transactions: EditTransaction[];
    readonly structure: StructureRequest[];
    readonly selections: DocumentSelectionReport[];
    readonly documentNodeId: () => number;
    readonly blockNodeIds: () => readonly number[];
    send(commands: Parameters<typeof encodeInputBatch>[0]["commands"]): void;
  }

  async function mount(): Promise<Harness> {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 200;
    document.body.append(canvas);
    const transactions: EditTransaction[] = [];
    const structure: StructureRequest[] = [];
    const selections: DocumentSelectionReport[] = [];
    let documentNodeId = 0;
    const blockNodeIds: number[] = [];
    let sequence = 1;
    const root = await createHostedCanvasRoot(canvas, {
      onEditTransaction: (transaction) => transactions.push(transaction),
      onStructureRequest: (request) => structure.push(request),
      onDocumentSelection: (report) => selections.push(report),
    });
    roots.push(root);
    root.render(
      createElement("container", {
        width: 400,
        height: 200,
        backgroundColor: "#ffffffff",
        padding: 8,
        ref: (handle: { readonly nodeId: number } | null) => {
          if (handle !== null) documentNodeId = handle.nodeId;
        },
        document: {
          revision: 1n,
          blocks: BLOCKS.map((block) => ({ key: block.key, lenUtf16: block.text.length })),
        },
        children: BLOCKS.map((block, index) =>
          createElement("text", {
            key: block.key,
            blockKey: block.key,
            ref: (handle: { readonly nodeId: number } | null) => {
              if (handle !== null) blockNodeIds[index] = handle.nodeId;
            },
            value: block.text,
            fontSize: 14,
            lineHeight: 22,
            color: "#000000ff",
          }),
        ),
      }),
    );
    return {
      root,
      transactions,
      structure,
      selections,
      documentNodeId: () => documentNodeId,
      blockNodeIds: () => blockNodeIds,
      send: (commands) => {
        root.dispatchInput(encodeInputBatch({ frameSeq: sequence, commands }));
        sequence += 1;
      },
    };
  }

  it("inserts into the block the caret is in and leaves the other one alone", async () => {
    const harness = await mount();
    const nodeId = harness.documentNodeId();
    expect(nodeId).not.toBe(0);

    harness.send([
      {
        type: "setDocumentSelection",
        nodeId,
        baseRevision: 0n,
        selection: { kind: "text", anchorKey: 1, anchorOffset: 5, focusKey: 1, focusOffset: 5 },
      },
    ]);
    await waitUntil(() => harness.selections.length > 0);
    expect(harness.selections.at(-1)?.selection).toEqual({
      kind: "text",
      anchorKey: 1,
      anchorOffset: 5,
      focusKey: 1,
      focusOffset: 5,
    });

    harness.send([
      {
        type: "editDocument",
        nodeId,
        baseRevision: 0n,
        operation: "insert",
        style: 0,
        font: 0,
        text: "XY",
      },
    ]);
    await waitUntil(() => harness.transactions.length > 0);

    // One transaction, for the block the caret was in. A document-wide edit
    // that reported every block would make the Shell re-render the whole
    // document for a two-character insertion.
    expect(harness.transactions).toHaveLength(1);
    const delta = harness.transactions[0]?.delta;
    expect(delta?.text).toBe("XY");
    expect(delta?.range).toEqual({ start: 5, end: 5 });
    // The caret moved past what was typed, without the Shell being asked.
    expect(harness.selections.at(-1)?.selection).toEqual({
      kind: "text",
      anchorKey: 1,
      anchorOffset: 7,
      focusKey: 1,
      focusOffset: 7,
    });
  });

  it("moves the caret across a block boundary, which is one position space", async () => {
    const harness = await mount();
    const nodeId = harness.documentNodeId();

    harness.send([
      {
        type: "setDocumentSelection",
        nodeId,
        baseRevision: 0n,
        selection: {
          kind: "text",
          anchorKey: 1,
          anchorOffset: BLOCKS[0]!.text.length,
          focusKey: 1,
          focusOffset: BLOCKS[0]!.text.length,
        },
      },
    ]);
    await waitUntil(() => harness.selections.length > 0);

    // Two steps forward from the end of the first block: out of it, then into
    // the second. Crossing is the point -- the Core's positions run across the
    // whole sequence, so this needs no help from the Shell.
    harness.send([
      {
        type: "moveDocumentCaret",
        nodeId,
        direction: "forward",
        granularity: "grapheme",
        extend: false,
      },
      {
        type: "moveDocumentCaret",
        nodeId,
        direction: "forward",
        granularity: "grapheme",
        extend: false,
      },
    ]);
    await waitUntil(
      () =>
        harness.selections.at(-1)?.selection.kind === "text" &&
        (harness.selections.at(-1)?.selection as { focusKey: number }).focusKey === 2,
    );
    expect(harness.selections.at(-1)?.selection).toEqual({
      kind: "text",
      anchorKey: 2,
      anchorOffset: 0,
      focusKey: 2,
      focusOffset: 0,
    });
  });

  it("keeps the Shell's own document in step with what was typed", async () => {
    const { Editor } = await import("@dopejs/pingo/editor");
    const harness = await mount();
    const nodeId = harness.documentNodeId();
    const editor = new Editor({
      document: {
        blocks: BLOCKS.map((block) => ({
          key: block.key,
          type: "paragraph" as const,
          attributes: {},
          text: block.text,
          marks: [],
        })),
      },
    });
    // The map the editor needs is node to key; the harness renders the blocks
    // in declaration order, so the transaction's nodeId identifies the block.
    const nodeToKey = new Map<number, number>();

    harness.send([
      {
        type: "setDocumentSelection",
        nodeId,
        baseRevision: 0n,
        selection: { kind: "text", anchorKey: 2, anchorOffset: 6, focusKey: 2, focusOffset: 6 },
      },
    ]);
    await waitUntil(() => harness.selections.length > 0);
    harness.send([
      {
        type: "editDocument",
        nodeId,
        baseRevision: 0n,
        operation: "insert",
        style: 0,
        font: 0,
        text: "!!",
      },
    ]);
    await waitUntil(() => harness.transactions.length > 0);

    const transaction = harness.transactions[0]!;
    nodeToKey.set(transaction.nodeId, 2);
    editor.applyEditStream(
      { transactions: [transaction], structure: [], selections: harness.selections },
      nodeToKey,
    );
    // Core owns the caret and applies the edit; the Shell's copy is only
    // correct if the transaction carries the delta back. Without it the two
    // diverge on the first keystroke and every later offset is wrong.
    expect(editor.document.blocks[1]?.text).toBe("second!! block");
    expect(editor.document.blocks[0]?.text).toBe(BLOCKS[0]!.text);
  });

  it("places the caret where the press landed, in whichever block it landed in", async () => {
    const harness = await mount();
    // A press carries the node it hit. The blocks render in declaration order,
    // so the second block's node is the one the second transaction reports --
    // but nothing has been typed yet, so ask the Core instead by pressing and
    // reading back where the caret went.
    const nodes = harness.blockNodeIds();
    expect(nodes).toHaveLength(2);

    // Well inside the second block, past its first characters.
    harness.send([
      { type: "placeCaret", nodeId: nodes[1]!, x: 60, y: 8, extend: false, word: false },
    ]);
    const placed = await waitForSelection(
      harness,
      (selection) => selection.kind === "text" && selection.focusKey === 2,
    );
    if (placed.kind !== "text") throw new Error("expected a text selection");
    // The block the press was in, not the document's first block, and an
    // offset the press chose rather than zero.
    expect(placed.focusKey).toBe(2);
    expect(placed.anchorKey).toBe(2);
    expect(placed.focusOffset).toBeGreaterThan(0);
    expect(placed.focusOffset).toBeLessThanOrEqual(BLOCKS[1]!.text.length);
    expect(placed.anchorOffset).toBe(placed.focusOffset);

    // A press at the very start of the first block collapses to offset zero
    // there, which is the other end of the same resolution.
    harness.send([
      { type: "placeCaret", nodeId: nodes[0]!, x: 0, y: 4, extend: false, word: false },
    ]);
    const start = await waitForSelection(
      harness,
      (selection) => selection.kind === "text" && selection.focusKey === 1,
    );
    if (start.kind !== "text") throw new Error("expected a text selection");
    expect(start.focusKey).toBe(1);
    expect(start.focusOffset).toBe(0);
  });

  it("extends the existing selection when a press asks to, across blocks", async () => {
    const harness = await mount();
    const nodes = harness.blockNodeIds();

    harness.send([
      { type: "placeCaret", nodeId: nodes[0]!, x: 20, y: 8, extend: false, word: false },
    ]);
    const first = await waitForSelection(
      harness,
      (selection) => selection.kind === "text" && selection.focusKey === 1,
    );
    if (first.kind !== "text") throw new Error("expected a text selection");
    const anchorOffset = first.anchorOffset;

    // Shift-press in the other block: the anchor stays where the Core already
    // had it, which is what makes a selection span two blocks at all.
    harness.send([
      { type: "placeCaret", nodeId: nodes[1]!, x: 40, y: 8, extend: true, word: false },
    ]);
    const extended = await waitForSelection(
      harness,
      (selection) => selection.kind === "text" && selection.focusKey === 2,
    );
    if (extended.kind !== "text") throw new Error("expected a text selection");
    expect(extended.anchorKey).toBe(1);
    expect(extended.anchorOffset).toBe(anchorOffset);
    expect(extended.focusKey).toBe(2);
  });

  it("composes an input method sequence inside the block the caret is in", async () => {
    const harness = await mount();
    const nodeId = harness.documentNodeId();

    harness.send([
      {
        type: "setDocumentSelection",
        nodeId,
        baseRevision: 0n,
        selection: { kind: "text", anchorKey: 2, anchorOffset: 6, focusKey: 2, focusOffset: 6 },
      },
    ]);
    await waitUntil(() => harness.selections.length > 0);

    // A pinyin sequence: the composing text is replaced in place each time the
    // candidate changes, and only the commit is a finished edit. Replacing
    // rather than appending is the whole point -- appending would leave every
    // intermediate candidate in the block.
    harness.send([{ type: "beginComposition", nodeId, baseRevision: 0n }]);
    harness.send([{ type: "updateComposition", nodeId, baseRevision: 0n, text: "ni" }]);
    await waitUntil(() => harness.transactions.length > 0);
    harness.send([{ type: "updateComposition", nodeId, baseRevision: 0n, text: "nih" }]);
    harness.send([{ type: "updateComposition", nodeId, baseRevision: 0n, text: "\u4f60" }]);
    harness.send([{ type: "commitComposition", nodeId, baseRevision: 0n, text: "\u4f60\u597d" }]);
    await waitUntil(() => harness.transactions.length >= 4);

    // Replay every transaction into a Shell document and read the result: one
    // committed word at the caret, not a trail of candidates.
    const editor = shellDocument();
    const nodeToKey = new Map(harness.blockNodeIds().map((node, index) => [node, index + 1]));
    editor.applyEditStream(
      { transactions: harness.transactions, structure: [], selections: harness.selections },
      nodeToKey,
    );
    const before = BLOCKS[1]!.text;
    expect(editor.document.blocks[1]?.text).toBe(
      `${before.slice(0, 6)}\u4f60\u597d${before.slice(6)}`,
    );
    expect(editor.document.blocks[0]?.text).toBe(BLOCKS[0]!.text);
  });

  it("leaves nothing behind when a composition is cancelled", async () => {
    const harness = await mount();
    const nodeId = harness.documentNodeId();

    harness.send([
      {
        type: "setDocumentSelection",
        nodeId,
        baseRevision: 0n,
        selection: { kind: "text", anchorKey: 1, anchorOffset: 5, focusKey: 1, focusOffset: 5 },
      },
    ]);
    await waitUntil(() => harness.selections.length > 0);
    harness.send([{ type: "beginComposition", nodeId, baseRevision: 0n }]);
    harness.send([{ type: "updateComposition", nodeId, baseRevision: 0n, text: "wo" }]);
    await waitUntil(() => harness.transactions.length > 0);
    harness.send([{ type: "cancelComposition", nodeId, baseRevision: 0n }]);
    // Cancelling replaces the composing range with nothing, so the last
    // transaction is the one whose delta is empty over a non-empty range.
    await waitUntil(() =>
      harness.transactions.some(
        (transaction) =>
          transaction.delta?.text === "" &&
          transaction.delta.range.end > transaction.delta.range.start,
      ),
    );

    const editor = shellDocument();
    const nodeToKey = new Map(harness.blockNodeIds().map((node, index) => [node, index + 1]));
    editor.applyEditStream(
      { transactions: harness.transactions, structure: [], selections: harness.selections },
      nodeToKey,
    );
    // Abandoning a candidate must restore the block, not leave the romanisation
    // sitting in the text.
    expect(editor.document.blocks[0]?.text).toBe(BLOCKS[0]!.text);
  });

  it("undoes a typing burst as one step, not one character", async () => {
    const harness = await mount();
    const nodeId = harness.documentNodeId();

    harness.send([
      {
        type: "setDocumentSelection",
        nodeId,
        baseRevision: 0n,
        selection: { kind: "text", anchorKey: 1, anchorOffset: 5, focusKey: 1, focusOffset: 5 },
      },
    ]);
    await waitForSelection(harness, (selection) => selection.kind === "text");

    for (const character of "typed") {
      harness.send([{ type: "insert", nodeId, baseRevision: 0n, text: character }]);
    }
    await waitUntil(() => harness.transactions.length >= 5);

    const editor = shellDocument();
    const nodeToKey = new Map(harness.blockNodeIds().map((node, index) => [node, index + 1]));
    editor.applyEditStream(
      { transactions: harness.transactions, structure: [], selections: harness.selections },
      nodeToKey,
    );
    expect(editor.document.blocks[0]?.text).toBe("firsttyped block");

    // One undo takes the whole burst: every keystroke continued the one before
    // it at the same caret, so they are one step rather than five.
    const before = harness.transactions.length;
    harness.send([{ type: "undo", nodeId, baseRevision: 0n }]);
    await waitUntil(() => harness.transactions.length > before);

    const after = shellDocument();
    after.applyEditStream(
      { transactions: harness.transactions, structure: [], selections: harness.selections },
      nodeToKey,
    );
    expect(after.document.blocks[0]?.text).toBe(BLOCKS[0]!.text);

    const undone = harness.transactions.length;
    harness.send([{ type: "redo", nodeId, baseRevision: 0n }]);
    await waitUntil(() => harness.transactions.length > undone);
    const redone = shellDocument();
    redone.applyEditStream(
      { transactions: harness.transactions, structure: [], selections: harness.selections },
      nodeToKey,
    );
    expect(redone.document.blocks[0]?.text).toBe("firsttyped block");
  });

  it("asks the Shell to split rather than splitting a document it does not own", async () => {
    const harness = await mount();
    const nodeId = harness.documentNodeId();

    harness.send([
      {
        type: "setDocumentSelection",
        nodeId,
        baseRevision: 0n,
        selection: { kind: "text", anchorKey: 1, anchorOffset: 5, focusKey: 1, focusOffset: 5 },
      },
    ]);
    await waitUntil(() => harness.selections.length > 0);

    harness.send([
      {
        type: "editDocument",
        nodeId,
        baseRevision: 0n,
        operation: "split",
        style: 0,
        font: 0,
        text: "",
      },
    ]);
    await waitUntil(() => harness.structure.length > 0);

    // Core moved the caret optimistically and asked; whether Enter here makes a
    // paragraph, a list item, or ends the list is a schema question, and the
    // schema is the Shell's.
    expect(harness.structure).toHaveLength(1);
    expect(harness.structure[0]?.kind).toBe("split");
    expect(harness.structure[0]?.target).toBe(1);
    expect(harness.structure[0]?.offset).toBe(5);
    expect(harness.root.failed).toBe(false);
  });
});
