import interBoldUrl from "@fontsource/inter/files/inter-latin-700-normal.woff2?url";
import interRegularUrl from "@fontsource/inter/files/inter-latin-400-normal.woff2?url";
import { loadFont, type PingoFont, type TextRunProps } from "@dopejs/pingo";
import {
  DocumentEditorController,
  toMarkdown,
  type Block,
  type DocumentModel,
  type MarkName,
} from "@dopejs/pingo/editor";

import wasmManifest from "../../../../../packages/host/wasm/manifest.json";
import type { Demo, DemoContext } from "../demo";

/** Marks the toolbar offers, in button order. */
const OFFERED: readonly MarkName[] = ["bold", "code", "link", "strike"];

/**
 * The two faces the document draws with.
 *
 * A run table only reaches the Core when the node has a font to shape with:
 * without one the value goes through the host's system-font fallback, which
 * paints the whole node in one style and never reads the table. Bold needs a
 * second face for the same reason -- a weight is a different set of outlines,
 * not a number the shaper can interpolate.
 *
 * Inter, SIL OFL 1.1, Latin subset: about 24 KB per face. That is also why the
 * sample text is English -- a CJK face is several megabytes, which is not
 * something a demo page should download.
 */
let faces: { readonly regular: PingoFont; readonly bold: PingoFont } | undefined;

async function loadFaces(): Promise<void> {
  faces ??= {
    regular: await loadFont(interRegularUrl, { fallbackFamily: "Inter" }),
    bold: await loadFont(interBoldUrl, { fallbackFamily: "Inter" }),
  };
}

const INITIAL: DocumentModel = {
  blocks: [
    {
      key: 1,
      type: "heading",
      attributes: { level: 2 },
      text: "Type in this document",
      marks: [],
    },
    {
      key: 2,
      type: "paragraph",
      attributes: {},
      text: "The caret, the selection, composition and undo live in the engine core, over one flat position space across every block. Arrow keys cross a block boundary without the shell being asked.",
      marks: [{ mark: "bold", from: 0, to: 9 }],
    },
    {
      key: 3,
      type: "paragraph",
      attributes: {},
      text: "Select a phrase and the toolbar above lights up. Everything below the canvas is the same document, serialized.",
      marks: [],
    },
  ],
};

/**
 * The mounted editor.
 *
 * A module-level instance because the playground renders a demo before it
 * activates one, and `render` needs something to draw.
 */
let editor = create();

function create(): DocumentEditorController {
  return new DocumentEditorController({
    document: INITIAL,
    host: { dispatch: () => {}, focusBlock: () => {} },
  });
}

/** How each mark paints, as differences from the block's own style. */
function markStyles(
  bold: PingoFont,
): Partial<Record<MarkName, Omit<TextRunProps, "start" | "end">>> {
  return {
    bold: { font: bold },
    code: { fontFamily: "ui-monospace, monospace", color: "#b02a37" },
    // A run carries no font style yet, so drawing italic as something else
    // would be showing a mark the engine did not apply.
    link: { color: "#1a6fd4" },
    strike: { color: "#8a94a3" },
  };
}

function scene(context: DemoContext) {
  const loaded = faces;
  if (loaded === undefined) {
    return editor.render({
      document: editor.document,
      host: { dispatch: () => {}, focusBlock: () => {} },
      width: context.width,
    });
  }
  return editor.render({
    document: editor.document,
    host: { dispatch: () => {}, focusBlock: () => {} },
    width: context.width,
    marks: markStyles(loaded.bold),
    blockStyle: (block: Block) => {
      const heading = block.type === "heading";
      return {
        font: heading ? loaded.bold : loaded.regular,
        fontSize: heading ? 20 : 14,
        lineHeight: heading ? 30 : 24,
        color: "#1f2329ff",
      };
    },
  });
}

