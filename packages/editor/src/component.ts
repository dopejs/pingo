import {
  createElement,
  type DocumentBlockRect,
  type DocumentSelectionRect,
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
import type { Block, BlockType, DocumentModel, MarkName } from "./schema";

/** One block type a slash menu offers. */
export interface SlashMenuItem {
  /** The block type applying this item produces. */
  readonly type: BlockType;
  /** Attributes that go with it, such as a heading's level. */
  readonly attributes: Record<string, unknown>;
  /** What the caller shows, and what the query filters on. */
  readonly label: string;
}

/** The open slash menu, if there is one. */
export interface SlashMenuState {
  /** What has been typed after the slash. */
  readonly query: string;
  /** Items matching the query, in offer order. */
  readonly items: readonly SlashMenuItem[];
  /** Which item Enter would apply. */
  readonly activeIndex: number;
}

/**
 * The block types offered, in menu order.
 *
 * Labels are English because filtering happens on them; a caller that wants
 * localized labels supplies its own list.
 */
const DEFAULT_SLASH_ITEMS: readonly SlashMenuItem[] = [
  { type: "paragraph", attributes: {}, label: "Text" },
  { type: "heading", attributes: { level: 1 }, label: "Heading 1" },
  { type: "heading", attributes: { level: 2 }, label: "Heading 2" },
  { type: "heading", attributes: { level: 3 }, label: "Heading 3" },
  { type: "listItem", attributes: { depth: 0, ordered: false }, label: "Bulleted list" },
  { type: "listItem", attributes: { depth: 0, ordered: true }, label: "Numbered list" },
  { type: "blockquote", attributes: {}, label: "Quote" },
  { type: "codeBlock", attributes: {}, label: "Code" },
];

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
  #selectionRect: DocumentSelectionRect | undefined;
  #slash: { readonly key: number; readonly start: number; activeIndex: number } | undefined;
  #blockRects: readonly DocumentBlockRect[] = [];
  #drag: { readonly key: number; beforeKey: number | undefined } | undefined;
  readonly #slashItems: readonly SlashMenuItem[];

  public constructor(props: {
    readonly document: DocumentModel;
    readonly host: DocumentEditorHost;
    readonly onChange?: (document: DocumentModel) => void;
    /** Block types the slash menu offers; the built-in list by default. */
    readonly slashItems?: readonly SlashMenuItem[];
  }) {
    this.#editor = new Editor({ document: props.document });
    this.#slashItems = props.slashItems ?? DEFAULT_SLASH_ITEMS;
    this.#host = props.host;
    this.#onChange = props.onChange;
  }

  /** The document as the Shell currently holds it. */
  public get document(): DocumentModel {
    return this.#editor.document;
  }

  /**
   * Where the selection is on the canvas, once the Core has reported it.
   *
   * `undefined` until then, and while the selection is collapsed to a caret
   * the box is zero-width -- a toolbar anchors to it either way, but has
   * nothing to act on.
   */
  public get selectionRect(): DocumentSelectionRect | undefined {
    return this.#selectionRect;
  }

  /** Whether the selection covers characters a mark could apply to. */
  public get hasSelection(): boolean {
    return this.#selectionRanges().length > 0;
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
    this.#syncSlashMenu();
    this.#invalidate();
    this.#refocus();
  }

  /**
   * The open slash menu, or nothing.
   *
   * Opened by typing "/" where a block could change type -- at the start of a
   * block or after a space -- and filtered by whatever follows it. The caret
   * rect is the anchor; the caller draws it.
   */
  public get slashMenu(): SlashMenuState | undefined {
    const open = this.#slash;
    if (open === undefined) return undefined;
    const query = this.#slashQuery(open.key, open.start);
    if (query === undefined) return undefined;
    const items = this.#slashItems.filter((item) =>
      item.label.toLowerCase().startsWith(query.toLowerCase()),
    );
    return { query, items, activeIndex: Math.min(open.activeIndex, Math.max(items.length - 1, 0)) };
  }

  /** Moves the highlighted item, wrapping at both ends. */
  public moveSlashSelection(delta: number): void {
    const menu = this.slashMenu;
    const open = this.#slash;
    if (menu === undefined || open === undefined || menu.items.length === 0) return;
    const count = menu.items.length;
    open.activeIndex = (((menu.activeIndex + delta) % count) + count) % count;
    this.#onInvalidate?.();
  }

  /** Closes the menu without changing anything. */
  public closeSlashMenu(): void {
    if (this.#slash === undefined) return;
    this.#slash = undefined;
    this.#onInvalidate?.();
  }

  /**
   * Applies the highlighted item: the typed query goes, the block changes type.
   *
   * Removing the text is a Shell-side change, so the next projection carries it
   * to the Core along with the new revision.
   */
  public applySlashItem(index?: number): boolean {
    const menu = this.slashMenu;
    const open = this.#slash;
    if (menu === undefined || open === undefined) return false;
    const item = menu.items[index ?? menu.activeIndex];
    if (item === undefined) return false;
    const caret = this.#editor.selection;
    if (caret?.kind !== "text") return false;
    // From the slash itself, not from after it: leaving the trigger behind
    // would turn it into content the user never meant to type.
    const from = open.start - 1;
    this.#editor.replaceText(open.key, { start: from, end: caret.focusOffset }, "");
    this.#editor.setBlockType(open.key, item.type, item.attributes);
    this.#slash = undefined;
    this.#host.dispatch([
      {
        type: "setDocumentSelection",
        nodeId: this.#documentNodeId,
        baseRevision: 0n,
        selection: {
          kind: "text",
          anchorKey: open.key,
          anchorOffset: from,
          focusKey: open.key,
          focusOffset: from,
        },
      },
    ]);
    this.#invalidate();
    return true;
  }

  /** The text between the slash and the caret, or nothing when it is gone. */
  #slashQuery(key: number, start: number): string | undefined {
    const block = this.#editor.document.blocks.find((entry) => entry.key === key);
    const caret = this.#editor.selection;
    if (block === undefined || caret?.kind !== "text" || caret.focusKey !== key) return undefined;
    if (caret.focusOffset < start || block.text[start - 1] !== "/") return undefined;
    const query = block.text.slice(start, caret.focusOffset);
    // A space ends it: "/ " is someone typing a slash, not opening a menu.
    return query.includes(" ") ? undefined : query;
  }

  /** Opens or closes the menu for wherever the caret now is. */
  #syncSlashMenu(): void {
    if (this.#slash !== undefined) {
      if (this.#slashQuery(this.#slash.key, this.#slash.start) === undefined)
        this.#slash = undefined;
      return;
    }
    const caret = this.#editor.selection;
    if (caret?.kind !== "text" || caret.anchorKey !== caret.focusKey) return;
    if (caret.anchorOffset !== caret.focusOffset) return;
    const block = this.#editor.document.blocks.find((entry) => entry.key === caret.focusKey);
    if (block === undefined || block.text[caret.focusOffset - 1] !== "/") return;
    // Only where a block could change type: at its start, or after a space.
    const before = caret.focusOffset - 2;
    if (before >= 0 && block.text[before] !== " ") return;
    this.#slash = { key: caret.focusKey, start: caret.focusOffset, activeIndex: 0 };
  }

  /** Where each block ended up on the canvas, once the engine reported it. */
  public get blockRects(): readonly DocumentBlockRect[] {
    return this.#blockRects;
  }

  /** The block being dragged and where it would land, or nothing. */
  public get blockDrag():
    { readonly key: number; readonly beforeKey: number | undefined } | undefined {
    return this.#drag;
  }

  /** Records where the engine laid the blocks out. */
  public applyBlockGeometry(blocks: readonly DocumentBlockRect[]): void {
    this.#blockRects = blocks;
    if (this.#drag !== undefined) this.#onInvalidate?.();
  }

  /** Starts dragging a block. */
  public beginBlockDrag(key: number): void {
    if (this.#editor.document.blocks.every((block) => block.key !== key)) return;
    this.#drag = { key, beforeKey: undefined };
    this.#onInvalidate?.();
  }

  /**
   * Points the drag at the gap nearest `y`, in canvas coordinates.
   *
   * The gap rather than the block: a drop lands between two blocks, and the
   * half of a block the pointer is in decides which side of it that is.
   */
  public dragBlockTo(y: number): void {
    const drag = this.#drag;
    if (drag === undefined) return;
    const ordered = this.#editor.document.blocks
      .map((block) => this.#blockRects.find((rect) => rect.key === block.key))
      .filter((rect): rect is DocumentBlockRect => rect !== undefined);
    let beforeKey: number | undefined;
    for (const rect of ordered) {
      if (y < rect.top + rect.height / 2) {
        beforeKey = rect.key;
        break;
      }
    }
    if (drag.beforeKey === beforeKey) return;
    this.#drag = { key: drag.key, beforeKey };
    this.#onInvalidate?.();
  }

  /** Ends the drag, moving the block when it landed somewhere new. */
  public endBlockDrag(): boolean {
    const drag = this.#drag;
    this.#drag = undefined;
    if (drag === undefined) {
      return false;
    }
    const before = this.#editor.document.blocks.map((block) => block.key);
    this.#editor.moveBlock(drag.key, drag.beforeKey);
    const changed = before.join() !== this.#editor.document.blocks.map((block) => block.key).join();
    if (changed) this.#invalidate();
    else this.#onInvalidate?.();
    return changed;
  }

  /** Records where the Core drew the selection. */
  public applySelectionGeometry(rect: DocumentSelectionRect): void {
    const previous = this.#selectionRect;
    if (
      previous !== undefined &&
      previous.left === rect.left &&
      previous.top === rect.top &&
      previous.width === rect.width &&
      previous.height === rect.height
    ) {
      return;
    }
    this.#selectionRect = rect;
    // Only the view has to react: the document did not change, so re-notifying
    // the owner would make a caret move look like an edit.
    this.#onInvalidate?.();
  }

  /** Replaces one block's whole text, for tests and for a caller that owns it. */
  public replaceBlockText(key: number, text: string): void {
    const block = this.#editor.document.blocks.find((entry) => entry.key === key);
    if (block === undefined) return;
    this.#editor.replaceText(key, { start: 0, end: block.text.length }, text);
    this.#invalidate();
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
    // The menu is Shell state: moving its highlight and dismissing it need no
    // Core, so they are answered before the document node is required.
    if (this.slashMenu !== undefined) {
      switch (event.key) {
        case "ArrowUp":
          this.moveSlashSelection(-1);
          return true;
        case "ArrowDown":
          this.moveSlashSelection(1);
          return true;
        case "Enter":
        case "Tab":
          return this.applySlashItem();
        case "Escape":
          this.closeSlashMenu();
          return true;
        default:
          break;
      }
    }
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
        onSelectionGeometry: (rect: DocumentSelectionRect) => this.applySelectionGeometry(rect),
        onBlockGeometry: (blocks: readonly DocumentBlockRect[]) => this.applyBlockGeometry(blocks),
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
