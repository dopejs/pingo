import { useEffect, useRef, type ReactNode } from "react";
import {
  createHostedCanvasRoot,
  type HostedCanvasRoot,
  type PaintedTextSnapshot,
} from "@dopejs/pingo";

import { scene } from "./scene";

interface PingoSurfaceProps {
  readonly label: string;
  readonly onPaintedText?: (snapshot: PaintedTextSnapshot) => void;
}

/**
 * A React component hosting one pingo canvas.
 *
 * This file's JSX is React's -- no pragma, so it takes the project's
 * `jsxImportSource`. The pingo half lives in `./scene`.
 *
 * React renders a container and the effect creates the canvas, rather than
 * React rendering the canvas and the effect taking a ref to it. That is not a
 * style preference: the root transfers the canvas to an OffscreenCanvas, and
 * that transfer is permanent. A React-owned canvas survives StrictMode's
 * double mount and the second `createHostedCanvasRoot` fails with
 * "Cannot get context from a canvas that has transferred its control to
 * offscreen". A canvas created inside the effect is discarded with it.
 *
 * Root creation is also asynchronous, so an unmount can land before it
 * resolves; the resolved root is then closed rather than kept.
 */
export function PingoSurface({ label, onPaintedText }: PingoSurfaceProps): ReactNode {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (host === null) return;
    let disposed = false;
    let root: HostedCanvasRoot | undefined;

    const canvas = document.createElement("canvas");
    canvas.width = 240;
    canvas.height = 80;
    host.replaceChildren(canvas);

    void (async () => {
      const created = await createHostedCanvasRoot(canvas, {
        ...(onPaintedText === undefined ? {} : { onPaintedText }),
      });
      if (disposed) {
        await created.close();
        return;
      }
      root = created;
      created.render(scene(label));
    })();

    return () => {
      disposed = true;
      void root?.close();
      root = undefined;
      canvas.remove();
    };
  }, [label, onPaintedText]);

  return <div ref={hostRef} />;
}
