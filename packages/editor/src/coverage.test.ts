import { describe, expect, it } from "vitest";

import type { EditStream } from "@dopejs/pingo-editing";

import {
  BlockKeyAllocator,
  Editor,
  acceptsInputRules,
  acceptsMark,
  applyBlockRule,
  applyInlineRule,
  attributesAfterSplit,
  fromHtml,
  fromMarkdown,
  indentRule,
  isAtomic,
  isLiteral,
  liftListItem,
  markIsActive,
  mergeBlocks,
  normalizeBlock,
  removeBlocks,
  replaceText,
  setBlockType,
  sinkListItem,
  splitBlock,
  toHtml,
  toMarkdown,
  toggleMark,
  typeAfterSplit,
  utf16Length,
} from "./index";
import type { Block, DocumentModel } from "./index";

function paragraph(key: number, text: string): Block {
  return { key, type: "paragraph", attributes: {}, text, marks: [] };
}

function document(...blocks: Block[]): DocumentModel {
  return { blocks };
}

function listItem(key: number, text: string, depth = 0, ordered = false): Block {
  return { key, type: "listItem", attributes: { depth, ordered }, text, marks: [] };
}

describe("commands refuse what they cannot do", () => {
  it("returns the document unchanged when the block is not there", () => {
    const before = document(paragraph(1, "a"));
    const allocator = new BlockKeyAllocator(before);
    for (const result of [
      setBlockType(before, 99, "heading", { level: 2 }),
      splitBlock(before, 99, 0, allocator),
      mergeBlocks(before, 99, 1),
      mergeBlocks(before, 1, 99),
      mergeBlocks(before, 1, 1),
      removeBlocks(before, [99]),
      replaceText(before, 99, 0, 1, "x"),
      sinkListItem(before, 99),
      liftListItem(before, 99),
      liftListItem(before, 1),
      toggleMark(before, [{ key: 99, from: 0, to: 1 }], "bold"),
      toggleMark(before, [{ key: 1, from: 1, to: 1 }], "bold"),
    ]) {
      expect(result.changed).toBe(false);
      expect(result.document).toStrictEqual(before);
    }
    expect(markIsActive(before, [], "bold")).toBe(false);
    expect(markIsActive(before, [{ key: 99, from: 0, to: 1 }], "bold")).toBe(false);
  });

  it("clamps a replacement to the text it is given", () => {
    const before = document(paragraph(1, "abc"));
    expect(replaceText(before, 1, 9, 99, "Z").document.blocks[0]?.text).toBe("abcZ");
    expect(replaceText(before, 1, 2, 1, "Z").document.blocks[0]?.text).toBe("abZc");
  });

  it("refuses a mark a block type does not accept", () => {
    const code: Block = {
      key: 1,
      type: "codeBlock",
      attributes: { language: "rust" },
      text: "fn main() {}",
      marks: [],
    };
    expect(toggleMark(document(code), [{ key: 1, from: 0, to: 2 }], "bold").changed).toBe(false);
    expect(acceptsMark("codeBlock", "bold")).toBe(false);
    expect(acceptsMark("paragraph", "bold")).toBe(true);
  });

  it("splits a code block into another code block and a heading into a paragraph", () => {
    const code: Block = {
      key: 1,
      type: "codeBlock",
      attributes: { language: "rust" },
      text: "ab",
      marks: [],
    };
    expect(typeAfterSplit(code)).toBe("codeBlock");
    expect(attributesAfterSplit(code)).toEqual({ language: "rust" });
    const heading: Block = {
      key: 2,
      type: "heading",
      attributes: { level: 1 },
      text: "t",
      marks: [],
    };
    expect(typeAfterSplit(heading)).toBe("paragraph");
    expect(attributesAfterSplit(heading)).toEqual({});
    const item = listItem(3, "x", 2, true);
    expect(attributesAfterSplit(item)).toEqual({ depth: 2, ordered: true });

    const allocator = new BlockKeyAllocator(document(code));
    const split = splitBlock(document(code), 1, 1, allocator);
    expect(split.document.blocks.map((block) => block.type)).toEqual(["codeBlock", "codeBlock"]);
  });

  it("carries a split block's marks onto both halves", () => {
    const before = toggleMark(
      document(paragraph(1, "abcdef")),
      [{ key: 1, from: 1, to: 5 }],
      "bold",
    );
    const allocator = new BlockKeyAllocator(before.document);
    const split = splitBlock(before.document, 1, 3, allocator);
    expect(split.document.blocks[0]?.marks).toEqual([{ mark: "bold", from: 1, to: 3 }]);
    expect(split.document.blocks[1]?.marks).toEqual([{ mark: "bold", from: 0, to: 2 }]);
    // Merging them back restores one run rather than two touching ones.
    const merged = mergeBlocks(split.document, 1, split.document.blocks[1]?.key ?? 0);
    expect(merged.document.blocks[0]?.marks).toEqual([{ mark: "bold", from: 1, to: 5 }]);
  });

  it("turns a paragraph after a list item into one, and refuses otherwise", () => {
    const before = document(listItem(1, "one"), paragraph(2, "two"));
    const sunk = sinkListItem(before, 2);
    expect(sunk.document.blocks[1]?.type).toBe("listItem");
    expect(sunk.document.blocks[1]?.attributes.depth).toBe(0);
    expect(sinkListItem(document(paragraph(1, "a"), paragraph(2, "b")), 2).changed).toBe(false);
  });

  it("stops handing out keys before they could collide", () => {
    const allocator = new BlockKeyAllocator({
      blocks: [paragraph(0xffff_fffe, "a")],
    });
    expect(() => allocator.allocate()).toThrow(/exhausted/u);
  });
});

