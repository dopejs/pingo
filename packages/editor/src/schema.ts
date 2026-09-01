/**
 * What a document is allowed to contain.
 *
 * The schema lives here rather than in Core because "Tab means indent this
 * list item" and "Enter on an empty list item leaves the list" are application
 * decisions. Core owns where the caret is; this owns what the structure around
 * it may become.
 */

/** A mark applied to a run of characters. */
export type MarkName = "bold" | "code" | "italic" | "link" | "strike";

/** A block's type. */
export type BlockType =
  "blockquote" | "codeBlock" | "heading" | "horizontalRule" | "image" | "listItem" | "paragraph";

/** Attributes a block carries, by type. */
export interface BlockAttributes {
  /** Heading level, 1 through 6. */
  readonly level?: number;
  /** Whether a list item belongs to an ordered list. */
  readonly ordered?: boolean;
  /** How deeply a list item nests; zero is a top-level item. */
  readonly depth?: number;
  /** A code block's language, or the empty string when unset. */
  readonly language?: string;
  /** An image block's source. */
  readonly src?: string;
  /** An image block's alternative text. */
  readonly alt?: string;
}

/** One mark applied over a half-open UTF-16 range of a block's text. */
export interface MarkRange {
  readonly mark: MarkName;
  readonly from: number;
  readonly to: number;
  /** A link's destination; ignored by every other mark. */
  readonly href?: string;
}

/** One block of a document. */
export interface Block {
  /** Stable identity, assigned once and kept for the block's lifetime. */
  readonly key: number;
  readonly type: BlockType;
  readonly attributes: BlockAttributes;
  /** The block's text; empty for a block that has none. */
  readonly text: string;
  /** Marks over that text, in ascending order and non-overlapping per mark. */
  readonly marks: readonly MarkRange[];
}

/** An ordered block sequence. */
export interface DocumentModel {
  readonly blocks: readonly Block[];
}

/** Blocks the caret may not enter, because they are objects rather than text. */
const ATOMIC_TYPES: ReadonlySet<BlockType> = new Set<BlockType>(["horizontalRule", "image"]);

/** Blocks whose text is taken literally, so no input rule fires inside them. */
const LITERAL_TYPES: ReadonlySet<BlockType> = new Set<BlockType>(["codeBlock"]);

/** Marks a block type refuses, whatever the command asks for. */
const FORBIDDEN_MARKS: ReadonlyMap<BlockType, ReadonlySet<MarkName>> = new Map([
  // A code block is one literal run: styling part of it would be styling the
  // program text, which is not what the mark means.
  ["codeBlock", new Set<MarkName>(["bold", "code", "italic", "link", "strike"])],
]);

/** The maximum depth a list item may reach. */
export const MAXIMUM_LIST_DEPTH = 8;

/** Returns whether the caret may enter blocks of this type. */
export function isAtomic(type: BlockType): boolean {
  return ATOMIC_TYPES.has(type);
}

/** Returns whether input rules are suppressed inside blocks of this type. */
export function isLiteral(type: BlockType): boolean {
  return LITERAL_TYPES.has(type);
}

/** Returns whether a block of this type accepts a mark. */
export function acceptsMark(type: BlockType, mark: MarkName): boolean {
  return !FORBIDDEN_MARKS.get(type)?.has(mark);
}

/**
 * Returns the type a new block gets when `block` is split at its end.
 *
 * Pressing Enter at the end of a heading starts a paragraph, because the next
 * thing a writer types is prose; pressing it in a list continues the list.
 */
export function typeAfterSplit(block: Block): BlockType {
  switch (block.type) {
    case "listItem":
    case "codeBlock":
      return block.type;
    default:
      return "paragraph";
  }
}

/** Returns the attributes a new block gets when `block` is split. */
export function attributesAfterSplit(block: Block): BlockAttributes {
  switch (block.type) {
    case "listItem":
      return { depth: block.attributes.depth ?? 0, ordered: block.attributes.ordered ?? false };
    case "codeBlock":
      return { language: block.attributes.language ?? "" };
    default:
      return {};
  }
}

/**
 * Normalizes a block onto the schema, dropping what it may not carry.
 *
 * Everything that reaches the model goes through this, so a paste and a
 * command cannot produce two differently shaped documents.
 */
export function normalizeBlock(block: Block): Block {
  const text = isAtomic(block.type) ? "" : block.text;
  const length = utf16Length(text);
  const attributes = normalizeAttributes(block.type, block.attributes);
  const marks = normalizeMarks(block.type, block.marks, length);
  return { key: block.key, type: block.type, attributes, text, marks };
}

/** Returns a document whose every block satisfies the schema. */
export function normalizeDocument(document: DocumentModel): DocumentModel {
  return { blocks: document.blocks.map(normalizeBlock) };
}

function normalizeAttributes(type: BlockType, attributes: BlockAttributes): BlockAttributes {
  switch (type) {
    case "heading":
      return { level: clamp(attributes.level ?? 1, 1, 6) };
    case "listItem":
      return {
        depth: clamp(attributes.depth ?? 0, 0, MAXIMUM_LIST_DEPTH),
        ordered: attributes.ordered ?? false,
      };
    case "codeBlock":
      return { language: attributes.language ?? "" };
    case "image":
      return { src: attributes.src ?? "", alt: attributes.alt ?? "" };
    default:
      return {};
  }
}

/**
 * Clips marks to the text, drops the ones the block type refuses, and merges
 * touching ranges of the same mark.
 *
 * Merging matters: two adjacent bold ranges and one bold range have to compare
 * equal, or toggling bold off would leave a seam that only shows up as a mark
 * the user cannot remove.
 */
function normalizeMarks(
  type: BlockType,
  marks: readonly MarkRange[],
  length: number,
): readonly MarkRange[] {
  const clipped = marks
    .filter((range) => acceptsMark(type, range.mark))
    .map((range) => ({
      ...range,
      from: clamp(range.from, 0, length),
      to: clamp(range.to, 0, length),
    }))
    .filter((range) => range.from < range.to)
    .sort((left, right) => left.from - right.from || left.mark.localeCompare(right.mark));
  const merged: MarkRange[] = [];
  for (const range of clipped) {
    const previous = merged.at(-1);
    if (
      previous !== undefined &&
      previous.mark === range.mark &&
      previous.href === range.href &&
      previous.to >= range.from
    ) {
      merged[merged.length - 1] = { ...previous, to: Math.max(previous.to, range.to) };
      continue;
    }
    merged.push(range);
  }
  return merged;
}

/** Returns a string's length in the UTF-16 units Core counts in. */
export function utf16Length(value: string): number {
  return value.length;
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, Math.trunc(value)));
}
