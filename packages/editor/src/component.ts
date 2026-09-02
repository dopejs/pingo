import {
  createElement,
  type PingoEvent,
  type PingoNode,
  type TextRunProps,
} from "@dopejs/pingo-jsx";
import type {
  DocumentSelectionReport,
  DocumentSelectionState,
  EditTransaction,
  InputCommand,
  StructureRequest,
} from "@dopejs/pingo-editing";

import { markIsActive } from "./commands";
import { Editor } from "./editor";
import type { Block, DocumentModel, MarkName } from "./schema";

/** How one mark paints, as differences from the block's own style. */
export type MarkStyles = Partial<Record<MarkName, Omit<TextRunProps, "start" | "end">>>;

/** What the component needs from the host to drive one document. */
export interface DocumentEditorHost {
  /** Sends input commands to the Core. */
  readonly dispatch: (commands: readonly InputCommand[]) => void;
  /** Hands the OS input surface the block the caret is in. */
  readonly focusBlock: (
    documentNodeId: number,
    block: { text: string; anchor: number; focus: number; revision: bigint },
  ) => void;
}

export interface DocumentEditorProps {
  /** The document to edit. */
  readonly document: DocumentModel;
  /** Receives the document after every change the editor made. */
  readonly onChange?: (document: DocumentModel) => void;
  /** Everything the component needs to reach the Core. */
  readonly host: DocumentEditorHost;
  /** How each mark paints; a mark with no entry renders as ordinary text. */
  readonly marks?: MarkStyles;
  /** Per-block-type text style, so a heading is not a paragraph. */
  readonly blockStyle?: (block: Block) => Omit<TextRunProps, "start" | "end">;
  readonly width?: number;
  readonly padding?: number;
  readonly gap?: number;
}

/**
 * One mounted document editor.
 *
 * Holds everything a caller would otherwise reassemble: the Shell-side
 * document, the block-key to Scene-node map the reverse channel needs, the
 * keys the OS surface does not deliver as text, the input rules, and the
 * clipboard. The Core owns the caret, the selection, composition and undo; this
 * owns the schema questions the Core is not allowed to answer.
 */
export class DocumentEditorController {
  readonly #editor: Editor;
  readonly #host: DocumentEditorHost;
  readonly #onChange: ((document: DocumentModel) => void) | undefined;
  #documentNodeId = 0;
  #nodeToKey = new Map<number, number>();
  #onInvalidate: (() => void) | undefined;

  public constructor(props: {
    readonly document: DocumentModel;
    readonly host: DocumentEditorHost;
    readonly onChange?: (document: DocumentModel) => void;
  }) {
    this.#editor = new Editor({ document: props.document });
    this.#host = props.host;
    this.#onChange = props.onChange;
  }

  /** The document as the Shell currently holds it. */
  public get document(): DocumentModel {
    return this.#editor.document;
  }

  /** Where the Core last reported the caret. */
  public get selection(): DocumentSelectionState | undefined {
    return this.#editor.selection;
  }

  /** The projection revision, which is what makes the Core reproject. */
  public get revision(): bigint {
    return this.#editor.projection().revision;
  }

  /** Called when the component must re-render. */
  public set onInvalidate(callback: (() => void) | undefined) {
    this.#onInvalidate = callback;
  }

