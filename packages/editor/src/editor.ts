/**
 * The Shell half of the editing round trip.
 *
 * Core moves the caret and reports what it wants the tree to become; this
 * decides what the schema actually does about it and publishes the next
 * projection. The two halves never share a mutable object: Core sends
 * transactions and structure requests, and this sends a projection.
 */

import type { DocumentSelectionState, EditStream, StructureRequest } from "@dopejs/pingo-editing";
import { mapEditRange } from "@dopejs/pingo-editing";
import type { DocumentBlock, Mutation } from "@dopejs/pingo-reconciler";
import { NULL_NODE_ID } from "@dopejs/pingo-reconciler";

import {
  BlockKeyAllocator,
  type BlockRange,
  type CommandResult,
  mergeBlocks,
  removeBlocks,
  replaceText,
  setBlockType,
  splitBlock,
  toggleMark,
} from "./commands";
import { applyBlockRule, applyInlineRule } from "./input-rules";
import { fromHtml, fromMarkdown, toHtml, toMarkdown } from "./serialize";
import {
  type Block,
  type BlockType,
  type DocumentModel,
  type MarkName,
  isAtomic,
  normalizeDocument,
  utf16Length,
} from "./schema";

/** How a block key maps to the Scene node that draws it. */
export type BlockNodes = ReadonlyMap<number, number>;

/** What the editor publishes after every change. */
export interface EditorProjection {
  /** Shell revision of the projection; strictly increasing. */
  readonly revision: bigint;
  /** Blocks in document order, for `configureDocument`. */
  readonly blocks: readonly DocumentBlock[];
}

/** An anchor the Shell owns and Core moves for it. */
export interface Anchor {
  readonly key: number;
  readonly from: number;
  readonly to: number;
}

/** Options for a new editor. */
export interface EditorOptions {
  /** Starting document; defaults to one empty paragraph. */
  readonly document?: DocumentModel;
  /** Scene node for each block key, when the Shell has materialized it. */
  readonly nodes?: BlockNodes;
}

/**
 * A document, its schema, and the commands that change it.
 *
 * The editor holds no caret. Core does, and this asks it where the caret is
 * rather than tracking a second copy that could disagree.
 */
export class Editor {
  #document: DocumentModel;
  #allocator: BlockKeyAllocator;
  #nodes: Map<number, number>;
  #revision = 1n;
  #selection: DocumentSelectionState | undefined;
  #anchors: Anchor[] = [];

  public constructor(options: EditorOptions = {}) {
    const initial =
      options.document ??
      ({
        blocks: [
          { key: 1, type: "paragraph", attributes: {}, text: "", marks: [] } satisfies Block,
        ],
      } satisfies DocumentModel);
    this.#document = normalizeDocument(initial);
    this.#allocator = new BlockKeyAllocator(this.#document);
    this.#nodes = new Map(options.nodes ?? []);
  }

  /** Returns the current document. */
  public get document(): DocumentModel {
    return this.#document;
  }

  /** Returns the selection Core last reported. */
  public get selection(): DocumentSelectionState | undefined {
    return this.#selection;
  }

  /** Returns the anchors the editor is moving on the Shell's behalf. */
  public get anchors(): readonly Anchor[] {
    return this.#anchors;
  }

  /** Registers an anchor for Core's position maps to move. */
  public addAnchor(anchor: Anchor): void {
    this.#anchors.push(anchor);
  }

  /** Associates a block key with the Scene node that draws it. */
  public setNode(key: number, nodeId: number): void {
    this.#nodes.set(key, nodeId);
  }

