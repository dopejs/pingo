import { StrictMode, act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { PaintedTextSnapshot } from "@dopejs/pingo";
import { afterEach, describe, expect, it } from "vitest";

import { PingoSurface } from "./PingoSurface";

/**
 * React and pingo in one application.
 *
 * Both halves are TSX and neither is the other's: this file's tags are React's,
 * `./scene`'s are pingo's, and `./PingoSurface` is the only place they meet.
 * The test runs under `StrictMode`, which mounts and cleans up twice in
 * development -- the case that leaves a stranded worker behind if the effect's
 * cleanup is not exact.
 */
declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
// React reads this global before it will run effects inside `act`.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe("React interop", () => {
  const mounted: Array<{ root: Root; host: HTMLElement }> = [];

  afterEach(() => {
    for (const entry of mounted.splice(0).reverse()) {
      act(() => {
        entry.root.unmount();
      });
      entry.host.remove();
    }
  });

  it("hosts a pingo canvas inside a React tree", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    mounted.push({ host, root });
    const snapshots: PaintedTextSnapshot[] = [];

    act(() => {
      root.render(
        <StrictMode>
          <PingoSurface label="from-react" onPaintedText={(s) => snapshots.push(s)} />
        </StrictMode>,
      );
    });

    // React owns the container; the effect owns the canvas, because the root
    // transfers it to an OffscreenCanvas and StrictMode mounts twice.
    expect(host.querySelectorAll("canvas")).toHaveLength(1);

    const end = performance.now() + 10_000;
    while (performance.now() < end && !painted().includes("from-react")) {
      await new Promise((resolve) => setTimeout(resolve, 16));
    }
    expect(painted()).toContain("from-react");

    function painted(): string[] {
      return (snapshots.at(-1)?.records ?? []).map((record) => record.text);
    }
  }, 30_000);
});
