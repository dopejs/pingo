import { Button, Input, TextArea, createPingoUiStyleSheet } from "@dopejs/pingo-ui";
import { createElement, createHostedCanvasRoot, type FrameReport } from "@dopejs/pingo";
import { afterEach, describe, expect, it } from "vitest";

/**
 * A control is as tall as the token says it is.
 *
 * The skin's sizes come from shadcn, whose reset makes every element
 * `border-box`; the engine implements the CSS default, so a declared size sat
 * inside the padding and the border rather than containing them. A 36px input
 * was drawn 50px tall, a 72px textarea 86px, and an outlined button stood 2px
 * taller than a filled one beside it.
 */
async function waitUntil(check: () => boolean, timeoutMs = 3000): Promise<boolean> {
  const end = performance.now() + timeoutMs;
  while (performance.now() < end) {
    if (check()) return true;
    await new Promise((resolve) => setTimeout(resolve, 8));
  }
  return check();
}

describe("control sizing", () => {
  const roots: Array<{ close: () => Promise<void> }> = [];

  afterEach(async () => {
    for (const root of roots.splice(0)) await root.close();
    document.body.replaceChildren();
  });

  it("draws each control at its token height", async () => {
    const width = 400;
    const height = 320;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    document.body.append(canvas);
    const frames: FrameReport[] = [];
    const root = await createHostedCanvasRoot(canvas, {
      styleSheets: [createPingoUiStyleSheet()],
      onFrame: (report) => frames.push(report),
      transport: { preference: "main-thread", strict: true },
    });
    roots.push(root);
    root.render(
      createElement("container", {
        style: { flexDirection: "column", padding: "10px", rowGap: "12px" },
        children: [
          createElement(Input, { value: "hi", width: 240 }),
          createElement(Button, { children: "Save", onPress: () => undefined }),
          createElement(Button, {
            children: "Outline",
            variant: "outline",
            onPress: () => undefined,
          }),
          createElement(TextArea, { value: "hi", width: 240 }),
        ],
      }),
    );
    expect(await waitUntil(() => frames.some((frame) => frame.cause === "mutation"))).toBe(true);

    const context = canvas.getContext("2d");
    if (context === null) throw new Error("Chromium did not provide Canvas2D");
    const data = context.getImageData(0, 0, width, height).data;
    const bands: number[] = [];
    let start = -1;
    for (let y = 0; y <= height; y += 1) {
      let inked = false;
      for (let x = 0; x < width && y < height; x += 1) {
        if ((data[(y * width + x) * 4 + 3] ?? 0) >= 20) {
          inked = true;
          break;
        }
      }
      if (inked && start < 0) start = y;
      if (!inked && start >= 0) {
        bands.push(y - start);
        start = -1;
      }
    }
    // $input-height, $button-height twice, then $textarea-min-height.
    expect(bands).toEqual([36, 36, 36, 72]);
  }, 60_000);
});
