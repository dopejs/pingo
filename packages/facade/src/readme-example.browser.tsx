/** @jsxImportSource @dopejs/pingo */
import { createHostedCanvasRoot, Text, View, type FrameReport } from "@dopejs/pingo";
import { describe, expect, it } from "vitest";

describe("readme", () => {
  it("runs the first-canvas example", async () => {
    const canvas = document.createElement("canvas");
    canvas.id = "app";
    document.body.append(canvas);
    const frames: FrameReport[] = [];
    const errors: unknown[] = [];

    // Verbatim from README.md, except for the reporting options: the canvas
    // transfers control to an OffscreenCanvas, so the main thread cannot read
    // pixels back and a frame report is what proves it drew.
    const target = document.querySelector<HTMLCanvasElement>("#app")!;
    target.width = 800;
    target.height = 600;

    const root = await createHostedCanvasRoot(target, {
      onFrame: (report) => frames.push(report),
      onHostError: (error) => errors.push(error),
    });

    root.render(
      <View width={800} height={600} backgroundColor="#ffffffff" padding={24}>
        <Text value="Hello pingo" fontSize={24} lineHeight={32} color="#1f2329ff" />
      </View>,
    );

    const end = performance.now() + 5000;
    while (performance.now() < end && frames.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 16));
    }
    expect(errors).toEqual([]);
    expect(frames.length).toBeGreaterThan(0);
    expect(["sab", "post-message", "main-thread"]).toContain(root.mode);
    await root.close();
    canvas.remove();
  }, 60_000);
});
