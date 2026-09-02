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
});
