/**
 * Document commands.
 *
 * Every command takes a document and a selection and returns the next
 * document; none of them touch the caret directly. Core owns the caret, and a
 * command that moved it would be a second opinion about where it is.
 */

import {
  type Block,
  type BlockAttributes,
  type BlockType,
  type DocumentModel,
  type MarkName,
  type MarkRange,
  MAXIMUM_LIST_DEPTH,
  acceptsMark,
  attributesAfterSplit,
  normalizeBlock,
  typeAfterSplit,
  utf16Length,
} from "./schema";

/** A range of one block's text. */
export interface BlockRange {
  readonly key: number;
  readonly from: number;
  readonly to: number;
}

/** What a command changed, so the caller can tell a no-op from a change. */
export interface CommandResult {
  readonly document: DocumentModel;
  readonly changed: boolean;
  /** Blocks the command created, in the order it created them. */
  readonly created: readonly number[];
}

/** Allocates block keys that stay unique for a document's lifetime. */
export class BlockKeyAllocator {
  #next: number;

  public constructor(document?: DocumentModel) {
    const highest = (document?.blocks ?? []).reduce((best, block) => Math.max(best, block.key), 0);
    this.#next = highest + 1;
  }

  /** Returns a key no live block holds. */
  public allocate(): number {
    const key = this.#next;
    // Core carries keys as u32 and reserves zero, so wrapping would collide
    // with a live block rather than merely repeat.
    if (key >= 0xffff_ffff) throw new Error("block key space is exhausted");
    this.#next += 1;
    return key;
  }
}

/**
 * Turns a mark on across a range, or off when the whole range already has it.
 *
 * "Already has it" is what makes the button a toggle rather than two buttons.
 */
export function toggleMark(
  document: DocumentModel,
  ranges: readonly BlockRange[],
  mark: MarkName,
  href?: string,
): CommandResult {
  const applicable = ranges.filter((range) => {
    const block = find(document, range.key);
    return block !== undefined && acceptsMark(block.type, mark) && range.from < range.to;
  });
  if (applicable.length === 0) return unchanged(document);
  const active = applicable.every((range) => {
    const block = find(document, range.key);
    return block !== undefined && coveredBy(block.marks, mark, range.from, range.to);
  });
  return mapBlocks(document, (block) => {
    const range = applicable.find((candidate) => candidate.key === block.key);
    if (range === undefined) return block;
    const marks = active
      ? removeMark(block.marks, mark, range.from, range.to)
      : [...removeMark(block.marks, mark, range.from, range.to), toRange(mark, range, href)];
    return normalizeBlock({ ...block, marks });
  });
}

/** Returns whether a mark covers every character of a range. */
export function markIsActive(
  document: DocumentModel,
  ranges: readonly BlockRange[],
  mark: MarkName,
): boolean {
  const applicable = ranges.filter((range) => range.from < range.to);
  if (applicable.length === 0) return false;
  return applicable.every((range) => {
    const block = find(document, range.key);
    return block !== undefined && coveredBy(block.marks, mark, range.from, range.to);
  });
}

/** Changes a block's type and attributes, keeping its text and marks. */
export function setBlockType(
  document: DocumentModel,
  key: number,
  type: BlockType,
  attributes: BlockAttributes = {},
): CommandResult {
  return mapBlocks(document, (block) =>
    block.key === key ? normalizeBlock({ ...block, type, attributes }) : block,
  );
}

/**
 * Splits a block at `offset`, giving the tail a fresh key.
 *
 * The head keeps the original key because Core anchors the caret to it: a
 * split that renamed both halves would make every anchor in the document stale
 * for no reason.
 */
export function splitBlock(
  document: DocumentModel,
  key: number,
  offset: number,
  allocator: BlockKeyAllocator,
): CommandResult {
  const index = document.blocks.findIndex((block) => block.key === key);
  const block = document.blocks[index];
  if (index < 0 || block === undefined) return unchanged(document);
  const at = clamp(offset, 0, utf16Length(block.text));

  // Enter on an empty list item leaves the list instead of making another one.
  if (block.type === "listItem" && block.text.length === 0) {
    const depth = block.attributes.depth ?? 0;
    return depth > 0 ? liftListItem(document, key) : setBlockType(document, key, "paragraph", {});
  }

  const tailKey = allocator.allocate();
  const head = normalizeBlock({
    ...block,
    text: block.text.slice(0, at),
    marks: clipMarks(block.marks, 0, at, 0),
  });
  const tail = normalizeBlock({
    key: tailKey,
    type: typeAfterSplit(block),
    attributes: attributesAfterSplit(block),
    text: block.text.slice(at),
    marks: clipMarks(block.marks, at, utf16Length(block.text), -at),
  });
  const blocks = [...document.blocks];
  blocks.splice(index, 1, head, tail);
  return { document: { blocks }, changed: true, created: [tailKey] };
}

/** Appends `source` to `target` and removes `source`. */
export function mergeBlocks(
  document: DocumentModel,
  target: number,
  source: number,
): CommandResult {
  const head = document.blocks.find((block) => block.key === target);
  const tail = document.blocks.find((block) => block.key === source);
  if (head === undefined || tail === undefined || target === source) return unchanged(document);
  const offset = utf16Length(head.text);
  const merged = normalizeBlock({
    ...head,
    text: head.text + tail.text,
    marks: [...head.marks, ...clipMarks(tail.marks, 0, utf16Length(tail.text), offset)],
  });
  const blocks = document.blocks
    .filter((block) => block.key !== source)
    .map((block) => (block.key === target ? merged : block));
  return { document: { blocks }, changed: true, created: [] };
}

