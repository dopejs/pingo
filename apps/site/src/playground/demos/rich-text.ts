import interBoldUrl from "@fontsource/inter/files/inter-latin-700-normal.woff2?url";
import interRegularUrl from "@fontsource/inter/files/inter-latin-400-normal.woff2?url";
import {
  createElement,
  encodeInputBatch,
  loadFont,
  type DocumentSelectionReport,
  type EditTransaction,
  type InputCommand,
  type DocumentFocus,
  type PingoEvent,
  type PingoFont,
  type StructureRequest,
  type TextRunProps,
} from "@dopejs/pingo";
import {
  Editor,
  markIsActive,
  toMarkdown,
  type Block,
  type BlockRange,
  type MarkName,
} from "@dopejs/pingo/editor";

import type { Demo, DemoContext } from "../demo";

/** Marks the toolbar offers, in button order. */
const OFFERED: readonly MarkName[] = ["bold", "code", "link", "strike"];

/**
 * The two faces the document draws with.
 *
 * A run table only reaches the Core when the node has a font to shape with:
 * without one the value goes through the host's system-font fallback, which
 * paints the whole node in one style and never reads the table. Bold needs a
 * second face for the same reason -- a weight is a different set of outlines,
 * not a number the shaper can interpolate.
 *
 * Inter, SIL OFL 1.1, Latin subset: about 24 KB per face. That is also why the
 * sample text is English -- a CJK face is several megabytes, which is not
 * something a demo page should download.
 */
let faces: { readonly regular: PingoFont; readonly bold: PingoFont } | undefined;

async function loadFaces(): Promise<void> {
  faces ??= {
    regular: await loadFont(interRegularUrl, { fallbackFamily: "Inter" }),
    bold: await loadFont(interBoldUrl, { fallbackFamily: "Inter" }),
  };
}

const INITIAL: Block[] = [
  {
    key: 1,
    type: "heading",
    attributes: { level: 2 },
    text: "Type in this document",
    marks: [],
  },
  {
    key: 2,
    type: "paragraph",
    attributes: {},
    text: "The caret, the selection and undo live in the engine core, over one flat position space across every block. Arrow keys cross a block boundary without the shell being asked.",
    marks: [{ mark: "bold", from: 0, to: 9 }],
  },
  {
    key: 3,
    type: "paragraph",
    attributes: {},
    text: "Enter does not split anything here. The core asks, because whether a split makes a paragraph or ends a list is a schema question the shell owns.",
    marks: [],
  },
];

/** Everything one mounted instance of the demo owns. */
interface Session {
  readonly editor: Editor;
  documentNodeId: number;
  /** Scene node per block key, so returning transactions find their block. */
  readonly nodeToKey: Map<number, number>;
  redraw: (() => void) | undefined;
  refocus: (() => void) | undefined;
  dispatch: ((commands: readonly InputCommand[]) => void) | undefined;
}

let session: Session = freshSession();

function freshSession(): Session {
  return {
    editor: new Editor({ document: { blocks: INITIAL.map((block) => ({ ...block })) } }),
    documentNodeId: 0,
    nodeToKey: new Map(),
    redraw: undefined,
    refocus: undefined,
    dispatch: undefined,
  };
}

/**
 * Hands the OS input surface the block the caret is in.
 *
 * A document has no single value, so the surface gets the focused block. The
 * commands it produces come back addressed to the document root, where the
 * Core resolves them against its own caret.
 */
function refocusNativeInput(root: {
  focusDocument: (target: number, block: DocumentFocus) => void;
}): void {
  const selection = session.editor.selection;
  if (selection?.kind !== "text" || session.documentNodeId === 0) return;
  const block = session.editor.document.blocks.find((entry) => entry.key === selection.focusKey);
  if (block === undefined) return;
  root.focusDocument(session.documentNodeId, {
    text: block.text,
    anchor:
      selection.anchorKey === selection.focusKey ? selection.anchorOffset : selection.focusOffset,
    focus: selection.focusOffset,
    revision: 1n,
  });
}

/** Feeds one piece of Core's reverse channel into the Shell's document. */
function consume(part: {
  readonly transactions?: readonly EditTransaction[];
  readonly structure?: readonly StructureRequest[];
  readonly selections?: readonly DocumentSelectionReport[];
}): void {
  session.editor.applyEditStream(
    {
      transactions: part.transactions ?? [],
      structure: part.structure ?? [],
      selections: part.selections ?? [],
    },
    session.nodeToKey,
  );
  // Auto-formatting is the Shell's: "# " means a heading because the schema
  // says so, and the Core has no schema. Run the rules where the caret ended
  // up, then let the next projection carry the result back -- Core reads a
  // block's text from the Scene, so the rewrite reaches it as an ordinary
  // re-render under a new revision.
  const caret = session.editor.selection;
  if (caret?.kind === "text" && caret.anchorKey === caret.focusKey) {
    const moved = session.editor.runInputRules(caret.focusKey, caret.focusOffset);
    if (moved !== caret.focusOffset) {
      session.dispatch?.([
        {
          type: "setDocumentSelection",
          nodeId: session.documentNodeId,
          baseRevision: 0n,
          selection: {
            kind: "text",
            anchorKey: caret.focusKey,
            anchorOffset: moved,
            focusKey: caret.focusKey,
            focusOffset: moved,
          },
        },
      ]);
    }
  }
  session.redraw?.();
  session.refocus?.();
}

