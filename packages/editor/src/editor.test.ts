import { describe, expect, it } from "vitest";

import type { EditStream } from "@dopejs/pingo-editing";
import { NULL_NODE_ID } from "@dopejs/pingo-reconciler";

import { BlockKeyAllocator, Editor, fromHtml, normalizeBlock, toHtml } from "./index";
import type { Block, DocumentModel } from "./index";

function paragraph(key: number, text: string): Block {
  return { key, type: "paragraph", attributes: {}, text, marks: [] };
}

function stream(overrides: Partial<EditStream> = {}): EditStream {
  return { transactions: [], structure: [], selections: [], ...overrides };
}

describe("Editor", () => {
  it("answers a split request with what the schema decides, not what Core guessed", () => {
    const editor = new Editor({
      document: {
        blocks: [
          {
            key: 1,
            type: "listItem",
            attributes: { depth: 0, ordered: false },
            text: "",
            marks: [],
          },
        ],
      },
    });
    editor.applyEditStream(
      stream({
        structure: [
          { nodeId: 9, sequence: 1, kind: "split", target: 1, source: 0, offset: 0, keys: [] },
        ],
      }),
      new Map(),
    );
    // Core predicted two list items; the schema says an empty one leaves the
    // list, and the projection it publishes is what corrects Core.
    expect(editor.document.blocks).toHaveLength(1);
    expect(editor.document.blocks[0]?.type).toBe("paragraph");
  });

  it("moves its own anchors with Core's map rather than recomputing the arithmetic", () => {
    const editor = new Editor({ document: { blocks: [paragraph(1, "abcdef")] } });
    editor.setNode(1, 40);
    editor.addAnchor({ key: 1, from: 4, to: 6 });
    editor.applyEditStream(
      stream({
        transactions: [
          {
            nodeId: 40,
            baseRevision: 0n,
            revision: 1n,
            delta: { range: { start: 1, end: 2 }, text: "XYZ" },
            selection: {
              anchor: 4,
              anchorAffinity: "downstream",
              focus: 4,
              focusAffinity: "downstream",
            },
            kind: "edit",
            map: [
              { oldStart: 0, oldEnd: 1, newStart: 0, newEnd: 1, kept: true },
              { oldStart: 1, oldEnd: 2, newStart: 1, newEnd: 4, kept: false },
              { oldStart: 2, oldEnd: 6, newStart: 4, newEnd: 8, kept: true },
            ],
          },
        ],
      }),
      new Map([[40, 1]]),
    );
    expect(editor.document.blocks[0]?.text).toBe("aXYZcdef");
    // The anchor moved by two, exactly what the map says, without the editor
    // knowing what the edit was.
    expect(editor.anchors).toEqual([{ key: 1, from: 6, to: 8 }]);
  });

  it("publishes a projection whose unmaterialized blocks still declare a length", () => {
    const editor = new Editor({
      document: { blocks: [paragraph(1, "one"), paragraph(2, "two")] },
    });
    editor.setNode(2, 77);
    const projection = editor.projection();
    expect(projection.blocks).toEqual([
      { key: 1, nodeId: NULL_NODE_ID, lenUtf16: 3, atomic: false },
      { key: 2, nodeId: 77, lenUtf16: 3, atomic: false },
    ]);
    // Every change advances the revision, which is how Core knows to reproject.
    const before = editor.projection().revision;
    editor.toggleMark([{ key: 1, from: 0, to: 3 }], "bold");
    expect(editor.projection().revision).toBeGreaterThan(before);
  });

  it("keeps the mutation it hands the reconciler in step with its projection", () => {
    const editor = new Editor({ document: { blocks: [paragraph(1, "x")] } });
    const mutation = editor.configureMutation(12);
    expect(mutation).toEqual({
      type: "configureDocument",
      nodeId: 12,
      revision: editor.projection().revision,
      flags: 0,
      blocks: editor.projection().blocks,
    });
  });
});