/** Removes blocks by key. */
export function removeBlocks(document: DocumentModel, keys: readonly number[]): CommandResult {
  const removed = new Set(keys);
  const blocks = document.blocks.filter((block) => !removed.has(block.key));
  return {
    document: { blocks },
    changed: blocks.length !== document.blocks.length,
    created: [],
  };
}

/** Indents a list item by one level, or turns a paragraph into one. */
export function sinkListItem(document: DocumentModel, key: number): CommandResult {
  const index = document.blocks.findIndex((block) => block.key === key);
  const block = document.blocks[index];
  if (index < 0 || block === undefined) return unchanged(document);
  if (block.type !== "listItem") {
    // Tab in a paragraph starts a list only when a list is already above it,
    // so an ordinary paragraph's Tab does not silently restructure the text.
    const previous = document.blocks[index - 1];
    if (previous?.type !== "listItem") return unchanged(document);
    return setBlockType(document, key, "listItem", {
      depth: previous.attributes.depth ?? 0,
      ordered: previous.attributes.ordered ?? false,
    });
  }
  const depth = block.attributes.depth ?? 0;
  // A list item may not indent past its predecessor: a level with nothing
  // above it is a level the reader cannot see the meaning of.
  const previous = document.blocks[index - 1];
  const ceiling = previous?.type === "listItem" ? (previous.attributes.depth ?? 0) + 1 : 0;
  const next = Math.min(depth + 1, ceiling, MAXIMUM_LIST_DEPTH);
  if (next === depth) return unchanged(document);
  return setBlockType(document, key, "listItem", { ...block.attributes, depth: next });
}

/** Outdents a list item, turning a top-level one back into a paragraph. */
export function liftListItem(document: DocumentModel, key: number): CommandResult {
  const block = find(document, key);
  if (block?.type !== "listItem") return unchanged(document);
  const depth = block.attributes.depth ?? 0;
  return depth === 0
    ? setBlockType(document, key, "paragraph", {})
    : setBlockType(document, key, "listItem", { ...block.attributes, depth: depth - 1 });
}

/** Replaces a block's text range, moving the marks that survive it. */
export function replaceText(
  document: DocumentModel,
  key: number,
  from: number,
  to: number,
  text: string,
): CommandResult {
  const block = find(document, key);
  if (block === undefined) return unchanged(document);
  const length = utf16Length(block.text);
  const start = clamp(from, 0, length);
  const end = clamp(to, start, length);
  const inserted = utf16Length(text);
  const delta = inserted - (end - start);
  const marks = block.marks
    .map((range) => ({
      ...range,
      from: mapMarkStart(range.from, start, end, delta, inserted),
      to: mapMarkEnd(range.to, start, end, delta),
    }))
    .filter((range) => range.from < range.to);
  return mapBlocks(document, (candidate) =>
    candidate.key === key
      ? normalizeBlock({
          ...candidate,
          text: candidate.text.slice(0, start) + text + candidate.text.slice(end),
          marks,
        })
      : candidate,
  );
}

/**
 * Moves a mark's edges *inward* across a replacement.
 *
 * A mark that straddles the edit must not swallow the new text: typing before
 * a bold word is not bold. A mark that contains the edit must: typing inside a
 * bold word is. Both fall out of pushing the start past the replacement and
 * pulling the end in front of it, which is the opposite of how a range that
 * should grow -- a link a user is extending -- is mapped.
 */
function mapMarkStart(
  offset: number,
  start: number,
  end: number,
  delta: number,
  inserted: number,
): number {
  if (offset <= start) return offset;
  if (offset >= end) return offset + delta;
  return start + inserted;
}

function mapMarkEnd(offset: number, start: number, end: number, delta: number): number {
  if (offset <= start) return offset;
  if (offset >= end) return offset + delta;
  return start;
}

function clipMarks(
  marks: readonly MarkRange[],
  from: number,
  to: number,
  shift: number,
): MarkRange[] {
  return marks
    .map((range) => ({
      ...range,
      from: Math.max(range.from, from) + shift,
      to: Math.min(range.to, to) + shift,
    }))
    .filter((range) => range.from < range.to);
}

function removeMark(
  marks: readonly MarkRange[],
  mark: MarkName,
  from: number,
  to: number,
): MarkRange[] {
  const result: MarkRange[] = [];
  for (const range of marks) {
    if (range.mark !== mark || range.to <= from || range.from >= to) {
      result.push(range);
      continue;
    }
    if (range.from < from) result.push({ ...range, to: from });
    if (range.to > to) result.push({ ...range, from: to });
  }
  return result;
}

function coveredBy(marks: readonly MarkRange[], mark: MarkName, from: number, to: number): boolean {
  let cursor = from;
  for (const range of marks
    .filter((candidate) => candidate.mark === mark)
    .sort((left, right) => left.from - right.from)) {
    if (range.from > cursor) break;
    cursor = Math.max(cursor, range.to);
    if (cursor >= to) return true;
  }
  return cursor >= to;
}

function toRange(mark: MarkName, range: BlockRange, href?: string): MarkRange {
  return href === undefined
    ? { mark, from: range.from, to: range.to }
    : { mark, from: range.from, to: range.to, href };
}

function find(document: DocumentModel, key: number): Block | undefined {
  return document.blocks.find((block) => block.key === key);
}

function mapBlocks(document: DocumentModel, transform: (block: Block) => Block): CommandResult {
  const blocks = document.blocks.map(transform);
  const changed = blocks.some((block, index) => block !== document.blocks[index]);
  return { document: changed ? { blocks } : document, changed, created: [] };
}

function unchanged(document: DocumentModel): CommandResult {
  return { document, changed: false, created: [] };
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, Math.trunc(value)));
}
