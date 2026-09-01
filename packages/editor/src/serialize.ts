/**
 * HTML and Markdown, both directions.
 *
 * Serialization is the Shell's job because it is where the schema lives: what
 * a heading is, which marks nest, and what an unknown tag becomes are all
 * schema questions. Core never sees any of it.
 */

import {
  type Block,
  type BlockType,
  type DocumentModel,
  type MarkName,
  type MarkRange,
  normalizeBlock,
  normalizeDocument,
  utf16Length,
} from "./schema";
import type { BlockKeyAllocator } from "./commands";

/** Marks in the order they nest when written out. */
const MARK_ORDER: readonly MarkName[] = ["link", "bold", "italic", "strike", "code"];

const HTML_TAGS: Readonly<Record<Exclude<MarkName, "link">, string>> = {
  bold: "strong",
  italic: "em",
  strike: "s",
  code: "code",
};

const MARKDOWN_DELIMITERS: Readonly<Record<Exclude<MarkName, "link">, string>> = {
  bold: "**",
  italic: "*",
  strike: "~~",
  code: "`",
};

/** Writes a document as HTML. */
export function toHtml(document: DocumentModel): string {
  const parts: string[] = [];
  let listDepth = -1;
  let listOrdered = false;
  const closeLists = (toDepth: number): void => {
    while (listDepth > toDepth) {
      parts.push(listOrdered ? "</ol>" : "</ul>");
      listDepth -= 1;
    }
    if (listDepth < 0) listOrdered = false;
  };
  for (const block of document.blocks) {
    if (block.type !== "listItem") {
      closeLists(-1);
      parts.push(blockHtml(block));
      continue;
    }
    const depth = block.attributes.depth ?? 0;
    const ordered = block.attributes.ordered ?? false;
    if (listDepth >= 0 && ordered !== listOrdered) closeLists(-1);
    closeLists(depth);
    while (listDepth < depth) {
      parts.push(ordered ? "<ol>" : "<ul>");
      listDepth += 1;
      listOrdered = ordered;
    }
    parts.push(`<li>${inlineHtml(block)}</li>`);
  }
  closeLists(-1);
  return parts.join("");
}

/** Writes a document as Markdown. */
export function toMarkdown(document: DocumentModel): string {
  return document.blocks
    .map((block) => {
      const inline = inlineMarkdown(block);
      switch (block.type) {
        case "heading":
          return `${"#".repeat(block.attributes.level ?? 1)} ${inline}`;
        case "listItem": {
          const indent = "  ".repeat(block.attributes.depth ?? 0);
          return `${indent}${block.attributes.ordered === true ? "1." : "-"} ${inline}`;
        }
        case "blockquote":
          return `> ${inline}`;
        case "codeBlock":
          return `\`\`\`${block.attributes.language ?? ""}\n${block.text}\n\`\`\``;
        case "horizontalRule":
          return "---";
        case "image":
          return `![${block.attributes.alt ?? ""}](${block.attributes.src ?? ""})`;
        default:
          return inline;
      }
    })
    .join("\n\n");
}

/**
 * Reads external HTML into the schema.
 *
 * Anything the schema does not know becomes the nearest thing it does, because
 * a paste that drops content is worse than a paste that flattens it.
 */
export function fromHtml(html: string, allocator: BlockKeyAllocator): DocumentModel {
  const blocks: Block[] = [];
  const context: ParseContext = {
    blocks,
    allocator,
    listDepth: -1,
    ordered: [],
    pending: undefined,
  };
  parseNodes(tokenize(html), context);
  flushPending(context);
  const kept = blocks.filter(
    (block) => block.text.length > 0 || block.type === "horizontalRule" || block.type === "image",
  );
  return normalizeDocument({ blocks: kept });
}

/** Reads Markdown into the schema. */
export function fromMarkdown(markdown: string, allocator: BlockKeyAllocator): DocumentModel {
  const blocks: Block[] = [];
  const lines = markdown.split("\n");
  let index = 0;
  while (index < lines.length) {
    const line = lines[index] ?? "";
    index += 1;
    if (line.trim().length === 0) continue;
    const fence = /^```(\w*)$/u.exec(line.trim());
    if (fence !== null) {
      const body: string[] = [];
      while (index < lines.length && (lines[index] ?? "").trim() !== "```") {
        body.push(lines[index] ?? "");
        index += 1;
      }
      index += 1;
      blocks.push(
        normalizeBlock({
          key: allocator.allocate(),
          type: "codeBlock",
          attributes: { language: fence[1] ?? "" },
          text: body.join("\n"),
          marks: [],
        }),
      );
      continue;
    }
    blocks.push(markdownLine(line, allocator));
  }
  return normalizeDocument({ blocks });
}

