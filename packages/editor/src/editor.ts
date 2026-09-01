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
  splitBlock,
  toggleMark,
} from "./commands";
import { applyBlockRule, applyInlineRule } from "./input-rules";
import {
  type Block,
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