  /** Whether a mark covers the whole selection, for a toolbar's pressed state. */
  public markIsActive(mark: MarkName): boolean {
    const ranges = this.#selectionRanges();
    return ranges.length > 0 && markIsActive(this.#editor.document, ranges, mark);
  }

  /** Toggles a mark over the current selection. */
  public toggleMark(mark: MarkName): void {
    const ranges = this.#selectionRanges();
    if (ranges.length === 0) return;
    this.#editor.toggleMark(ranges, mark);
    this.#invalidate();
  }

  /** Consumes one frame of Core's reverse channel. */
  public applyEditStream(stream: {
    readonly transactions: readonly EditTransaction[];
    readonly structure: readonly StructureRequest[];
    readonly selections: readonly DocumentSelectionReport[];
  }): void {
    this.#editor.applyEditStream(stream, this.#nodeToKey);
    // Auto-formatting is the Shell's: "# " means a heading because the schema
    // says so, and the Core has no schema.
    const caret = this.#editor.selection;
    if (caret?.kind === "text" && caret.anchorKey === caret.focusKey) {
      const moved = this.#editor.runInputRules(caret.focusKey, caret.focusOffset);
      if (moved !== caret.focusOffset) {
        this.#host.dispatch([
          {
            type: "setDocumentSelection",
            nodeId: this.#documentNodeId,
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
    this.#invalidate();
    this.#refocus();
  }

  /** Serializes the selection for a copy, or nothing when there is none. */
  public copySelection(): { html: string; markdown: string; text: string } | undefined {
    return this.#editor.copySelection();
  }

  /** Takes a paste structurally; `false` leaves it to a plain-text insertion. */
  public pasteContent(content: { readonly html: string; readonly text: string }): boolean {
    if (!this.#editor.pasteContent(content)) return false;
    this.#invalidate();
    this.#refocus();
    return true;
  }

  /**
   * Handles the keys the OS input surface does not deliver as text.
   *
   * Everything else -- characters, composition, undo shortcuts -- arrives
   * through the surface, which is what makes an input method work: a keydown
   * handler sees a committed character, never a candidate.
   */
  public handleKeyDown(event: KeyboardEvent): boolean {
    if (event.metaKey || event.ctrlKey || event.altKey) return false;
    const node = this.#documentNodeId;
    if (node === 0) return false;
    const move = (direction: "backward" | "forward" | "up" | "down"): void => {
      this.#host.dispatch([
        {
          type: "moveDocumentCaret",
          nodeId: node,
          direction,
          granularity: "grapheme",
          extend: event.shiftKey,
        },
      ]);
    };
    switch (event.key) {
      case "ArrowLeft":
        move("backward");
        return true;
      case "ArrowRight":
        move("forward");
        return true;
      case "ArrowUp":
        move("up");
        return true;
      case "ArrowDown":
        move("down");
        return true;
      case "Enter":
        this.#host.dispatch([
          {
            type: "editDocument",
            nodeId: node,
            baseRevision: 0n,
            operation: "split",
            style: 0,
            font: 0,
            text: "",
          },
        ]);
        return true;
      default:
        return false;
    }
  }

  /** Renders the document, blocks and all. */
  public render(props: DocumentEditorProps): PingoNode {
    const blocks = this.#editor.document.blocks;
    return createElement("container", {
      ...(props.width === undefined ? {} : { width: props.width }),
      padding: props.padding ?? 20,
      gap: props.gap ?? 4,
      ref: (handle: { readonly nodeId: number } | null) => {
        if (handle !== null) this.#documentNodeId = handle.nodeId;
      },
      document: {
        // The Editor's own revision: Core skips reprojection when the revision
        // it already accepted comes back, so a constant would leave it working
        // from the text as it was before the Shell last changed it.
        revision: this.revision,
        blocks: blocks.map((block) => ({ key: block.key, lenUtf16: block.text.length })),
        onEditStream: (stream: {
          readonly transactions: readonly EditTransaction[];
          readonly structure: readonly StructureRequest[];
          readonly selections: readonly DocumentSelectionReport[];
        }) => this.applyEditStream(stream),
      },
      children: blocks.map((block) =>
        createElement("text", {
          key: block.key,
          blockKey: block.key,
          value: block.text,
          ...(props.blockStyle?.(block) ?? {}),
          ref: (handle: { readonly nodeId: number } | null) => {
            if (handle !== null) this.#nodeToKey.set(handle.nodeId, block.key);
          },
          onPointerDown: (event: PingoEvent) => {
            // Hit testing is the Core's, so the press carries the node it hit
            // and the Core turns the point into an offset.
            this.#host.dispatch([
              {
                type: "placeCaret",
                nodeId: event.target.nodeId,
                x: event.x,
                y: event.y,
                extend: event.shiftKey,
                word: false,
              },
            ]);
          },
          ...(this.#runsOf(block, props.marks) === undefined
            ? {}
            : { runs: this.#runsOf(block, props.marks) }),
        }),
      ),
    });
  }

  /** The block ranges the current selection covers. */
  #selectionRanges(): readonly { key: number; from: number; to: number }[] {
    const selection = this.#editor.selection;
    if (selection?.kind !== "text") return [];
    if (selection.anchorKey !== selection.focusKey) {
      // A cross-block selection is a range per block it touches; the middle
      // ones are covered whole.
      const blocks = this.#editor.document.blocks;
      const first = blocks.findIndex((block) => block.key === selection.anchorKey);
      const last = blocks.findIndex((block) => block.key === selection.focusKey);
      if (first < 0 || last < 0) return [];
      const [from, to] = first <= last ? [first, last] : [last, first];
      return blocks.slice(from, to + 1).map((block, offset) => ({
        key: block.key,
        from: offset === 0 ? Math.min(selection.anchorOffset, selection.focusOffset) : 0,
        to:
          offset === to - from
            ? Math.max(selection.anchorOffset, selection.focusOffset)
            : block.text.length,
      }));
    }
    const from = Math.min(selection.anchorOffset, selection.focusOffset);
    const to = Math.max(selection.anchorOffset, selection.focusOffset);
    return from === to ? [] : [{ key: selection.focusKey, from, to }];
  }

  /** Turns a block's marks into the run table for its text node. */
  #runsOf(block: Block, styles: MarkStyles | undefined): readonly TextRunProps[] | undefined {
    if (block.marks.length === 0 || styles === undefined) return undefined;
    // Marks may overlap; a run table may not. Cut the value at every mark edge
    // and give each piece the union of the marks covering it, so bold-and-code
    // renders as both rather than as whichever was written last.
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
      for (const mark of covering) style = { ...style, ...(styles[mark.mark] ?? {}) };
      runs.push({ start, end, ...style });
    }
    return runs.length === 0 ? undefined : runs;
  }

  #refocus(): void {
    const selection = this.#editor.selection;
    if (selection?.kind !== "text" || this.#documentNodeId === 0) return;
    const block = this.#editor.document.blocks.find((entry) => entry.key === selection.focusKey);
    if (block === undefined) return;
    this.#host.focusBlock(this.#documentNodeId, {
      text: block.text,
      anchor:
        selection.anchorKey === selection.focusKey ? selection.anchorOffset : selection.focusOffset,
      focus: selection.focusOffset,
      revision: this.revision,
    });
  }

  #invalidate(): void {
    this.#onChange?.(this.#editor.document);
    this.#onInvalidate?.();
  }
}