function markdownLine(line: string, allocator: BlockKeyAllocator): Block {
  const heading = /^(#{1,6})\s+(.*)$/u.exec(line);
  if (heading !== null) {
    return inlineFromMarkdown(heading[2] ?? "", allocator, "heading", {
      level: heading[1]?.length ?? 1,
    });
  }
  const bullet = /^(\s*)[-*+]\s+(.*)$/u.exec(line);
  if (bullet !== null) {
    return inlineFromMarkdown(bullet[2] ?? "", allocator, "listItem", {
      depth: Math.floor((bullet[1]?.length ?? 0) / 2),
      ordered: false,
    });
  }
  const ordered = /^(\s*)\d+[.)]\s+(.*)$/u.exec(line);
  if (ordered !== null) {
    return inlineFromMarkdown(ordered[2] ?? "", allocator, "listItem", {
      depth: Math.floor((ordered[1]?.length ?? 0) / 2),
      ordered: true,
    });
  }
  const quote = /^>\s?(.*)$/u.exec(line);
  if (quote !== null) {
    return inlineFromMarkdown(quote[1] ?? "", allocator, "blockquote", {});
  }
  if (/^(-{3,}|\*{3,}|_{3,})$/u.test(line.trim())) {
    return normalizeBlock({
      key: allocator.allocate(),
      type: "horizontalRule",
      attributes: {},
      text: "",
      marks: [],
    });
  }
  return inlineFromMarkdown(line, allocator, "paragraph", {});
}

/** Parses Markdown emphasis into text plus marks. */
function inlineFromMarkdown(
  source: string,
  allocator: BlockKeyAllocator,
  type: BlockType,
  attributes: object,
): Block {
  let text = "";
  const marks: MarkRange[] = [];
  let index = 0;
  const delimiters: readonly [string, MarkName][] = [
    ["**", "bold"],
    ["~~", "strike"],
    ["`", "code"],
    ["*", "italic"],
    ["_", "italic"],
  ];
  outer: while (index < source.length) {
    const link = /^\[([^\]]*)\]\(([^)]*)\)/u.exec(source.slice(index));
    if (link !== null) {
      const label = link[1] ?? "";
      marks.push({
        mark: "link",
        from: utf16Length(text),
        to: utf16Length(text) + utf16Length(label),
        href: link[2] ?? "",
      });
      text += label;
      index += link[0].length;
      continue;
    }
    for (const [delimiter, mark] of delimiters) {
      if (!source.startsWith(delimiter, index)) continue;
      const close = source.indexOf(delimiter, index + delimiter.length);
      if (close < 0) continue;
      const body = source.slice(index + delimiter.length, close);
      if (body.length === 0) continue;
      marks.push({
        mark,
        from: utf16Length(text),
        to: utf16Length(text) + utf16Length(body),
      });
      text += body;
      index = close + delimiter.length;
      continue outer;
    }
    text += source[index] ?? "";
    index += 1;
  }
  return normalizeBlock({
    key: allocator.allocate(),
    type,
    attributes,
    text,
    marks,
  });
}

function blockHtml(block: Block): string {
  const inline = inlineHtml(block);
  switch (block.type) {
    case "heading": {
      const level = block.attributes.level ?? 1;
      return `<h${String(level)}>${inline}</h${String(level)}>`;
    }
    case "blockquote":
      return `<blockquote>${inline}</blockquote>`;
    case "codeBlock":
      return `<pre><code>${escapeHtml(block.text)}</code></pre>`;
    case "horizontalRule":
      return "<hr>";
    case "image":
      return `<img src="${escapeHtml(block.attributes.src ?? "")}" alt="${escapeHtml(
        block.attributes.alt ?? "",
      )}">`;
    default:
      return `<p>${inline}</p>`;
  }
}

