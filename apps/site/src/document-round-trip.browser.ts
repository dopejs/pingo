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

  interface Harness {
    readonly root: Awaited<ReturnType<typeof createHostedCanvasRoot>>;
    readonly transactions: EditTransaction[];
    readonly structure: StructureRequest[];
    readonly selections: DocumentSelectionReport[];
    readonly documentNodeId: () => number;
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
        children: BLOCKS.map((block) =>
          createElement("text", {
            key: block.key,
            blockKey: block.key,
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
