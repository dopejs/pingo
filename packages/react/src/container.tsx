import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import {
  createHostedCanvasRoot,
  type HostedCanvasRoot,
  type HostedCanvasRootOptions,
} from "@dopejs/pingo-host";
import type { PingoNode } from "@dopejs/pingo-jsx";

export interface PingoContainerProps {
  /**
   * The scene to draw.
   *
   * It arrives as a value rather than as children because `jsxImportSource` is
   * per file: this file's tags are React's, so a caller cannot write pingo tags
   * here either. A pingo file exports the scene and this prop carries it across.
   */
  readonly scene: PingoNode;
  /**
   * Options for the underlying root.
   *
   * Read once. Changing them does not reconfigure a live root, because most of
   * them are decided during capability detection and startup; pass a `key` to
   * mount a new container instead.
   */
  readonly options?: HostedCanvasRootOptions;
  /** Called with the root once it exists, and with `undefined` once it closes. */
  readonly onRoot?: (root: HostedCanvasRoot | undefined) => void;
  /** Reports a failure to start the root. Runtime faults go to `options.onHostError`. */
  readonly onStartupError?: (error: Error) => void;
  readonly className?: string;
  readonly style?: CSSProperties;
}

const FILL: CSSProperties = { display: "block", height: "100%", width: "100%" };

/**
 * A React element hosting one pingo canvas root.
 *
 * React owns the container element; this component owns the canvas inside it,
 * and that division is required rather than tidy. A root transfers its canvas
 * to an OffscreenCanvas, the transfer is permanent, and StrictMode runs effects
 * twice in development -- so a canvas React rendered would be handed to a
 * second root that cannot have it. A canvas created by the effect is discarded
 * with the effect.
 *
 * Resizing is not handled here: the root already follows its canvas's box, so
 * sizing the container with CSS is enough.
 */
export function PingoContainer({
  className,
  onRoot,
  onStartupError,
  options,
  scene,
  style,
}: PingoContainerProps): ReactNode {
  const hostRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HostedCanvasRoot>(undefined);
  // Read inside the effect so that changing a callback or the options object
  // between renders does not tear down a live root.
  const latest = useRef({ onRoot, onStartupError, options, scene });
  latest.current = { onRoot, onStartupError, options, scene };

  useEffect(() => {
    const host = hostRef.current;
    if (host === null) return;
    let disposed = false;
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "display:block;width:100%;height:100%";
    const ratio =
      typeof devicePixelRatio === "number" && devicePixelRatio > 0 ? devicePixelRatio : 1;
    canvas.width = Math.max(1, Math.round(host.clientWidth * ratio));
    canvas.height = Math.max(1, Math.round(host.clientHeight * ratio));
    host.replaceChildren(canvas);

    void (async () => {
      try {
        const created = await createHostedCanvasRoot(canvas, latest.current.options);
        if (disposed) {
          await created.close();
          return;
        }
        rootRef.current = created;
        created.render(latest.current.scene);
        latest.current.onRoot?.(created);
      } catch (cause) {
        if (disposed) return;
        latest.current.onStartupError?.(
          cause instanceof Error ? cause : new Error(String(cause), { cause }),
        );
      }
    })();

    return () => {
      disposed = true;
      const root = rootRef.current;
      rootRef.current = undefined;
      latest.current.onRoot?.(undefined);
      void root?.close();
      canvas.remove();
    };
  }, []);

  useEffect(() => {
    rootRef.current?.render(scene);
  }, [scene]);

  return <div className={className} ref={hostRef} style={style ?? FILL} />;
}