/** Splits a block's text at every mark boundary and wraps each piece. */
function segments(block: Block): { text: string; marks: readonly MarkRange[] }[] {
  const boundaries = new Set<number>([0, utf16Length(block.text)]);
  for (const range of block.marks) {
    boundaries.add(range.from);
    boundaries.add(range.to);
  }
  const ordered = [...boundaries].sort((left, right) => left - right);
  const result: { text: string; marks: readonly MarkRange[] }[] = [];
  for (let index = 0; index + 1 < ordered.length; index += 1) {
    const from = ordered[index] ?? 0;
    const to = ordered[index + 1] ?? 0;
    if (from >= to) continue;
    result.push({
      text: block.text.slice(from, to),
      marks: block.marks.filter((range) => range.from <= from && range.to >= to),
    });
  }
  return result;
}

function inlineHtml(block: Block): string {
  return segments(block)
    .map(({ text, marks }) => {
      let html = escapeHtml(text);
      for (const mark of [...MARK_ORDER].reverse()) {
        const range = marks.find((candidate) => candidate.mark === mark);
        if (range === undefined) continue;
        html =
          mark === "link"
            ? `<a href="${escapeHtml(range.href ?? "")}">${html}</a>`
            : `<${HTML_TAGS[mark]}>${html}</${HTML_TAGS[mark]}>`;
      }
      return html;
    })
    .join("");
}

function inlineMarkdown(block: Block): string {
  return segments(block)
    .map(({ text, marks }) => {
      let value = text;
      for (const mark of [...MARK_ORDER].reverse()) {
        const range = marks.find((candidate) => candidate.mark === mark);
        if (range === undefined) continue;
        value =
          mark === "link"
            ? `[${value}](${range.href ?? ""})`
            : `${MARKDOWN_DELIMITERS[mark]}${value}${MARKDOWN_DELIMITERS[mark]}`;
      }
      return value;
    })
    .join("");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;");
}

// --- a very small HTML reader ------------------------------------------------
//
// Deliberately not a browser parser: paste normalization has to run in a worker
// and in tests, and the schema only needs to recognize the handful of tags it
// can represent. Everything else becomes text.

type Token =
  | { readonly kind: "open"; readonly name: string; readonly attributes: Map<string, string> }
  | { readonly kind: "close"; readonly name: string }
  | { readonly kind: "text"; readonly value: string };

function tokenize(html: string): Token[] {
  const tokens: Token[] = [];
  const pattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^<>]*?)?)\/?>/gu;
  let cursor = 0;
  for (let match = pattern.exec(html); match !== null; match = pattern.exec(html)) {
    if (match.index > cursor) {
      tokens.push({ kind: "text", value: html.slice(cursor, match.index) });
    }
    const name = (match[1] ?? "").toLowerCase();
    if (match[0].startsWith("</")) tokens.push({ kind: "close", name });
    else tokens.push({ kind: "open", name, attributes: parseAttributes(match[2] ?? "") });
    cursor = match.index + match[0].length;
  }
  if (cursor < html.length) tokens.push({ kind: "text", value: html.slice(cursor) });
  return tokens;
}

function parseAttributes(source: string): Map<string, string> {
  const attributes = new Map<string, string>();
  const pattern = /([a-zA-Z-]+)\s*=\s*"([^"]*)"/gu;
  for (let match = pattern.exec(source); match !== null; match = pattern.exec(source)) {
    attributes.set((match[1] ?? "").toLowerCase(), unescapeHtml(match[2] ?? ""));
  }
  return attributes;
}