  /** Returns the projection to send Core with `configureDocument`. */
  public projection(): EditorProjection {
    return {
      revision: this.#revision,
      blocks: this.#document.blocks.map((block) => ({
        key: block.key,
        nodeId: this.#nodes.get(block.key) ?? NULL_NODE_ID,
        lenUtf16: isAtomic(block.type) ? 0 : utf16Length(block.text),
        atomic: isAtomic(block.type),
      })),
    };
  }

  /** Returns the `configureDocument` mutation for the current projection. */
  public configureMutation(nodeId: number): Mutation {
    const projection = this.projection();
    return {
      type: "configureDocument",
      nodeId,
      revision: projection.revision,
      flags: 0,
      blocks: projection.blocks,
    };
  }

  /**
   * Consumes one reverse batch from Core.
   *
   * Text deltas are applied to the model, anchors are moved by Core's maps
   * rather than by a second implementation of the same arithmetic, and each
   * structure request is answered by whatever the schema decides -- which is
   * allowed to differ from what Core predicted.
   */
  public applyEditStream(stream: EditStream, nodeToKey: ReadonlyMap<number, number>): void {
    for (const transaction of stream.transactions) {
      const key = nodeToKey.get(transaction.nodeId);
      if (key === undefined) continue;
      if (transaction.delta !== undefined) {
        this.#apply(
          replaceText(
            this.#document,
            key,
            transaction.delta.range.start,
            transaction.delta.range.end,
            transaction.delta.text,
          ),
        );
      }
      if (transaction.map.length > 0) {
        this.#anchors = this.#anchors.map((anchor) => {
          if (anchor.key !== key) return anchor;
          const moved = mapEditRange(transaction.map, { start: anchor.from, end: anchor.to });
          return { key: anchor.key, from: moved.start, to: moved.end };
        });
      }
    }
    for (const request of stream.structure) this.applyStructureRequest(request);
    const last = stream.selections.at(-1);
    if (last !== undefined) this.#selection = last.selection;
  }

  /**
   * Answers one structure request.
   *
   * The schema has the last word: an empty list item's Enter leaves the list
   * rather than splitting it, so Core's optimistic guess is corrected by the
   * projection this produces rather than by Core being told it was wrong.
   */
  public applyStructureRequest(request: StructureRequest): void {
    switch (request.kind) {
      case "remove":
        this.#apply(removeBlocks(this.#document, request.keys));
        return;
      case "merge":
        this.#apply(mergeBlocks(this.#document, request.target, request.source));
        return;
      case "split":
        this.#apply(splitBlock(this.#document, request.target, request.offset, this.#allocator));
        return;
    }
  }

  /** Toggles a mark over a selection expressed in block ranges. */
  public toggleMark(ranges: readonly BlockRange[], mark: MarkName, href?: string): void {
    this.#apply(toggleMark(this.#document, ranges, mark, href));
  }

  /** Replaces a range of one block's text, moving its marks with it. */
  public replaceText(key: number, range: { start: number; end: number }, text: string): void {
    this.#apply(replaceText(this.#document, key, range.start, range.end, text));
  }

  /** Changes one block's type, normalizing what the new type does not allow. */
  public setBlockType(
    key: number,
    type: BlockType,
    attributes: Record<string, unknown> = {},
  ): void {
    this.#apply(setBlockType(this.#document, key, type, attributes));
  }

  /** Runs the input rules for a caret that just moved inside a block. */
  public runInputRules(key: number, offset: number): number {
    const block = applyBlockRule(this.#document, { key, offset });
    if (block !== undefined) {
      this.#apply(block.result);
      return block.offset;
    }
    const inline = applyInlineRule(this.#document, { key, offset });
    if (inline !== undefined) {
      this.#apply(inline.result);
      return inline.offset;
    }
    return offset;
  }

  /**
   * Serializes the current selection for the clipboard.
   *
   * A selection that covers part of one block copies as that text; one that
   * spans blocks copies as the blocks it covers, trimmed at both ends, so the
   * structure survives the round trip. `undefined` means there is nothing
   * selected to copy and the engine should do what it would have done.
   */
  public copySelection(): { html: string; markdown: string; text: string } | undefined {
    const selection = this.#selection;
    if (selection?.kind !== "text") return undefined;
    const slice = this.#sliceSelection(selection);
    if (slice.blocks.length === 0) return undefined;
    return {
      html: toHtml(slice),
      markdown: toMarkdown(slice),
      text: slice.blocks.map((block) => block.text).join("\n"),
    };
  }

  /**
   * Replaces the selection with pasted content, keeping its structure.
   *
   * Prefers the HTML flavour, because that is where a heading or a list
   * survives; plain text becomes one paragraph per line. Returns `false` when
   * there is nothing usable, so the caller can fall back to a text insertion.
   */
  public pasteContent(content: { readonly html: string; readonly text: string }): boolean {
    const parsed =
      content.html.trim() === ""
        ? fromMarkdown(content.text, this.#allocator)
        : fromHtml(content.html, this.#allocator);
    if (parsed.blocks.length === 0) return false;
    const selection = this.#selection;
    if (selection?.kind !== "text") return false;
    const spliced = this.#spliceAtSelection(selection, parsed.blocks);
    if (spliced === undefined) return false;
    this.#document = normalizeDocument({ blocks: spliced });
    this.#allocator = new BlockKeyAllocator(this.#document);
    this.#revision += 1n;
    return true;
  }

  /** The blocks a text selection covers, trimmed to its two edges. */
  #sliceSelection(selection: {
    readonly anchorKey: number;
    readonly anchorOffset: number;
    readonly focusKey: number;
    readonly focusOffset: number;
  }): DocumentModel {
    const blocks = this.#document.blocks;
    const anchorIndex = blocks.findIndex((block) => block.key === selection.anchorKey);
    const focusIndex = blocks.findIndex((block) => block.key === selection.focusKey);
    if (anchorIndex < 0 || focusIndex < 0) return { blocks: [] };
    const forward =
      anchorIndex < focusIndex ||
      (anchorIndex === focusIndex && selection.anchorOffset <= selection.focusOffset);
    const [first, last] = forward ? [anchorIndex, focusIndex] : [focusIndex, anchorIndex];
    const [from, to] = forward
      ? [selection.anchorOffset, selection.focusOffset]
      : [selection.focusOffset, selection.anchorOffset];
    if (first === last) {
      const block = blocks[first];
      if (block === undefined || from === to) return { blocks: [] };
      return { blocks: [sliceBlock(block, from, to)] };
    }
    const covered = blocks.slice(first, last + 1);
    return {
      blocks: covered.map((block, offset) => {
        if (offset === 0) return sliceBlock(block, from, block.text.length);
        if (offset === covered.length - 1) return sliceBlock(block, 0, to);
        return block;
      }),
    };
  }

  /** Puts `pasted` where the selection was, keeping the blocks around it. */
  #spliceAtSelection(
    selection: {
      readonly anchorKey: number;
      readonly anchorOffset: number;
      readonly focusKey: number;
      readonly focusOffset: number;
    },
    pasted: readonly Block[],
  ): Block[] | undefined {
    const blocks = this.#document.blocks;
    const anchorIndex = blocks.findIndex((block) => block.key === selection.anchorKey);
    const focusIndex = blocks.findIndex((block) => block.key === selection.focusKey);
    if (anchorIndex < 0 || focusIndex < 0) return undefined;
    const forward =
      anchorIndex < focusIndex ||
      (anchorIndex === focusIndex && selection.anchorOffset <= selection.focusOffset);
    const [first, last] = forward ? [anchorIndex, focusIndex] : [focusIndex, anchorIndex];
    const [from, to] = forward
      ? [selection.anchorOffset, selection.focusOffset]
      : [selection.focusOffset, selection.anchorOffset];
    const head = blocks[first];
    const tail = blocks[last];
    if (head === undefined || tail === undefined) return undefined;
    // The head keeps what came before the selection and the tail what came
    // after, so a paste in the middle of a paragraph does not lose either side.
    const before = sliceBlock(head, 0, from);
    const after = sliceBlock(tail, to, tail.text.length);
    return [
      ...blocks.slice(0, first),
      ...(before.text === "" && pasted.length > 0 ? [] : [before]),
      ...pasted,
      ...(after.text === "" ? [] : [{ ...after, key: this.#allocator.allocate() }]),
      ...blocks.slice(last + 1),
    ];
  }

  /** Replaces the document wholesale, keeping key allocation collision-free. */
  public setDocument(document: DocumentModel): void {
    this.#document = normalizeDocument(document);
    this.#allocator = new BlockKeyAllocator(this.#document);
    this.#revision += 1n;
  }

  #apply(result: CommandResult): void {
    if (!result.changed) return;
    this.#document = result.document;
    this.#revision += 1n;
  }
}

/**
 * The part of a block between two offsets, marks trimmed with it.
 *
 * Copying the text without moving the marks would hand the clipboard ranges
 * that point past the end of what was copied.
 */
function sliceBlock(block: Block, from: number, to: number): Block {
  const start = Math.max(0, Math.min(from, block.text.length));
  const end = Math.max(start, Math.min(to, block.text.length));
  return {
    ...block,
    text: block.text.slice(start, end),
    marks: block.marks
      .map((mark) => ({
        ...mark,
        from: Math.max(0, mark.from - start),
        to: Math.min(end - start, mark.to - start),
      }))
      .filter((mark) => mark.to > mark.from),
  };
}
