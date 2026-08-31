import { createHostedCanvasRoot } from "@dopejs/pingo";
import { describe, expect, it } from "vitest";

/**
 * Reusing a canvas element across roots.
 *
 * The transfer to an OffscreenCanvas is permanent and outlives the root that
 * made it, so a second root on the same element fails inside a DOM call. React
 * StrictMode reaches this on every development mount. What is asserted here is
 * the explanation, because the raw `InvalidStateError` names neither the cause
 * nor the fix.
 */
describe("canvas reuse", () => {
  it("explains a canvas that already transferred control", async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 120;
    canvas.height = 80;
    document.body.append(canvas);

    const first = await createHostedCanvasRoot(canvas);
    await first.close();

    await expect(createHostedCanvasRoot(canvas)).rejects.toThrow(
      /already transferred control to an OffscreenCanvas/u,
    );
    canvas.remove();
  }, 30_000);
});