describe("schema normalization", () => {
  it("clips marks to the text and merges the ones that touch", () => {
    const block = normalizeBlock({
      key: 1,
      type: "paragraph",
      attributes: {},
      text: "abcd",
      marks: [
        { mark: "bold", from: 0, to: 2 },
        { mark: "bold", from: 2, to: 3 },
        { mark: "bold", from: 3, to: 99 },
        { mark: "italic", from: 4, to: 4 },
      ],
    });
    // Three touching bold ranges are one bold range, or toggling bold off
    // would leave a seam the user cannot remove.
    expect(block.marks).toEqual([{ mark: "bold", from: 0, to: 4 }]);
  });

  it("refuses marks a block type does not accept and clamps its attributes", () => {
    const code = normalizeBlock({
      key: 1,
      type: "codeBlock",
      attributes: {},
      text: "let x = 1",
      marks: [{ mark: "bold", from: 0, to: 3 }],
    });
    expect(code.marks).toEqual([]);
    expect(code.attributes).toEqual({ language: "" });

    const heading = normalizeBlock({
      key: 2,
      type: "heading",
      attributes: { level: 99 },
      text: "t",
      marks: [],
    });
    expect(heading.attributes.level).toBe(6);

    // An object block has no text, whatever it was handed.
    const image = normalizeBlock({
      key: 3,
      type: "image",
      attributes: { src: "a.png" },
      text: "ignored",
      marks: [],
    });
    expect(image.text).toBe("");
  });
});

describe("paste normalization", () => {
  it("flattens what the schema does not know instead of dropping it", () => {
    const pasted = fromHtml(
      "<article><p>kept <span class=x>plain</span></p><table><tr><td>cell</td></tr></table></article>",
      new BlockKeyAllocator(),
    );
    // An unknown container contributes its text rather than vanishing.
    expect(pasted.blocks.map((block) => block.text).join(" ")).toContain("kept plain");
    expect(pasted.blocks.map((block) => block.text).join(" ")).toContain("cell");
  });

  it("round-trips nested lists and links through HTML", () => {
    const source =
      '<ul><li>one</li><li>two</li></ul><p>see <a href="https://example.com">this</a></p>';
    const model: DocumentModel = fromHtml(source, new BlockKeyAllocator());
    expect(toHtml(model)).toBe(source);
    expect(model.blocks[2]?.marks).toEqual([
      { mark: "link", from: 4, to: 8, href: "https://example.com" },
    ]);
  });

  it("escapes text that would otherwise re-enter as markup", () => {
    const model: DocumentModel = { blocks: [paragraph(1, '<script>&"')] };
    const html = toHtml(model);
    expect(html).toBe("<p>&lt;script&gt;&amp;&quot;</p>");
    expect(fromHtml(html, new BlockKeyAllocator()).blocks[0]?.text).toBe('<script>&"');
  });

  it("turns a block prefix into its block type and reports where the caret lands", () => {
    const editor = new Editor({
      document: {
        blocks: [{ key: 1, type: "paragraph", attributes: {}, text: "# ", marks: [] }],
      },
    });
    const before = editor.projection().revision;

    // The caret sits after the prefix, which is what a rule matches on.
    const moved = editor.runInputRules(1, 2);

    expect(editor.document.blocks[0]?.type).toBe("heading");
    expect(editor.document.blocks[0]?.attributes).toEqual({ level: 1 });
    // The prefix is consumed, so the caret comes back at the start of what is
    // now the heading's text rather than where the two characters used to be.
    expect(editor.document.blocks[0]?.text).toBe("");
    expect(moved).toBe(0);
    // A new revision is what makes the Core reproject and pick the rewrite up.
    expect(editor.projection().revision).toBeGreaterThan(before);
  });

  it("leaves a caret that matches no rule exactly where it was", () => {
    const editor = new Editor({
      document: {
        blocks: [{ key: 1, type: "paragraph", attributes: {}, text: "plain text", marks: [] }],
      },
    });
    const before = editor.projection().revision;

    expect(editor.runInputRules(1, 5)).toBe(5);
    expect(editor.document.blocks[0]?.type).toBe("paragraph");
    // No change means no revision bump, so an unmatched keystroke does not make
    // the Core reproject the whole document.
    expect(editor.projection().revision).toBe(before);
  });
});