/** Turns a block's marks into the run table for its text node. */
function runsOf(block: Block, bold: PingoFont): readonly TextRunProps[] | undefined {
  if (block.marks.length === 0) return undefined;
  const paint: Record<MarkName, Omit<TextRunProps, "start" | "end">> = {
    bold: { font: bold },
    code: { fontFamily: "ui-monospace, monospace", color: "#b02a37" },
    // A run carries no font style yet, so drawing italic as something else
    // would be showing a mark the engine did not apply.
    italic: {},
    link: { color: "#1a6fd4" },
    strike: { color: "#8a94a3" },
  };
  // Marks may overlap; a run table may not. Cut the value at every mark edge
  // and give each piece the union of the marks covering it.
  const edges = new Set<number>([0, block.text.length]);
  for (const mark of block.marks) {
    edges.add(mark.from);
    edges.add(mark.to);
  }
  const ordered = [...edges].sort((left, right) => left - right);
  const runs: TextRunProps[] = [];
  for (let index = 0; index + 1 < ordered.length; index += 1) {
    const start = ordered[index]!;
    const end = ordered[index + 1]!;
    const covering = block.marks.filter((mark) => mark.from <= start && mark.to >= end);
    if (covering.length === 0) continue;
    let style: Omit<TextRunProps, "start" | "end"> = {};
    for (const mark of covering) style = { ...style, ...paint[mark.mark] };
    runs.push({ start, end, ...style });
  }
  return runs.length === 0 ? undefined : runs;
}

function scene(context: DemoContext) {
  const loaded = faces;
  const blocks = session.editor.document.blocks;
  return createElement("container", {
    width: context.width,
    height: context.height,
    backgroundColor: "#ffffffff",
    padding: 20,
    gap: 4,
    ref: (handle: { readonly nodeId: number } | null) => {
      if (handle !== null) session.documentNodeId = handle.nodeId;
    },
    // The Editor's own revision, not a constant: Core skips reprojection when
    // the revision it already accepted comes back, so a fixed one would leave
    // it working from the text as it was before the Shell last changed it.
    document: {
      revision: session.editor.projection().revision,
      blocks: blocks.map((block) => ({ key: block.key, lenUtf16: block.text.length })),
    },
    children:
      loaded === undefined
        ? []
        : blocks.map((block) => {
            const heading = block.type === "heading";
            const runs = runsOf(block, loaded.bold);
            return createElement("text", {
              key: block.key,
              blockKey: block.key,
              value: block.text,
              font: heading ? loaded.bold : loaded.regular,
              fontSize: heading ? 20 : 14,
              lineHeight: heading ? 30 : 24,
              color: "#1f2329ff",
              ref: (handle: { readonly nodeId: number } | null) => {
                if (handle !== null) session.nodeToKey.set(handle.nodeId, block.key);
              },
              onPointerDown: (event: PingoEvent) => {
                session.dispatch?.([
                  {
                    type: "placeCaret",
                    nodeId: event.target.nodeId,
                    x: event.x,
                    y: event.y,
                    extend: event.shiftKey,
                    // No click count on the event yet, so a press is always a
                    // caret. Word selection is reachable from the Core the same
                    // way once the event carries one.
                    word: false,
                  },
                ]);
              },
              ...(runs === undefined ? {} : { runs }),
            });
          }),
  });
}

/** The block and offset the caret is in, when it is in text. */
function caret(): { readonly key: number; readonly offset: number } | undefined {
  const selection = session.editor.selection;
  if (selection?.kind !== "text") return undefined;
  return { key: selection.focusKey, offset: selection.focusOffset };
}

function selectedRange(): readonly BlockRange[] {
  const selection = session.editor.selection;
  if (selection?.kind !== "text" || selection.anchorKey !== selection.focusKey) return [];
  const from = Math.min(selection.anchorOffset, selection.focusOffset);
  const to = Math.max(selection.anchorOffset, selection.focusOffset);
  return from === to ? [] : [{ key: selection.focusKey, from, to }];
}

