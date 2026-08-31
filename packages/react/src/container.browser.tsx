import { StrictMode, act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createElement } from "@dopejs/pingo-jsx";
import type { PaintedTextSnapshot } from "@dopejs/pingo-host";
import { afterEach, describe, expect, it } from "vitest";

import { PingoContainer } from "./container";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
// React reads this global before it will run effects inside `act`.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

/**
 * The container under the arrangement that breaks a hand-written one.
 *
 * `StrictMode` mounts and cleans up twice in development. A root transfers its
 * canvas to an OffscreenCanvas permanently, so the second mount fails unless
 * the discarded mount took its canvas with it -- which is the reason this
 * component creates the canvas rather than letting React render it.
 */
describe("PingoContainer", () => {
  const mounted: Array<{ host: HTMLElement; root: Root }> = [];

  afterEach(() => {
    for (const entry of mounted.splice(0).reverse()) {
      act(() => {
        entry.root.unmount();
      });
      entry.host.remove();
    }
  });

  it("survives a StrictMode double mount and draws", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const reactRoot = createRoot(host);
    mounted.push({ host, root: reactRoot });
    const snapshots: PaintedTextSnapshot[] = [];
    const startupErrors: Error[] = [];

    act(() => {
      reactRoot.render(
        <StrictMode>
          <PingoContainer
            onStartupError={(error) => startupErrors.push(error)}
            options={{ onPaintedText: (snapshot) => snapshots.push(snapshot) }}
            scene={createElement("text", { value: "drawn-by-container" })}
            style={{ height: 80, width: 240 }}
          />
        </StrictMode>,
      );
    });

    // One canvas, not two: the first mount's canvas left with its effect.
    expect(host.querySelectorAll("canvas")).toHaveLength(1);

    const end = performance.now() + 10_000;
    while (performance.now() < end && !texts().includes("drawn-by-container")) {
      await new Promise((resolve) => setTimeout(resolve, 16));
    }
    expect(texts()).toContain("drawn-by-container");
    expect(startupErrors).toEqual([]);

    function texts(): string[] {
      return (snapshots.at(-1)?.records ?? []).map((record) => record.text);
    }
  }, 30_000);
});