describe("input rules", () => {
  it("stays out of blocks whose text is literal", () => {
    const code: Block = {
      key: 1,
      type: "codeBlock",
      attributes: { language: "" },
      text: "## a**b**",
      marks: [],
    };
    expect(isLiteral("codeBlock")).toBe(true);
    expect(isLiteral("paragraph")).toBe(false);
    expect(acceptsInputRules(code)).toBe(false);
    expect(applyInlineRule(document(code), { key: 1, offset: 9 })).toBeUndefined();
    expect(applyBlockRule(document(code), { key: 1, offset: 3 })).toBeUndefined();
  });

  it("recognizes every block marker and nothing else", () => {
    for (const [text, type] of [
      ["# ", "heading"],
      ["###### ", "heading"],
      ["- ", "listItem"],
      ["* ", "listItem"],
      ["+ ", "listItem"],
      ["1. ", "listItem"],
      ["2) ", "listItem"],
      ["> ", "blockquote"],
      ["```rust ", "codeBlock"],
    ] as const) {
      const outcome = applyBlockRule(document(paragraph(1, text)), {
        key: 1,
        offset: text.length,
      });
      expect(outcome?.result.document.blocks[0]?.type, text).toBe(type);
    }
    expect(
      applyBlockRule(document(paragraph(1, "####### ")), { key: 1, offset: 8 }),
    ).toBeUndefined();
    expect(applyBlockRule(document(paragraph(1, "plain")), { key: 1, offset: 5 })).toBeUndefined();
    expect(applyBlockRule(document(paragraph(1, "- ")), { key: 99, offset: 2 })).toBeUndefined();
  });

  it("leaves a doubled delimiter and an empty span alone", () => {
    // `****` is four asterisks the user typed, not an empty bold span.
    expect(applyInlineRule(document(paragraph(1, "****")), { key: 1, offset: 4 })).toBeUndefined();
    // A run of three delimiters is ambiguous -- bold-inside-italic or the
    // reverse -- so no rule claims it and the asterisks stay text.
    expect(
      applyInlineRule(document(paragraph(1, "***x***")), { key: 1, offset: 7 }),
    ).toBeUndefined();
    expect(
      applyInlineRule(document(paragraph(1, "no delimiters")), { key: 1, offset: 3 }),
    ).toBeUndefined();
    expect(applyInlineRule(document(paragraph(1, "a")), { key: 99, offset: 1 })).toBeUndefined();
  });

  it("recognizes every inline delimiter", () => {
    for (const [text, mark] of [
      ["a~~b~~", "strike"],
      ["a`b`", "code"],
      ["a*b*", "italic"],
      ["a_b_", "italic"],
    ] as const) {
      const outcome = applyInlineRule(document(paragraph(1, text)), {
        key: 1,
        offset: text.length,
      });
      expect(outcome?.result.document.blocks[0]?.marks[0]?.mark, text).toBe(mark);
    }
  });

  it("indents and outdents through one entry point", () => {
    const before = document(listItem(1, "one"), listItem(2, "two"));
    expect(indentRule(before, 2, false).document.blocks[1]?.attributes.depth).toBe(1);
    expect(indentRule(before, 1, true).document.blocks[0]?.type).toBe("paragraph");
  });
});

