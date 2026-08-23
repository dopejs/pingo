import { createElement, createHostedCanvasRoot, type FrameReport } from "@dopejs/pingo";
import { Input, TextArea, createPingoUiStyleSheet } from "@dopejs/pingo-ui";
import { afterEach, describe, expect, it } from "vitest";

/**
 * Pressing anywhere on a decorated text control starts editing it.
 *
 * Core focuses an editable when a press hits it, and the editable covers only
 * the box its own text needs: the border, the padding and the adornments belong
 * to the wrapper around it. A press on any of those hit no editable at all, so
 * most of a TextArea -- one 20px line inside a box at least 72 high -- and the
 * top and side strips of an Input did nothing.
 */
interface ProbeContext {
  text?: string;
  selectionStart?: number;
}

async function waitUntil(check: () => boolean, timeoutMs = 2000): Promise<boolean> {
  const end = performance.now() + timeoutMs;
  while (performance.now() < end) {
    if (check()) return true;
    await new Promise((resolve) => setTimeout(resolve, 8));
  }
  return check();
}

describe("decorated text control focus", () => {
  const roots: Array<{ close: () => Promise<void> }> = [];

  afterEach(async () => {
    for (const root of roots.splice(0)) await root.close();
    document.body.replaceChildren();
  });

  async function mount(node: unknown): Promise<{
    readonly press: (x: number, y: number) => void;
    readonly session: () => ProbeContext;
  }> {
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 200;
    document.body.append(canvas);
    const frames: FrameReport[] = [];
    const root = await createHostedCanvasRoot(canvas, {
      styleSheets: [createPingoUiStyleSheet()],
      onFrame: (report) => frames.push(report),
      transport: { preference: "main-thread", strict: true },
    });
    roots.push(root);
    root.render(node as never);
    await waitUntil(() => frames.some((frame) => frame.cause === "mutation"));
    const rect = canvas.getBoundingClientRect();
    return {
      press: (x, y) => {
        for (const [type, buttons] of [
          ["pointerdown", 1],
          ["pointerup", 0],
        ] as const) {
          canvas.dispatchEvent(
            new PointerEvent(type, {
              bubbles: true,
              buttons,
              clientX: rect.left + x,
              clientY: rect.top + y,
              pointerId: 4,
            }),
          );
        }
      },
      session: () => (Reflect.get(canvas, "editContext") ?? {}) as ProbeContext,
    };
  }

  it("starts editing from a press on the Input's decoration", async () => {
    const { press, session } = await mount(createElement(Input, { value: "hi", width: 240 }));
    // The top-left corner: inside the border and the padding, outside the
    // editable, and outside the glyphs on both axes.
    press(2, 2);
    expect(await waitUntil(() => session().text === "hi")).toBe(true);
  });

  it("starts editing from a press on the TextArea's empty area", async () => {
    const { press, session } = await mount(createElement(TextArea, { value: "hi", width: 240 }));
    // Well below the single line of text, which is where most presses on a
    // multiline field land.
    press(120, 60);
    expect(await waitUntil(() => session().text === "hi")).toBe(true);
  });

  it.each([
    ["Input", () => createElement(Input, { value: "hi", width: 240, disabled: true })],
    ["TextArea", () => createElement(TextArea, { value: "hi", width: 240, disabled: true })],
  ])("never starts editing a disabled %s", async (_name, build) => {
    const { press, session } = await mount(build());
    // The decoration, then the value itself: a disabled control takes focus
    // from neither, so it shows no caret and reaches no input method. The
    // canvas carries an EditContext whenever the tree holds an editable, so
    // what marks a live session is the value reaching it, not its existence.
    press(2, 2);
    expect(await waitUntil(() => session().text === "hi", 300)).toBe(false);
    press(30, 25);
    expect(await waitUntil(() => session().text === "hi", 300)).toBe(false);
  });

  it("still lets Core place the caret when the press reaches the editable", async () => {
    const { press, session } = await mount(createElement(Input, { value: "hi", width: 240 }));
    // Past the end of the value but inside the editable: Core resolves that to
    // the last offset. Focusing from the wrapper runs before Core's own
    // handling, so doing it for a press that already hit the editable would
    // swallow the caret placement that follows it.
    press(200, 25);
    expect(await waitUntil(() => session().selectionStart === 2)).toBe(true);
  });
});
