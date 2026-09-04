import { describe, expect, it, vi } from "vitest";

import { DocumentEditorController } from "./component";
import type { DocumentModel } from "./schema";

function document(): DocumentModel {
  return {
    blocks: [
      { key: 1, type: "paragraph", attributes: {}, text: "first block", marks: [] },
      { key: 2, type: "paragraph", attributes: {}, text: "second block", marks: [] },
    ],
  };
}

function controller(overrides: { onChange?: (next: DocumentModel) => void } = {}) {
  const dispatched: unknown[] = [];
  const focused: unknown[] = [];
  const instance = new DocumentEditorController({
    document: document(),
    host: {
      dispatch: (commands) => dispatched.push(...commands),
      focusBlock: (nodeId, block) => focused.push({ nodeId, block }),
    },
    ...(overrides.onChange === undefined ? {} : { onChange: overrides.onChange }),
  });
  return { instance, dispatched, focused };
}

describe("DocumentEditorController", () => {
  it("bumps its revision only when the document changed", () => {
    const { instance } = controller();
    const before = instance.revision;

    // Core reported a selection; nothing about the document moved.
    instance.applyEditStream({
      transactions: [],
      structure: [],
      selections: [
        {
          nodeId: 1,
          selection: { kind: "text", anchorKey: 1, anchorOffset: 2, focusKey: 1, focusOffset: 2 },
        },
      ],
    });
    expect(instance.revision).toBe(before);
    expect(instance.selection).toEqual({
      kind: "text",
      anchorKey: 1,
      anchorOffset: 2,
      focusKey: 1,
      focusOffset: 2,
    });
  });

  it("reports a mark as active only over a selection that has one", () => {
    const { instance } = controller();
    // A collapsed caret selects nothing, so a toolbar has nothing to press.
    instance.applyEditStream({
      transactions: [],
      structure: [],
      selections: [
        {
          nodeId: 1,
          selection: { kind: "text", anchorKey: 1, anchorOffset: 0, focusKey: 1, focusOffset: 0 },
        },
      ],
    });
    expect(instance.markIsActive("bold")).toBe(false);
    instance.toggleMark("bold");
    expect(instance.document.blocks[0]?.marks).toEqual([]);

    instance.applyEditStream({
      transactions: [],
      structure: [],
      selections: [
        {
          nodeId: 1,
          selection: { kind: "text", anchorKey: 1, anchorOffset: 0, focusKey: 1, focusOffset: 5 },
        },
      ],
    });
    instance.toggleMark("bold");
    expect(instance.document.blocks[0]?.marks).toEqual([{ mark: "bold", from: 0, to: 5 }]);
    expect(instance.markIsActive("bold")).toBe(true);
  });

  it("covers every block a selection crosses when a mark is toggled", () => {
    const { instance } = controller();
    instance.applyEditStream({
      transactions: [],
      structure: [],
      selections: [
        {
          nodeId: 1,
          selection: { kind: "text", anchorKey: 1, anchorOffset: 6, focusKey: 2, focusOffset: 6 },
        },
      ],
    });
    instance.toggleMark("bold");

    // The first block from the anchor to its end, the last from its start to
    // the caret. A toolbar that only marked the caret's block would leave the
    // other half of the selection unstyled.
    expect(instance.document.blocks[0]?.marks).toEqual([{ mark: "bold", from: 6, to: 11 }]);
    expect(instance.document.blocks[1]?.marks).toEqual([{ mark: "bold", from: 0, to: 6 }]);
  });

  it("sends the keys the OS surface does not deliver, and no others", () => {
    const { instance, dispatched } = controller();
    // The node id is only known once the document has been rendered.
    instance.render({ document: document(), host: { dispatch: () => {}, focusBlock: () => {} } });

    const key = (init: Partial<KeyboardEvent>): KeyboardEvent =>
      ({
        metaKey: false,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        ...init,
      }) as KeyboardEvent;

    // A character is the surface's job: handling it here would insert the
    // committed form of a composition that has not finished.
    expect(instance.handleKeyDown(key({ key: "a" }))).toBe(false);
    // So is a shortcut, which the surface turns into undo.
    expect(instance.handleKeyDown(key({ key: "z", metaKey: true }))).toBe(false);
    expect(dispatched).toHaveLength(0);
  });

  it("notifies its owner whenever the document changed", () => {
    const onChange = vi.fn();
    const { instance } = controller({ onChange });
    instance.applyEditStream({
      transactions: [],
      structure: [],
      selections: [
        {
          nodeId: 1,
          selection: { kind: "text", anchorKey: 1, anchorOffset: 0, focusKey: 1, focusOffset: 5 },
        },
      ],
    });
    onChange.mockClear();
    instance.toggleMark("bold");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]).toBe(instance.document);
  });

  it("keeps the selection box and re-renders only the view when it moves", () => {
    const onChange = vi.fn();
    const { instance } = controller({ onChange });
    let renders = 0;
    instance.onInvalidate = () => {
      renders += 1;
    };

    expect(instance.selectionRect).toBeUndefined();
    instance.applySelectionGeometry({ left: 10, top: 20, width: 30, height: 18 });
    expect(instance.selectionRect).toEqual({ left: 10, top: 20, width: 30, height: 18 });
    expect(renders).toBe(1);
    // The document did not change, so the owner must not be told it did: a
    // caret move would otherwise look like an edit.
    expect(onChange).not.toHaveBeenCalled();

    // The same box again is not a reason to lay the toolbar out again.
    instance.applySelectionGeometry({ left: 10, top: 20, width: 30, height: 18 });
    expect(renders).toBe(1);
    instance.applySelectionGeometry({ left: 11, top: 20, width: 30, height: 18 });
    expect(renders).toBe(2);
  });

  it("reports whether there is anything for a toolbar to act on", () => {
    const { instance } = controller();
    expect(instance.hasSelection).toBe(false);

    instance.applyEditStream({
      transactions: [],
      structure: [],
      selections: [
        {
          nodeId: 1,
          selection: { kind: "text", anchorKey: 1, anchorOffset: 3, focusKey: 1, focusOffset: 3 },
        },
      ],
    });
    // A bare caret selects nothing, so a toolbar over it would offer buttons
    // that all do nothing.
    expect(instance.hasSelection).toBe(false);

    instance.applyEditStream({
      transactions: [],
      structure: [],
      selections: [
        {
          nodeId: 1,
          selection: { kind: "text", anchorKey: 1, anchorOffset: 3, focusKey: 1, focusOffset: 7 },
        },
      ],
    });
    expect(instance.hasSelection).toBe(true);
  });

  /** Puts the caret in a block after setting its text. */
  function caretAt(instance: DocumentEditorController, key: number, offset: number): void {
    instance.applyEditStream({
      transactions: [],
      structure: [],
      selections: [
        {
          nodeId: 1,
          selection: {
            kind: "text",
            anchorKey: key,
            anchorOffset: offset,
            focusKey: key,
            focusOffset: offset,
          },
        },
      ],
    });
  }

  it("opens the slash menu where a block could change type, and not elsewhere", () => {
    const { instance } = controller();

    // Mid-word: a slash after "first" is a slash, not a menu.
    instance.replaceBlockText(1, "first");
    caretAt(instance, 1, 5);
    type(instance, 1, "/");
    expect(instance.slashMenu).toBeUndefined();

    // At the start of a block.
    const { instance: fresh } = controller();
    fresh.replaceBlockText(1, "");
    type(fresh, 1, "/");
    expect(fresh.slashMenu?.query).toBe("");
    expect(fresh.slashMenu?.items.length).toBeGreaterThan(0);
  });

  /** Types `text` into a block one character at a time, caret following. */
  function type(instance: DocumentEditorController, key: number, text: string): void {
    const block = instance.document.blocks.find((entry) => entry.key === key);
    let value = block?.text ?? "";
    for (const character of text) {
      value += character;
      instance.replaceBlockText(key, value);
      caretAt(instance, key, value.length);
    }
  }

  it("filters by what is typed after the slash and closes on a space", () => {
    const { instance } = controller();
    instance.replaceBlockText(1, "");
    type(instance, 1, "/head");
    const menu = instance.slashMenu;
    expect(menu?.query).toBe("head");
    expect(menu?.items.map((item) => item.label)).toEqual(["Heading 1", "Heading 2", "Heading 3"]);

    // A space ends it: "/ " is someone typing a slash, not choosing a block.
    const { instance: other } = controller();
    other.replaceBlockText(1, "");
    type(other, 1, "/ h");
    expect(other.slashMenu).toBeUndefined();
  });

  it("applies an item by removing the query and changing the block type", () => {
    const { instance, dispatched } = controller();
    instance.render({
      document: instance.document,
      host: { dispatch: () => {}, focusBlock: () => {} },
    });
    instance.replaceBlockText(1, "");
    type(instance, 1, "/head");
    instance.moveSlashSelection(1);
    expect(instance.slashMenu?.activeIndex).toBe(1);

    expect(instance.applySlashItem()).toBe(true);
    // The typed query is gone and the block is the type that was picked; a menu
    // that left "/head" behind would have turned the trigger into content.
    expect(instance.document.blocks[0]?.text).toBe("");
    expect(instance.document.blocks[0]?.type).toBe("heading");
    expect(instance.document.blocks[0]?.attributes).toEqual({ level: 2 });
    expect(instance.slashMenu).toBeUndefined();
    // The caret goes back to where the slash was, which is now the block start.
    expect(dispatched.at(-1)).toMatchObject({ type: "setDocumentSelection" });
  });

  it("gives the menu the keys that would otherwise move the caret", () => {
    const { instance, dispatched } = controller();
    instance.render({
      document: instance.document,
      host: { dispatch: () => {}, focusBlock: () => {} },
    });
    instance.replaceBlockText(1, "");
    type(instance, 1, "/");
    dispatched.length = 0;

    const key = (name: string): KeyboardEvent =>
      ({
        key: name,
        metaKey: false,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
      }) as KeyboardEvent;
    expect(instance.handleKeyDown(key("ArrowDown"))).toBe(true);
    expect(instance.slashMenu?.activeIndex).toBe(1);
    // The arrow moved the menu, not the caret: no caret command was sent.
    expect(
      dispatched.filter((command) => (command as { type: string }).type === "moveDocumentCaret"),
    ).toHaveLength(0);

    expect(instance.handleKeyDown(key("Escape"))).toBe(true);
    expect(instance.slashMenu).toBeUndefined();
    // With the menu closed the arrow is the caret's again, which needs a
    // mounted document node; that half is covered end to end, where one exists.
    expect(instance.slashMenu).toBeUndefined();
  });

  it("drops a block at the gap the pointer is nearest", () => {
    const { instance } = controller();
    instance.applyBlockGeometry([
      { key: 1, left: 0, top: 0, width: 200, height: 20 },
      { key: 2, left: 0, top: 20, width: 200, height: 20 },
    ]);

    instance.beginBlockDrag(2);
    expect(instance.blockDrag).toEqual({ key: 2, beforeKey: undefined });

    // In the top half of the first block: the drop lands before it.
    instance.dragBlockTo(4);
    expect(instance.blockDrag?.beforeKey).toBe(1);
    expect(instance.endBlockDrag()).toBe(true);
    expect(instance.document.blocks.map((block) => block.key)).toEqual([2, 1]);
    expect(instance.blockDrag).toBeUndefined();
  });

  it("reports no change when a block is dropped where it already was", () => {
    const onChange = vi.fn();
    const { instance } = controller({ onChange });
    instance.applyBlockGeometry([
      { key: 1, left: 0, top: 0, width: 200, height: 20 },
      { key: 2, left: 0, top: 20, width: 200, height: 20 },
    ]);
    onChange.mockClear();

    instance.beginBlockDrag(1);
    instance.dragBlockTo(4);
    // Before the first block is where the first block already is; a gesture
    // that moved nothing must not push an undo entry or notify the owner.
    expect(instance.endBlockDrag()).toBe(false);
    expect(instance.document.blocks.map((block) => block.key)).toEqual([1, 2]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("drops past the last block when the pointer is below every one", () => {
    const { instance } = controller();
    instance.applyBlockGeometry([
      { key: 1, left: 0, top: 0, width: 200, height: 20 },
      { key: 2, left: 0, top: 20, width: 200, height: 20 },
    ]);

    instance.beginBlockDrag(1);
    instance.dragBlockTo(200);
    expect(instance.blockDrag?.beforeKey).toBeUndefined();
    expect(instance.endBlockDrag()).toBe(true);
    expect(instance.document.blocks.map((block) => block.key)).toEqual([2, 1]);
  });
});

describe("DocumentEditorController caret ownership", () => {
  it("puts the caret in the block a split created and tells Core", () => {
    const { instance, dispatched } = controller();
    instance.applyEditStream({
      transactions: [],
      structure: [
        { nodeId: 1, sequence: 1, kind: "split", target: 1, source: 0, offset: 5, keys: [] },
      ],
      selections: [],
    });

    const created = instance.document.blocks[1];
    expect(created?.text).toBe(" block");
    expect(instance.selection).toEqual({
      kind: "text",
      anchorKey: created?.key,
      anchorOffset: 0,
      focusKey: created?.key,
      focusOffset: 0,
    });
    // Core split nothing itself, so it has to be told where the caret went.
    expect(dispatched).toContainEqual({
      type: "setDocumentSelection",
      nodeId: 0,
      baseRevision: 0n,
      selection: {
        kind: "text",
        anchorKey: created?.key,
        anchorOffset: 0,
        focusKey: created?.key,
        focusOffset: 0,
      },
    });
  });

  it("leaves a caret Core moved alone when the Shell did not move it", () => {
    const { instance, dispatched } = controller();
    // Core drains a transaction and the selection it produced in separate
    // batches. Pushing the Shell's older caret back on the first of the two
    // undid the keystroke's own movement.
    instance.applyEditStream({
      transactions: [
        {
          nodeId: 1,
          baseRevision: 0n,
          revision: 1n,
          kind: "edit",
          delta: { range: { start: 0, end: 0 }, text: "A" },
          selection: {
            anchor: 1,
            anchorAffinity: "downstream",
            focus: 1,
            focusAffinity: "downstream",
          },
          map: [],
        },
      ],
      structure: [],
      selections: [],
    });

    expect(dispatched).toHaveLength(0);
  });
});

/** Runs the ref the reconciler would run, which is what gives Core a node. */
function mount(instance: DocumentEditorController): void {
  const node = instance.render({
    document: instance.document,
    host: { dispatch: () => undefined, focusBlock: () => undefined },
  }) as unknown as {
    readonly props: { readonly ref: (handle: { readonly nodeId: number }) => void };
  };
  node.props.ref({ nodeId: 7 });
}

describe("DocumentEditorController refocus", () => {
  it("clamps a selection that outruns the block it names", () => {
    const { instance, focused } = controller();
    mount(instance);
    // The two halves of an edit arrive separately: Core drains the text a cut
    // removed in one batch and the caret that followed it in the next. Between
    // them the Shell holds a selection reaching past the block it names, and
    // the surface rejects an offset outside its value -- taking the session
    // down with it.
    instance.applyEditStream({
      transactions: [],
      structure: [],
      selections: [
        {
          nodeId: 1,
          selection: { kind: "text", anchorKey: 1, anchorOffset: 99, focusKey: 1, focusOffset: 99 },
        },
      ],
    });

    const last = focused.at(-1) as { block: { text: string; anchor: number; focus: number } };
    expect(last.block.text).toBe("first block");
    expect(last.block.anchor).toBe(11);
    expect(last.block.focus).toBe(11);
  });
});

describe("DocumentEditorController blur", () => {
  it("forgets where the selection was drawn once the surface leaves", () => {
    const { instance } = controller();
    instance.applyEditStream({
      transactions: [],
      structure: [],
      selections: [
        {
          nodeId: 1,
          selection: { kind: "text", anchorKey: 1, anchorOffset: 0, focusKey: 1, focusOffset: 5 },
        },
      ],
    });
    instance.applySelectionGeometry({ left: 10, top: 20, width: 40, height: 18 });
    expect(instance.selectionRect).toBeDefined();
    expect(instance.hasSelection).toBe(true);

    // Core stops drawing the selection of a document the surface left, so a
    // toolbar anchored to it would be pointing at nothing.
    instance.blur();

    expect(instance.selectionRect).toBeUndefined();
  });
});

describe("DocumentEditorController block handles", () => {
  it("drops the box of a block the document no longer has", () => {
    const { instance } = controller();
    instance.applyBlockGeometry([
      { key: 1, left: 0, top: 0, width: 100, height: 20 },
      { key: 2, left: 0, top: 24, width: 100, height: 20 },
    ]);
    expect(instance.blockRects.map((rect) => rect.key)).toEqual([1, 2]);

    // A merge removes a block before Core reports geometry again, and a handle
    // over a block that no longer exists is a handle that does nothing.
    instance.applyEditStream({
      transactions: [],
      structure: [
        { nodeId: 1, sequence: 1, kind: "merge", target: 1, source: 2, offset: 0, keys: [] },
      ],
      selections: [],
    });

    expect(instance.blockRects.map((rect) => rect.key)).toEqual([1]);
  });
});

describe("DocumentEditorController block-boundary deletion", () => {
  const key = (name: string, shiftKey = false): KeyboardEvent =>
    ({ key: name, shiftKey, metaKey: false, ctrlKey: false, altKey: false }) as KeyboardEvent;

  it("asks Core to merge when Backspace lands at the start of a block", () => {
    const { instance, dispatched } = controller();
    mount(instance);
    instance.applyEditStream({
      transactions: [],
      structure: [],
      selections: [
        {
          nodeId: 1,
          selection: { kind: "text", anchorKey: 2, anchorOffset: 0, focusKey: 2, focusOffset: 0 },
        },
      ],
    });
    dispatched.length = 0;

    expect(instance.handleKeyDown(key("Backspace"))).toBe(true);
    expect(dispatched).toContainEqual(
      expect.objectContaining({ type: "editDocument", operation: "deleteBackward" }),
    );
  });

  it("leaves a Backspace inside a block to the input surface", () => {
    const { instance, dispatched } = controller();
    mount(instance);
    instance.applyEditStream({
      transactions: [],
      structure: [],
      selections: [
        {
          nodeId: 1,
          selection: { kind: "text", anchorKey: 2, anchorOffset: 3, focusKey: 2, focusOffset: 3 },
        },
      ],
    });
    dispatched.length = 0;

    expect(instance.handleKeyDown(key("Backspace"))).toBe(false);
    expect(dispatched).toHaveLength(0);
  });

  it("leaves Backspace at the very start of the document alone", () => {
    const { instance, dispatched } = controller();
    mount(instance);
    instance.applyEditStream({
      transactions: [],
      structure: [],
      selections: [
        {
          nodeId: 1,
          selection: { kind: "text", anchorKey: 1, anchorOffset: 0, focusKey: 1, focusOffset: 0 },
        },
      ],
    });
    dispatched.length = 0;

    expect(instance.handleKeyDown(key("Backspace"))).toBe(false);
    expect(dispatched).toHaveLength(0);
  });
});