describe("serialization covers the shapes the schema has", () => {
  it("writes and reads every block type", () => {
    const model = document(
      { key: 1, type: "heading", attributes: { level: 3 }, text: "h", marks: [] },
      { key: 2, type: "blockquote", attributes: {}, text: "q", marks: [] },
      { key: 3, type: "codeBlock", attributes: { language: "rust" }, text: "let x = 1", marks: [] },
      { key: 4, type: "horizontalRule", attributes: {}, text: "", marks: [] },
      { key: 5, type: "image", attributes: { src: "a.png", alt: "cat" }, text: "", marks: [] },
      listItem(6, "one", 0, true),
      listItem(7, "two", 1, true),
    );
    const html = toHtml(model);
    expect(html).toContain("<h3>h</h3>");
    expect(html).toContain("<blockquote>q</blockquote>");
    expect(html).toContain("<pre><code>let x = 1</code></pre>");
    expect(html).toContain("<hr>");
    expect(html).toContain('<img src="a.png" alt="cat">');
    expect(html).toContain("<ol><li>one</li><ol><li>two</li></ol></ol>");

    const markdown = toMarkdown(model);
    expect(markdown).toContain("### h");
    expect(markdown).toContain("> q");
    expect(markdown).toContain("```rust\nlet x = 1\n```");
    expect(markdown).toContain("---");
    expect(markdown).toContain("![cat](a.png)");
    expect(markdown).toContain("1. one");
    expect(markdown).toContain("  1. two");
  });

  it("reads every Markdown block back", () => {
    const model = fromMarkdown(
      [
        "# Title",
        "",
        "- one",
        "  - nested",
        "1. first",
        "> quote",
        "***",
        "```js",
        "code()",
        "```",
        "plain",
      ].join("\n"),
      new BlockKeyAllocator(),
    );
    expect(model.blocks.map((block) => block.type)).toEqual([
      "heading",
      "listItem",
      "listItem",
      "listItem",
      "blockquote",
      "horizontalRule",
      "codeBlock",
      "paragraph",
    ]);
    expect(model.blocks[2]?.attributes.depth).toBe(1);
    expect(model.blocks[3]?.attributes.ordered).toBe(true);
    expect(model.blocks[6]?.text).toBe("code()");
  });

  it("reads Markdown emphasis and links into marks", () => {
    const model = fromMarkdown("a **b** _c_ `d` ~~e~~ [f](https://x)", new BlockKeyAllocator());
    expect(model.blocks[0]?.text).toBe("a b c d e f");
    expect(model.blocks[0]?.marks.map((range) => range.mark).sort()).toEqual([
      "bold",
      "code",
      "italic",
      "link",
      "strike",
    ]);
    // An unclosed delimiter stays literal text.
    expect(fromMarkdown("a **b", new BlockKeyAllocator()).blocks[0]?.text).toBe("a **b");
  });

  it("reads a list that switches from unordered to ordered", () => {
    const model = fromHtml("<ul><li>a</li></ul><ol><li>b</li></ol>", new BlockKeyAllocator());
    expect(model.blocks.map((block) => block.attributes.ordered)).toEqual([false, true]);
    expect(toHtml(model)).toBe("<ul><li>a</li></ul><ol><li>b</li></ol>");
  });

  it("treats a line break as a block boundary and drops empty blocks", () => {
    const model = fromHtml("<p>a<br>b</p><p>   </p>", new BlockKeyAllocator());
    expect(model.blocks.map((block) => block.text)).toEqual(["a", "b"]);
  });

  it("keeps an image and a rule that arrive between paragraphs", () => {
    const model = fromHtml('<p>a</p><hr><img src="b.png"><p>c</p>', new BlockKeyAllocator());
    expect(model.blocks.map((block) => block.type)).toEqual([
      "paragraph",
      "horizontalRule",
      "image",
      "paragraph",
    ]);
    expect(model.blocks[2]?.attributes.src).toBe("b.png");
  });

  it("counts UTF-16 units the way Core does", () => {
    expect(utf16Length("🙂")).toBe(2);
    expect(isAtomic("image")).toBe(true);
    expect(isAtomic("paragraph")).toBe(false);
    expect(normalizeBlock(paragraph(1, "a")).marks).toEqual([]);
  });
});

