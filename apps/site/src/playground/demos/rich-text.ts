import interBoldUrl from "@fontsource/inter/files/inter-latin-700-normal.woff2?url";
import interRegularUrl from "@fontsource/inter/files/inter-latin-400-normal.woff2?url";
import { encodeInputBatch, loadFont, type PingoFont, type TextRunProps } from "@dopejs/pingo";
import {
  DocumentEditorController,
  toMarkdown,
  type Block,
  type DocumentModel,
  type MarkName,
} from "@dopejs/pingo/editor";

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
        dispatch: (commands) => {
          if (commands.length === 0) return;
          context.root.dispatchInput(encodeInputBatch({ frameSeq: 1, commands }));
        },
        focusBlock: (nodeId, block) => context.root.focusDocument(nodeId, block),
      },
    });

    const panel = document.createElement("div");
    panel.style.display = "grid";
    panel.style.gap = "8px";
    const hint = document.createElement("p");
    hint.style.margin = "0";
    hint.textContent = context.messages.richTextHint;
    const markRow = document.createElement("div");
    markRow.style.display = "flex";
    markRow.style.flexWrap = "wrap";
    markRow.style.gap = "6px";
    const source = document.createElement("pre");
    source.style.margin = "0";
    source.style.whiteSpace = "pre-wrap";
    source.style.fontSize = "12px";
    source.style.lineHeight = "1.5";
    panel.append(hint, markRow, source);
    context.controls.append(panel);

    const buttons = new Map<MarkName, HTMLButtonElement>();
    for (const mark of OFFERED) {
      const element = document.createElement("button");
      element.type = "button";
      element.textContent = context.messages.markLabel(mark);
      element.addEventListener("mousedown", (event) => {
        // The press must not take focus off the canvas: the OS input surface
        // lives there, and losing it mid-selection ends the editing session.
        event.preventDefault();
      });
      element.addEventListener("click", () => editor.toggleMark(mark));
      buttons.set(mark, element);
      markRow.append(element);
    }

    const refresh = (): void => {
      for (const [mark, element] of buttons) {
        const on = editor.markIsActive(mark);
        element.setAttribute("aria-pressed", on ? "true" : "false");
        element.style.fontWeight = on ? "700" : "400";
        element.disabled = !on && editor.selection?.kind !== "text";
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
      // Markdown from the same document the canvas draws, so what the page
      // shows and what a copy would carry cannot drift apart.
      source.textContent = toMarkdown(editor.document);
      context.root.render(scene(context));
    };
    editor.onInvalidate = refresh;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (editor.handleKeyDown(event)) event.preventDefault();
    };
    canvas.addEventListener("keydown", onKeyDown);
    const onPointerDown = (): void => canvas.focus();
    canvas.addEventListener("pointerdown", onPointerDown);

    refresh();
    // The first frame has no faces yet, so it draws unshaped; loading them
    // re-renders. Awaiting them instead would leave the canvas blank with no
    // explanation for as long as the fetch took.
    void loadFaces().then(refresh);

    return () => {
      canvas.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("pointerdown", onPointerDown);
      editor.onInvalidate = undefined;
      editor = create();
    };
  },
};
