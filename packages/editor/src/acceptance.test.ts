import { describe, expect, it } from "vitest";

import {
  BlockKeyAllocator,
  Editor,
  applyBlockRule,
  applyInlineRule,
  fromHtml,
  fromMarkdown,
  indentRule,
  liftListItem,
  markIsActive,
  removeBlocks,
  replaceText,
  sinkListItem,
  splitBlock,
  toHtml,
  toMarkdown,
  toggleMark,
  type Block,
  type DocumentModel,
} from "./index";

function paragraph(key: number, text: string): Block {
  return { key, type: "paragraph", attributes: {}, text, marks: [] };
}

function document(...blocks: Block[]): DocumentModel {
  return { blocks };
}

/**
 * The eleven behaviours §1 of the E15 design fixes as the acceptance
 * criteria, in its order. Each one is stated the way the design states it,
 * without feature names.
 */
describe("E15 acceptance", () => {
  it("1: bolding three characters in the middle of a paragraph leaves the rest alone", () => {
    const before = document(paragraph(1, "abcdefg"));
    const after = toggleMark(before, [{ key: 1, from: 2, to: 5 }], "bold");
    expect(after.changed).toBe(true);
    expect(after.document.blocks[0]?.text).toBe("abcdefg");
    expect(after.document.blocks[0]?.marks).toEqual([{ mark: "bold", from: 2, to: 5 }]);
    // Toggling the same range again takes it off, which is what makes the
    // button one button.
    const off = toggleMark(after.document, [{ key: 1, from: 2, to: 5 }], "bold");
    expect(off.document.blocks[0]?.marks).toEqual([]);
    expect(markIsActive(after.document, [{ key: 1, from: 2, to: 5 }], "bold")).toBe(true);
    expect(markIsActive(after.document, [{ key: 1, from: 1, to: 5 }], "bold")).toBe(false);
  });

  it("2: typing the closing delimiter of **bold** removes the markers and bolds the span", () => {
    // The user has typed "a**bold**"; the rule sees the value, not the key.
    const before = document(paragraph(1, "a**bold**"));
    const outcome = applyInlineRule(before, { key: 1, offset: 9 });
    expect(outcome).toBeDefined();
    expect(outcome?.result.document.blocks[0]?.text).toBe("abold");
    expect(outcome?.result.document.blocks[0]?.marks).toEqual([{ mark: "bold", from: 1, to: 5 }]);
    expect(outcome?.offset).toBe(5);

    // A lone opening delimiter is ordinary text until its partner arrives.
    expect(applyInlineRule(document(paragraph(1, "a**b")), { key: 1, offset: 4 })).toBeUndefined();
  });

  it("3: typing '## ' at the start of a block makes a level-two heading and vanishes", () => {
    const outcome = applyBlockRule(document(paragraph(1, "## ")), { key: 1, offset: 3 });
    expect(outcome).toBeDefined();
    const block = outcome?.result.document.blocks[0];
    expect(block?.type).toBe("heading");
    expect(block?.attributes.level).toBe(2);
    expect(block?.text).toBe("");
    expect(outcome?.offset).toBe(0);

    // The marker only counts at the start of the block.
    expect(applyBlockRule(document(paragraph(1, "x## ")), { key: 1, offset: 4 })).toBeUndefined();
  });

  it("4: Enter splits a block, and Enter on an empty list item leaves the list", () => {
    const allocator = new BlockKeyAllocator(document(paragraph(1, "abcd")));
    const split = splitBlock(document(paragraph(1, "abcd")), 1, 2, allocator);
    expect(split.document.blocks.map((block) => block.text)).toEqual(["ab", "cd"]);
    // The head keeps its key so every anchor pointing at it stays valid.
    expect(split.document.blocks[0]?.key).toBe(1);
    expect(split.created).toEqual([split.document.blocks[1]?.key]);

    const nested: Block = {
      key: 2,
      type: "listItem",
      attributes: { depth: 1, ordered: false },
      text: "",
      marks: [],
    };
    const lifted = splitBlock(document(nested), 2, 0, allocator);
    expect(lifted.document.blocks).toHaveLength(1);
    expect(lifted.document.blocks[0]?.attributes.depth).toBe(0);

    const top: Block = { ...nested, attributes: { depth: 0, ordered: false } };
    const escaped = splitBlock(document(top), 2, 0, allocator);
    expect(escaped.document.blocks).toHaveLength(1);
    expect(escaped.document.blocks[0]?.type).toBe("paragraph");
  });

  it("5: Tab indents a list item, Shift-Tab outdents it, and lists nest", () => {
    const first: Block = {
      key: 1,
      type: "listItem",
      attributes: { depth: 0, ordered: false },
      text: "one",
      marks: [],
    };
    const second: Block = { ...first, key: 2, text: "two" };
    const indented = indentRule(document(first, second), 2, false);
    expect(indented.document.blocks[1]?.attributes.depth).toBe(1);

    // A second Tab cannot indent past the item above it: a level with nothing
    // above it has no meaning a reader can see.
    const again = indentRule(indented.document, 2, false);
    expect(again.changed).toBe(false);

    const outdented = indentRule(indented.document, 2, true);
    expect(outdented.document.blocks[1]?.attributes.depth).toBe(0);
    // Outdenting a top-level item leaves the list entirely.
    expect(liftListItem(outdented.document, 2).document.blocks[1]?.type).toBe("paragraph");
    // The first item has nothing above it, so Tab does nothing.
    expect(sinkListItem(document(first, second), 1).changed).toBe(false);
  });

  it("6: a selected picture is deleted by Delete, because the selection is the block", () => {
    const picture: Block = {
      key: 2,
      type: "image",
      attributes: { src: "cat.png", alt: "cat" },
      text: "",
      marks: [],
    };
    const before = document(paragraph(1, "a"), picture, paragraph(3, "b"));
    const after = removeBlocks(before, [2]);
    expect(after.document.blocks.map((block) => block.key)).toEqual([1, 3]);
    // The picture is an object, so it never held text to delete instead.
    expect(before.blocks[1]?.text).toBe("");
  });

  it("7: the projection gives two adjacent pictures a position between them", () => {
    const picture = (key: number): Block => ({
      key,
      type: "image",
      attributes: { src: "", alt: "" },
      text: "",
      marks: [],
    });
    const editor = new Editor({ document: document(picture(1), picture(2)) });
    const projection = editor.projection();
    expect(projection.blocks.map((block) => block.atomic)).toEqual([true, true]);
    // Both are atomic and zero length, which is what makes the gap between
    // them a real caret position in Core's flat space rather than an offset
    // inside one of them.
    expect(projection.blocks.map((block) => block.lenUtf16)).toEqual([0, 0]);
  });

  it("8: pasted HTML keeps its structure, and the document writes back out", () => {
    const allocator = new BlockKeyAllocator();
    const pasted = fromHtml(
      "<h2>Title</h2><p>Some <strong>bold</strong> text.</p><ul><li>one</li><li>two</li></ul>",
      allocator,
    );
    expect(pasted.blocks.map((block) => block.type)).toEqual([
      "heading",
      "paragraph",
      "listItem",
      "listItem",
    ]);
    expect(pasted.blocks[0]?.attributes.level).toBe(2);
    expect(pasted.blocks[1]?.marks).toEqual([{ mark: "bold", from: 5, to: 9 }]);
    expect(pasted.blocks[2]?.attributes.depth).toBe(0);

    expect(toHtml(pasted)).toBe(
      "<h2>Title</h2><p>Some <strong>bold</strong> text.</p><ul><li>one</li><li>two</li></ul>",
    );
    expect(toMarkdown(pasted)).toBe("## Title\n\nSome **bold** text.\n\n- one\n\n- two");

    // And the same document survives a Markdown round trip.
    const viaMarkdown = fromMarkdown(toMarkdown(pasted), new BlockKeyAllocator());
    expect(viaMarkdown.blocks.map((block) => [block.type, block.text])).toEqual(
      pasted.blocks.map((block) => [block.type, block.text]),
    );
    expect(viaMarkdown.blocks[1]?.marks).toEqual(pasted.blocks[1]?.marks);
  });

  it("8: copying a document selection yields HTML and markdown, and a paste keeps its structure", () => {
    const editor = new Editor({
      document: {
        blocks: [
          { key: 1, type: "heading", attributes: { level: 2 }, text: "Title", marks: [] },
          {
            key: 2,
            type: "paragraph",
            attributes: {},
            text: "some bold text",
            marks: [{ mark: "bold", from: 5, to: 9 }],
          },
        ],
      },
    });
    editor.applyEditStream(
      {
        transactions: [],
        structure: [],
        selections: [
          {
            nodeId: 1,
            selection: {
              kind: "text",
              anchorKey: 1,
              anchorOffset: 0,
              focusKey: 2,
              focusOffset: 14,
            },
          },
        ],
      },
      new Map([[1, 1]]),
    );

    const copied = editor.copySelection();
    expect(copied).toBeDefined();
    // Both flavours: HTML is what another editor reads, markdown is what a
    // plain-text target gets instead of a structure-free paragraph.
    expect(copied?.html).toContain("<h2>");
    expect(copied?.html).toContain("<strong>bold</strong>");
    expect(copied?.markdown).toContain("## Title");
    expect(copied?.markdown).toContain("**bold**");

    // Pasting that back into an empty document rebuilds the heading, the
    // paragraph and the mark, rather than flattening to one line of text.
    const target = new Editor({
      document: {
        blocks: [{ key: 1, type: "paragraph", attributes: {}, text: "", marks: [] }],
      },
    });
    target.applyEditStream(
      {
        transactions: [],
        structure: [],
        selections: [
          {
            nodeId: 1,
            selection: { kind: "text", anchorKey: 1, anchorOffset: 0, focusKey: 1, focusOffset: 0 },
          },
        ],
      },
      new Map([[1, 1]]),
    );
    expect(target.pasteContent({ html: copied?.html ?? "", text: copied?.markdown ?? "" })).toBe(
      true,
    );
    expect(target.document.blocks.map((block) => block.type)).toEqual(["heading", "paragraph"]);
    expect(target.document.blocks[0]?.attributes).toEqual({ level: 2 });
    expect(target.document.blocks[1]?.marks).toEqual([{ mark: "bold", from: 5, to: 9 }]);
  });

  it("9: a formatting rewrite is one undo step separate from the typing before it", () => {
    // Core owns the undo stack; what the Shell owes it is a rewrite expressed
    // as one replacement over an explicit range rather than as more typing.
    const before = document(paragraph(1, "a**bold**"));
    const outcome = applyInlineRule(before, { key: 1, offset: 9 });
    expect(outcome).toBeDefined();
    // The rewrite removed the delimiters and left the text the user meant.
    expect(outcome?.result.document.blocks[0]?.text).toBe("abold");
    // Core's rule is that an explicit Replace never joins a typing burst, and
    // the Shell's part is to issue exactly that: see the Rust test
    // `an_input_rule_replacement_is_its_own_undo_step`.
    expect(outcome?.result.changed).toBe(true);
  });

  it("10: a five-thousand-block document projects without materializing every block", () => {
    const blocks: Block[] = [];
    for (let index = 1; index <= 5000; index += 1) blocks.push(paragraph(index, `line ${index}`));
    const editor = new Editor({ document: { blocks } });
    // Only what is on screen has a node; the rest declare their length.
    for (let index = 1; index <= 40; index += 1) editor.setNode(index, index + 1000);
    const projection = editor.projection();
    expect(projection.blocks).toHaveLength(5000);
    const materialized = projection.blocks.filter((block) => block.nodeId !== 0xffff_ffff);
    expect(materialized).toHaveLength(40);
    // Every block still declares its length, which is what keeps the position
    // space complete over blocks nobody has built.
    expect(projection.blocks.every((block) => block.lenUtf16 > 0)).toBe(true);
    expect(projection.blocks[4999]?.lenUtf16).toBe("line 5000".length);
  });

  it("11: a composition that spans a mark boundary keeps the marks it did not touch", () => {
    // The Shell's share of this is that replacing a range moves the marks
    // around it rather than dropping them; Core owns the composition itself
    // and is tested in `a_composition_recorded_across_a_mark_boundary_...`.
    const before = toggleMark(document(paragraph(1, "abcd")), [{ key: 1, from: 2, to: 4 }], "bold");
    const replaced = replaceText(before.document, 1, 1, 3, "日本");
    expect(replaced.document.blocks[0]?.text).toBe("a日本d");
    // The bold run's tail survived; its head was inside the replaced span.
    expect(replaced.document.blocks[0]?.marks).toEqual([{ mark: "bold", from: 3, to: 4 }]);
  });
});