describe("Editor glue", () => {
  it("ignores a transaction for a node it does not own", () => {
    const editor = new Editor({ document: document(paragraph(1, "a")) });
    const stream: EditStream = {
      transactions: [
        {
          nodeId: 404,
          baseRevision: 0n,
          revision: 1n,
          delta: { range: { start: 0, end: 1 }, text: "z" },
          selection: {
            anchor: 0,
            anchorAffinity: "downstream",
            focus: 0,
            focusAffinity: "downstream",
          },
          kind: "edit",
          map: [],
        },
      ],
      structure: [],
      selections: [],
    };
    editor.applyEditStream(stream, new Map());
    expect(editor.document.blocks[0]?.text).toBe("a");
  });

  it("records the selection Core reports and runs the input rules", () => {
    const editor = new Editor({ document: document(paragraph(1, "## ")) });
    editor.applyEditStream(
      {
        transactions: [],
        structure: [],
        selections: [
          { nodeId: 5, selection: { kind: "gap", index: 2 } },
          { nodeId: 5, selection: { kind: "node", key: 1 } },
        ],
      },
      new Map(),
    );
    // The last one wins: it is the one Core currently holds.
    expect(editor.selection).toEqual({ kind: "node", key: 1 });

    expect(editor.runInputRules(1, 3)).toBe(0);
    expect(editor.document.blocks[0]?.type).toBe("heading");
    // A block with no rule to fire leaves the caret where it was.
    expect(editor.runInputRules(1, 0)).toBe(0);
  });

  it("runs an inline rule through the same entry point", () => {
    const editor = new Editor({ document: document(paragraph(1, "a**b**")) });
    expect(editor.runInputRules(1, 6)).toBe(2);
    expect(editor.document.blocks[0]?.text).toBe("ab");
  });

  it("answers a remove and a merge request", () => {
    const editor = new Editor({
      document: document(paragraph(1, "one"), paragraph(2, "two"), paragraph(3, "three")),
    });
    editor.applyStructureRequest({
      nodeId: 9,
      sequence: 1,
      kind: "remove",
      target: 0,
      source: 0,
      offset: 0,
      keys: [2],
    });
    expect(editor.document.blocks.map((block) => block.key)).toEqual([1, 3]);
    editor.applyStructureRequest({
      nodeId: 9,
      sequence: 2,
      kind: "merge",
      target: 1,
      source: 3,
      offset: 0,
      keys: [],
    });
    expect(editor.document.blocks).toHaveLength(1);
    expect(editor.document.blocks[0]?.text).toBe("onethree");
  });

  it("starts from one empty paragraph and accepts a wholesale replacement", () => {
    const editor = new Editor();
    expect(editor.document.blocks).toEqual([
      { key: 1, type: "paragraph", attributes: {}, text: "", marks: [] },
    ]);
    const before = editor.projection().revision;
    editor.setDocument(document(paragraph(7, "new")));
    expect(editor.document.blocks[0]?.key).toBe(7);
    expect(editor.projection().revision).toBeGreaterThan(before);
    // The allocator restarts above the highest live key, so a later split
    // cannot reuse one.
    editor.applyStructureRequest({
      nodeId: 9,
      sequence: 1,
      kind: "split",
      target: 7,
      source: 0,
      offset: 1,
      keys: [],
    });
    expect(editor.document.blocks.map((block) => block.key)).toEqual([7, 8]);
  });
});