export const richTextDemo: Demo = {
  id: "rich-text",
  title: (messages) => messages.richTextTitle,
  description: (messages) => messages.richTextDescription,
  // The engine owns the clipboard event; what a document selection means as
  // HTML or markdown is the Shell's, because only it has the schema.
  rootOptions: {
    onDocumentCopy: () => editor.copySelection(),
    onDocumentPaste: (content) => editor.pasteContent(content),
  },
  render: scene,
  activate: (context) => {
    const canvas = context.canvas;
    editor = new DocumentEditorController({
      document: INITIAL,
      host: {
        // The host stamps the sequence: it writes to the same input stream for
        // focus and events, so numbering batches here would interleave with
        // those and be refused.
        dispatch: (commands) => context.root.sendInput(commands),
        focusBlock: (nodeId, block) => context.root.focusDocument(nodeId, block),
      },
    });

    const panel = document.createElement("div");
    panel.style.display = "grid";
    panel.style.gap = "8px";
    const hint = document.createElement("p");
    hint.style.margin = "0";
    // The document subsystem is compiled in by profile. Without it every
    // keystroke fails inside Core with a generic editing error, which reads as
    // the editor being broken rather than absent.
    hint.textContent = wasmManifest.richText
      ? context.messages.richTextHint
      : context.messages.richTextUnavailable;

    // The toolbar floats over the canvas rather than sitting in the panel: it
    // anchors to where the Core drew the selection, which is the only side that
    // knows where a range of characters ended up.
    const markRow = document.createElement("div");
    markRow.style.position = "absolute";
    markRow.style.display = "flex";
    markRow.style.gap = "4px";
    markRow.style.padding = "4px";
    markRow.style.borderRadius = "6px";
    markRow.style.background = "#1f2329";
    markRow.style.boxShadow = "0 2px 8px rgba(0,0,0,.25)";
    markRow.style.visibility = "hidden";
    markRow.style.pointerEvents = "auto";
    markRow.style.zIndex = "2";
    const stage = canvas.parentElement ?? canvas;
    if (stage instanceof HTMLElement && getComputedStyle(stage).position === "static") {
      stage.style.position = "relative";
    }
    stage.append(markRow);

    // The slash menu, anchored to the caret the same way.
    const slashBox = document.createElement("div");
    slashBox.style.position = "absolute";
    slashBox.style.display = "grid";
    slashBox.style.minWidth = "160px";
    slashBox.style.padding = "4px";
    slashBox.style.borderRadius = "6px";
    slashBox.style.background = "#ffffff";
    slashBox.style.border = "1px solid #d7dbe0";
    slashBox.style.boxShadow = "0 4px 12px rgba(0,0,0,.15)";
    slashBox.style.visibility = "hidden";
    slashBox.style.zIndex = "3";
    stage.append(slashBox);

    // One drag handle per block, in the gutter, and a line showing where a drop
    // would land. Both are positioned from the block boxes the engine reports.
    const handleLayer = document.createElement("div");
    handleLayer.style.position = "absolute";
    handleLayer.style.inset = "0";
    handleLayer.style.pointerEvents = "none";
    handleLayer.style.zIndex = "1";
    const dropLine = document.createElement("div");
    dropLine.style.position = "absolute";
    dropLine.style.height = "2px";
    dropLine.style.background = "#3d63dd";
    dropLine.style.visibility = "hidden";
    handleLayer.append(dropLine);
    stage.append(handleLayer);

    const stageTop = (): number => {
      const box = canvas.getBoundingClientRect();
      const outer = stage.getBoundingClientRect();
      return box.top - outer.top;
    };
    const source = document.createElement("pre");
    source.style.margin = "0";
    source.style.whiteSpace = "pre-wrap";
    source.style.fontSize = "12px";
    source.style.lineHeight = "1.5";
    panel.append(hint, source);
    context.controls.append(panel);

    const buttons = new Map<MarkName, HTMLButtonElement>();
    for (const mark of OFFERED) {
      const element = document.createElement("button");
      element.type = "button";
      element.textContent = context.messages.markLabel(mark);
      element.style.border = "0";
      element.style.borderRadius = "4px";
      element.style.padding = "2px 8px";
      element.style.background = "transparent";
      element.style.color = "#ffffff";
      element.style.cursor = "pointer";
      // The press must not take focus off the canvas: the OS input surface
      // lives there, and losing it mid-selection ends the editing session.
      // Both events, because the engine ends the session on the pointer event
      // and the browser moves focus on the mouse one.
      for (const kind of ["pointerdown", "mousedown"]) {
        element.addEventListener(kind, (event) => {
          event.preventDefault();
        });
      }
      element.addEventListener("click", () => editor.toggleMark(mark));
      buttons.set(mark, element);
      markRow.append(element);
    }

    const refresh = (): void => {
      // Shown only over a selection that has something to mark: a toolbar over
      // a bare caret offers four buttons that would all do nothing.
      const rect = editor.selectionRect;
      const visible = editor.hasSelection && rect !== undefined && rect.width > 0;
      markRow.style.visibility = visible ? "visible" : "hidden";
      if (visible && rect !== undefined) {
        const height = markRow.offsetHeight || 28;
        markRow.style.left = `${String(Math.max(0, rect.left + rect.width / 2 - markRow.offsetWidth / 2))}px`;
        // Above the selection, or below it when there is no room above.
        const above = rect.top - height - 6;
        markRow.style.top = `${String(above >= 0 ? above : rect.top + rect.height + 6)}px`;
      }
      for (const [mark, element] of buttons) {
        const on = editor.markIsActive(mark);
        element.setAttribute("aria-pressed", on ? "true" : "false");
        element.style.background = on ? "#3d63dd" : "transparent";
      }
      const selection = editor.selection;
      context.setMetric(
        context.messages.selectedSpan,
        selection?.kind === "text"
          ? `${String(selection.anchorOffset)}–${String(selection.focusOffset)}`
          : "—",
      );
      context.setMetric(
        context.messages.markRanges,
        String(editor.document.blocks.reduce((total, block) => total + block.marks.length, 0)),
      );
      // Handles: one per block, only while nothing is being dragged elsewhere.
      const rects = editor.blockRects;
      const drag = editor.blockDrag;
      // Not while a drag is running: rebuilding the handles destroys the one
      // that captured the pointer, and every later move and release goes
      // nowhere.
      if (drag === undefined) handleLayer.replaceChildren(dropLine);
      for (const rect of drag === undefined ? rects : []) {
        const handle = document.createElement("button");
        handle.type = "button";
        handle.textContent = "⋮⋮";
        handle.setAttribute("aria-label", `Move block ${String(rect.key)}`);
        handle.style.position = "absolute";
        handle.style.left = `${String(Math.max(0, rect.left - 18))}px`;
        handle.style.top = `${String(stageTop() + rect.top)}px`;
        handle.style.height = `${String(Math.min(rect.height, 20))}px`;
        handle.style.border = "0";
        handle.style.padding = "0 2px";
        handle.style.background = "transparent";
        handle.style.color = "#8a94a3";
        handle.style.cursor = "grab";
        handle.style.pointerEvents = "auto";
        handle.addEventListener("pointerdown", (event) => {
          // The drag is declared before the pointer is captured: declaring it
          // is what stops the handle layer being rebuilt, and capturing on an
          // element a rebuild has already replaced throws.
          event.preventDefault();
          editor.beginBlockDrag(rect.key);
          handle.setPointerCapture(event.pointerId);
        });
        handle.addEventListener("pointermove", (event) => {
          if (editor.blockDrag === undefined) return;
          editor.dragBlockTo(event.clientY - stage.getBoundingClientRect().top - stageTop());
        });
        handle.addEventListener("pointerup", () => editor.endBlockDrag());
        handle.addEventListener("pointercancel", () => editor.endBlockDrag());
        handleLayer.append(handle);
      }
      if (drag === undefined) {
        dropLine.style.visibility = "hidden";
      } else {
        const target = rects.find((entry) => entry.key === drag.beforeKey);
        const last = rects.at(-1);
        const y = target?.top ?? (last === undefined ? 0 : last.top + last.height);
        dropLine.style.visibility = "visible";
        dropLine.style.left = `${String(target?.left ?? last?.left ?? 0)}px`;
        dropLine.style.width = `${String(target?.width ?? last?.width ?? 0)}px`;
        dropLine.style.top = `${String(stageTop() + y - 1)}px`;
      }

      const menu = editor.slashMenu;
      const caretRect = editor.selectionRect;
      if (menu === undefined || caretRect === undefined || menu.items.length === 0) {
        slashBox.style.visibility = "hidden";
        slashBox.replaceChildren();
      } else {
        slashBox.style.visibility = "visible";
        slashBox.style.left = `${String(caretRect.left)}px`;
        slashBox.style.top = `${String(caretRect.top + caretRect.height + 4)}px`;
        slashBox.replaceChildren(
          ...menu.items.map((item, index) => {
            const row = document.createElement("button");
            row.type = "button";
            row.textContent = item.label;
            row.style.border = "0";
            row.style.borderRadius = "4px";
            row.style.padding = "4px 8px";
            row.style.textAlign = "left";
            row.style.cursor = "pointer";
            row.style.background = index === menu.activeIndex ? "#eef2ff" : "transparent";
            for (const kind of ["pointerdown", "mousedown"]) {
              row.addEventListener(kind, (event) => {
                event.preventDefault();
              });
            }
            row.addEventListener("click", () => editor.applySlashItem(index));
            return row;
          }),
        );
      }
      // Markdown from the same document the canvas draws, so what the page
      // shows and what a copy would carry cannot drift apart.
      source.textContent = toMarkdown(editor.document);
      context.root.render(scene(context));
    };
    editor.onInvalidate = refresh;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (editor.handleKeyDown(event)) event.preventDefault();
    };
    // Capture phase: the engine's input surface listens on the same canvas and
    // was attached first, so only capturing gets the slash menu its keys before
    // the caret moves.
    canvas.addEventListener("keydown", onKeyDown, true);
    const onPointerDown = (): void => canvas.focus();
    canvas.addEventListener("pointerdown", onPointerDown);

    refresh();
    // The first frame has no faces yet, so it draws unshaped; loading them
    // re-renders. Awaiting them instead would leave the canvas blank with no
    // explanation for as long as the fetch took.
    void loadFaces().then(refresh);

    return () => {
      markRow.remove();
      slashBox.remove();
      handleLayer.remove();
      canvas.removeEventListener("keydown", onKeyDown, true);
      canvas.removeEventListener("pointerdown", onPointerDown);
      editor.onInvalidate = undefined;
      editor = create();
    };
  },
};
