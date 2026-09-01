/**
 * Input rules: the typing that rewrites itself.
 *
 * A rule observes the value a block holds *after* a keystroke and returns the
 * command that rewrites it. It never sees the keystroke, because "the user
 * just typed the closing asterisk" is not a fact about a key -- it is a fact
 * about what the text now says, and a paste that produces the same text should
 * behave the same way.
 */

import {
  type CommandResult,
  liftListItem,
  replaceText,
  setBlockType,
  sinkListItem,
  toggleMark,
} from "./commands";
import { type Block, type BlockType, type DocumentModel, type MarkName, isLiteral } from "./schema";

/** Where the caret sits when a rule runs. */
export interface RuleContext {
  readonly key: number;
  readonly offset: number;
}

/** What a rule decided, including where the caret ends up. */
export interface RuleOutcome {
  readonly result: CommandResult;
  /** Caret offset inside the rule's block after the rewrite. */
  readonly offset: number;
}

/** One inline delimiter pair and the mark it produces. */
interface InlineRule {
  readonly delimiter: string;
  readonly mark: MarkName;
}

/**
 * Longest delimiter first: `**` has to win over `*`, or bold would never
 * happen and every attempt at it would produce two italic asterisks.
 */
const INLINE_RULES: readonly InlineRule[] = [
  { delimiter: "**", mark: "bold" },
  { delimiter: "~~", mark: "strike" },
  { delimiter: "`", mark: "code" },
  { delimiter: "*", mark: "italic" },
  { delimiter: "_", mark: "italic" },
];

/** One block prefix and the block it turns the paragraph into. */
interface BlockRule {
  readonly pattern: RegExp;
  readonly apply: (match: RegExpExecArray) => { type: BlockType; attributes: object };
}

const BLOCK_RULES: readonly BlockRule[] = [
  {
    pattern: /^(#{1,6})\s$/u,
    apply: (match) => ({ type: "heading", attributes: { level: match[1]?.length ?? 1 } }),
  },
  {
    pattern: /^[-*+]\s$/u,
    apply: () => ({ type: "listItem", attributes: { depth: 0, ordered: false } }),
  },
  {
    pattern: /^\d+[.)]\s$/u,
    apply: () => ({ type: "listItem", attributes: { depth: 0, ordered: true } }),
  },
  { pattern: /^>\s$/u, apply: () => ({ type: "blockquote", attributes: {} }) },
  {
    pattern: /^```(\w*)\s?$/u,
    apply: (match) => ({ type: "codeBlock", attributes: { language: match[1] ?? "" } }),
  },
];

/**
 * Runs the block-level rules against a block's prefix.
 *
 * The prefix is consumed, which is what makes the marker disappear the moment
 * it takes effect rather than sitting in the text as evidence.
 */
export function applyBlockRule(
  document: DocumentModel,
  context: RuleContext,
): RuleOutcome | undefined {
  const block = document.blocks.find((candidate) => candidate.key === context.key);
  if (block === undefined || block.type !== "paragraph" || isLiteral(block.type)) return undefined;
  const prefix = block.text.slice(0, context.offset);
  for (const rule of BLOCK_RULES) {
    const match = rule.pattern.exec(prefix);
    if (match === null) continue;
    const { type, attributes } = rule.apply(match);
    const trimmed = replaceText(document, block.key, 0, context.offset, "");
    if (!trimmed.changed) continue;
    const typed = setBlockType(trimmed.document, block.key, type, attributes);
    return {
      result: { ...typed, created: [] },
      offset: 0,
    };
  }
  return undefined;
}

/**
 * Runs the inline rules against the text before the caret.
 *
 * Only a closing delimiter fires: the opening one is ordinary text until its
 * partner arrives, which is why typing `*` alone leaves an asterisk.
 */
export function applyInlineRule(
  document: DocumentModel,
  context: RuleContext,
): RuleOutcome | undefined {
  const block = document.blocks.find((candidate) => candidate.key === context.key);
  if (block === undefined || isLiteral(block.type)) return undefined;
  const before = block.text.slice(0, context.offset);
  for (const rule of INLINE_RULES) {
    const span = matchInline(before, rule.delimiter);
    if (span === undefined) continue;
    const { open, contentStart, contentEnd } = span;
    // Remove the closing delimiter first so the opening one's offsets hold.
    const withoutClose = replaceText(
      document,
      block.key,
      contentEnd,
      contentEnd + rule.delimiter.length,
      "",
    );
    const withoutOpen = replaceText(withoutClose.document, block.key, open, contentStart, "");
    const shift = contentStart - open;
    const marked = toggleMark(
      withoutOpen.document,
      [{ key: block.key, from: open, to: contentEnd - shift }],
      rule.mark,
    );
    return {
      result: { ...marked, created: [] },
      offset: contentEnd - shift,
    };
  }
  return undefined;
}

/** Returns the command Tab issues on a block, in either direction. */
export function indentRule(document: DocumentModel, key: number, outdent: boolean): CommandResult {
  return outdent ? liftListItem(document, key) : sinkListItem(document, key);
}

interface InlineSpan {
  readonly open: number;
  readonly contentStart: number;
  readonly contentEnd: number;
}

function matchInline(before: string, delimiter: string): InlineSpan | undefined {
  if (!before.endsWith(delimiter)) return undefined;
  const contentEnd = before.length - delimiter.length;
  const open = before.lastIndexOf(delimiter, contentEnd - 1);
  if (open < 0) return undefined;
  const contentStart = open + delimiter.length;
  // An empty span is two delimiters in a row, which is text the user typed on
  // purpose far more often than it is a formatting request.
  if (contentStart >= contentEnd) return undefined;
  // A delimiter run longer than the rule's own is a different rule's business:
  // `***x***` must not be read as italic around `*x*`.
  if (before.slice(contentStart, contentStart + delimiter.length) === delimiter) return undefined;
  return { open, contentStart, contentEnd };
}

/** Returns whether a block would accept an input rule at all. */
export function acceptsInputRules(block: Block): boolean {
  return !isLiteral(block.type);
}