export const richTextDemo: Demo = {
  id: "rich-text",
  title: (messages) => messages.richTextTitle,
  description: (messages) => messages.richTextDescription,
  // The reverse channel is a root option, so the demo declares it: Core is what
  // moves the caret and predicts the structure, and the Shell's document is
  // only correct if it consumes both.
  rootOptions: {
    onEditTransaction: (transaction) => consume({ transactions: [transaction] }),
    onStructureRequest: (request) => consume({ structure: [request] }),
    onDocumentSelection: (report) => consume({ selections: [report] }),
  },
  render: scene,
  activate: (context) => {
    session = freshSession();

    const send = (commands: readonly InputCommand[]): void => {
      if (session.documentNodeId === 0 || commands.length === 0) return;
      context.root.dispatchInput(encodeInputBatch({ frameSeq: 1, commands }));
    };
    session.dispatch = send;

    const panel = document.createElement("div");
    panel.style.display = "grid";
    panel.style.gap = "8px";
    const hint = document.createElement("p");
    hint.style.margin = "0";
    hint.textContent = context.messages.richTextHint;
    const markRow = document.createElement("div");
    markRow.style.display = "flex";
    markRow.style.flexWrap = "wrap";
    markRow.style.gap = "6px";
    const source = document.createElement("pre");
    source.style.margin = "0";
    source.style.whiteSpace = "pre-wrap";
    source.style.fontSize = "12px";
    source.style.lineHeight = "1.5";
    panel.append(hint, markRow, source);
    context.controls.append(panel);

    const markButtons = new Map<MarkName, HTMLButtonElement>();
    let disposed = false;

    const refresh = (): void => {
      if (disposed) return;
      const where = caret();
      context.setMetric(
        context.messages.selectedSpan,
        where === undefined ? "—" : `${String(where.key)} @ ${String(where.offset)}`,
      );
      context.setMetric(context.messages.markRanges, String(session.editor.document.blocks.length));
      const ranges = selectedRange();
      for (const [mark, element] of markButtons) {
        const on = ranges.length > 0 && markIsActive(session.editor.document, ranges, mark);
        element.setAttribute("aria-pressed", on ? "true" : "false");
        element.style.fontWeight = on ? "700" : "400";
        element.disabled = ranges.length === 0;
      }
      // Markdown is serialized from the same document the canvas draws, so what
      // the page shows and what a copy would carry cannot drift apart.
      source.textContent = toMarkdown(session.editor.document);
      context.root.render(scene(context));
    };
    session.redraw = refresh;
    session.refocus = () => {
      refocusNativeInput(context.root);
    };

    for (const mark of OFFERED) {
      const element = document.createElement("button");
      element.type = "button";
      element.textContent = context.messages.markLabel(mark);
      element.addEventListener("click", () => {
        const ranges = selectedRange();
        if (ranges.length === 0) return;
        session.editor.toggleMark(ranges, mark);
        refresh();
      });
      markButtons.set(mark, element);
      markRow.append(element);
    }

    // The canvas takes keyboard focus itself: the engine owns the caret, so
    // there is no per-widget DOM input to focus instead.
    const canvas = context.canvas;
    const previousTabIndex = canvas.tabIndex;
    canvas.tabIndex = 0;
    canvas.style.outline = "none";

    const nodeId = (): number => session.documentNodeId;
    const move = (
      direction: "backward" | "forward" | "up" | "down",
      granularity: "grapheme" | "word",
      extend: boolean,
    ): void => {
      send([{ type: "moveDocumentCaret", nodeId: nodeId(), direction, granularity, extend }]);
    };
    const edit = (
      operation: "insert" | "deleteBackward" | "deleteForward" | "split",
      text = "",
    ): void => {
      send([
        {
          type: "editDocument",
          nodeId: nodeId(),
          baseRevision: 0n,
          operation,
          style: 0,
          font: 0,
          text,
        },
      ]);
    };

    // Arrows, Backspace, Delete and Enter only. Text and composition come from
    // the engine's own input surface, which is what makes an input method work
    // at all -- a keydown handler sees a committed character, never a
    // candidate.
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      switch (event.key) {
        case "ArrowLeft":
        case "ArrowRight":
        case "ArrowUp":
        case "ArrowDown": {
          const direction =
            event.key === "ArrowLeft"
              ? "backward"
              : event.key === "ArrowRight"
                ? "forward"
                : event.key === "ArrowUp"
                  ? "up"
                  : "down";
          move(direction, "grapheme", event.shiftKey);
          break;
        }
        case "Enter":
          edit("split");
          break;
        default:
          return;
      }
      event.preventDefault();
    };

    // Focus follows the press, but where the caret lands is the Core's answer:
    // it owns the text layout, so it is the only side that can turn a point
    // into an offset.
    const onPointerDown = (): void => {
      canvas.focus();
    };

    canvas.addEventListener("keydown", onKeyDown);
    canvas.addEventListener("pointerdown", onPointerDown);

    refresh();
    // The first frame has no faces yet, so it draws nothing; loading them
    // re-renders. Awaiting them instead would leave the canvas blank with no
    // explanation for as long as the fetch took.
    void loadFaces().then(refresh);

    return () => {
      disposed = true;
      session.redraw = undefined;
      canvas.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.tabIndex = previousTabIndex;
    };
  },
};