function unescapeHtml(value: string): string {
  return (
    value
      .replace(/&nbsp;/gu, "\u00a0")
      .replace(/&#(\d+);/gu, (_match, code: string) =>
        String.fromCodePoint(Number.parseInt(code, 10)),
      )
      .replace(/&lt;/gu, "<")
      .replace(/&gt;/gu, ">")
      .replace(/&quot;/gu, '"')
      .replace(/&#x27;|&apos;/giu, "'")
      // `&amp;` last, or `&amp;lt;` would decode twice into a tag.
      .replace(/&amp;/gu, "&")
  );
}

interface PendingBlock {
  text: string;
  marks: MarkRange[];
  type: BlockType;
  attributes: object;
}

interface ParseContext {
  readonly blocks: Block[];
  readonly allocator: BlockKeyAllocator;
  listDepth: number;
  ordered: boolean[];
  /** The block being accumulated; parse state, not module state, so two
   * pastes cannot interleave into one document. */
  pending: PendingBlock | undefined;
}

const BLOCK_TAGS: ReadonlyMap<string, BlockType> = new Map<string, BlockType>([
  ["p", "paragraph"],
  ["h1", "heading"],
  ["h2", "heading"],
  ["h3", "heading"],
  ["h4", "heading"],
  ["h5", "heading"],
  ["h6", "heading"],
  ["blockquote", "blockquote"],
  ["pre", "codeBlock"],
  ["li", "listItem"],
  ["div", "paragraph"],
]);

const MARK_TAGS: ReadonlyMap<string, MarkName> = new Map<string, MarkName>([
  ["strong", "bold"],
  ["b", "bold"],
  ["em", "italic"],
  ["i", "italic"],
  ["s", "strike"],
  ["del", "strike"],
  ["code", "code"],
  ["a", "link"],
]);

function parseNodes(tokens: readonly Token[], context: ParseContext): void {
  const openMarks: { mark: MarkName; from: number; href?: string }[] = [];
  const start = (type: BlockType, attributes: object): void => {
    flushPending(context);
    context.pending = { text: "", marks: [], type, attributes };
  };
  for (const token of tokens) {
    if (token.kind === "text") {
      const value = unescapeHtml(token.value).replace(/\s+/gu, " ");
      if (value.trim().length === 0 && context.pending === undefined) continue;
      context.pending ??= { text: "", marks: [], type: "paragraph", attributes: {} };
      context.pending.text += value;
      continue;
    }
    if (token.kind === "open") {
      if (token.name === "ul" || token.name === "ol") {
        context.listDepth += 1;
        context.ordered[context.listDepth] = token.name === "ol";
        continue;
      }
      if (token.name === "br") {
        flushPending(context);
        continue;
      }
      if (token.name === "hr") {
        flushPending(context);
        context.blocks.push(
          normalizeBlock({
            key: context.allocator.allocate(),
            type: "horizontalRule",
            attributes: {},
            text: "",
            marks: [],
          }),
        );
        continue;
      }
      if (token.name === "img") {
        flushPending(context);
        context.blocks.push(
          normalizeBlock({
            key: context.allocator.allocate(),
            type: "image",
            attributes: {
              src: token.attributes.get("src") ?? "",
              alt: token.attributes.get("alt") ?? "",
            },
            text: "",
            marks: [],
          }),
        );
        continue;
      }
      const blockType = BLOCK_TAGS.get(token.name);
      if (blockType !== undefined) {
        const attributes =
          blockType === "heading"
            ? { level: Number.parseInt(token.name.slice(1), 10) }
            : blockType === "listItem"
              ? {
                  depth: Math.max(0, context.listDepth),
                  ordered: context.ordered[Math.max(0, context.listDepth)] ?? false,
                }
              : {};
        start(blockType, attributes);
        continue;
      }
      const mark = MARK_TAGS.get(token.name);
      if (mark !== undefined) {
        context.pending ??= { text: "", marks: [], type: "paragraph", attributes: {} };
        const href = token.attributes.get("href");
        openMarks.push(
          href === undefined
            ? { mark, from: utf16Length(context.pending.text) }
            : { mark, from: utf16Length(context.pending.text), href },
        );
      }
      continue;
    }
    if (token.name === "ul" || token.name === "ol") {
      context.ordered.pop();
      context.listDepth -= 1;
      continue;
    }
    const mark = MARK_TAGS.get(token.name);
    const current = context.pending;
    if (mark !== undefined && current !== undefined) {
      const index = openMarks.findLastIndex((candidate) => candidate.mark === mark);
      const open = index < 0 ? undefined : openMarks.splice(index, 1)[0];
      if (open !== undefined && utf16Length(current.text) > open.from) {
        current.marks.push(
          open.href === undefined
            ? { mark, from: open.from, to: utf16Length(current.text) }
            : { mark, from: open.from, to: utf16Length(current.text), href: open.href },
        );
      }
      continue;
    }
    if (BLOCK_TAGS.has(token.name)) flushPending(context);
  }
}

function flushPending(context: ParseContext): void {
  const pending = context.pending;
  context.pending = undefined;
  if (pending === undefined) return;
  const text = pending.text.trim();
  if (text.length === 0) return;
  context.blocks.push(
    normalizeBlock({
      key: context.allocator.allocate(),
      type: pending.type,
      attributes: pending.attributes,
      text,
      marks: pending.marks,
    }),
  );
}
