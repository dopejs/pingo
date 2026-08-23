import { useEffect, useRef, useState, type ReactNode } from "react";
import type { HostedCanvasRoot } from "@dopejs/pingo";
import type * as PingoUi from "@dopejs/pingo-ui";

import type { PreviewDemo } from "./contract";
import { loadPreviewDemo, loadPreviewSource } from "./registry";

interface PreviewLabels {
  readonly preview: string;
  readonly code: string;
  readonly previewError: string;
}

interface ComponentPreviewProps {
  readonly id: string;
  readonly labels: PreviewLabels;
}

type Status = "idle" | "loading" | "ready" | "error";

function siteTheme(): PingoUi.PingoUiTheme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

/**
 * Live pingo-canvas preview for a documentation demo, with a Code tab showing
 * the demo source. The engine module, the pingo-ui skin and the demo module
 * are all loaded lazily, and the canvas only mounts once the preview scrolls
 * into view, so a documentation page with several previews pays for them
 * incrementally.
 */
export function ComponentPreview({ id, labels }: ComponentPreviewProps): ReactNode {
  const host = useRef<HTMLDivElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [status, setStatus] = useState<Status>("idle");
  const [failure, setFailure] = useState("");
  const [source, setSource] = useState<string>();
  const [demo, setDemo] = useState<PreviewDemo>();

  useEffect(() => {
    const element = host.current;
    if (element === null) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    });
    observer.observe(element);
    // IntersectionObserver callbacks never fire in some throttled/headless
    // contexts; fall back to mounting after a grace period so previews never
    // stay blank there. In normal browsers the observer wins the race.
    const fallback = window.setTimeout(() => setVisible(true), 4000);
    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    void loadPreviewDemo(id).then((loaded) => {
      if (cancelled) return;
      if (loaded === undefined) {
        setFailure(`unknown demo: ${id}`);
        setStatus("error");
        return;
      }
      setDemo(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [visible, id]);

  useEffect(() => {
    if (!visible || demo === undefined || tab !== "preview") return;
    const surface = canvasHost.current;
    if (surface === null) return;

    let disposed = false;
    let root: HostedCanvasRoot | undefined;
    let cleanup: (() => void) | void;
    let width = Math.max(280, Math.floor(surface.clientWidth));
    const height = demo.height ?? 240;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.cssText = "display:block;width:100%;height:100%;outline:none";
    canvas.tabIndex = 0;
    surface.replaceChildren(canvas);

    setStatus("loading");
    void Promise.all([import("@dopejs/pingo"), import("@dopejs/pingo-ui")])
      .then(async ([engine, ui]) => {
        ui.setTheme(siteTheme());
        const created = await engine.createHostedCanvasRoot(canvas, {
          styleSheets: [ui.createPingoUiStyleSheet()],
          initializationTimeoutMs: 45_000,
          onHostError: (error) => {
            if (!disposed) {
              setFailure(`${error.name}: ${error.message}`);
              setStatus("error");
            }
          },
        });
        if (disposed) {
          await created.close();
          return;
        }
        root = created;
        created.render(demo.render({ width, height }));
        cleanup = await demo.activate?.(created);
        setStatus("ready");
      })
      .catch((cause: unknown) => {
        if (disposed) return;
        setFailure(cause instanceof Error ? cause.message : String(cause));
        setStatus("error");
      });

    const themeObserver = new MutationObserver(() => {
      void import("@dopejs/pingo-ui").then((ui) => {
        ui.setTheme(siteTheme());
      });
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const resizeObserver = new ResizeObserver(() => {
      if (root === undefined) return;
      const nextWidth = Math.max(280, Math.floor(surface.clientWidth));
      if (Math.abs(nextWidth - width) < 2) return;
      width = nextWidth;
      canvas.width = Math.round(nextWidth * ratio);
      root.render(demo.render({ width: nextWidth, height }));
    });
    resizeObserver.observe(surface);

    return () => {
      disposed = true;
      themeObserver.disconnect();
      resizeObserver.disconnect();
      if (typeof cleanup === "function") cleanup();
      if (root !== undefined) void root.close();
      surface.replaceChildren();
    };
  }, [visible, demo, tab]);

  useEffect(() => {
    if (tab !== "code" || source !== undefined) return;
    let cancelled = false;
    void loadPreviewSource(id).then((loaded) => {
      if (!cancelled) setSource(loaded ?? "");
    });
    return () => {
      cancelled = true;
    };
  }, [tab, source, id]);

  return (
    <div className="preview" ref={host} data-demo={id}>
      <div className="preview__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "preview"}
          className={tab === "preview" ? "preview__tab preview__tab--active" : "preview__tab"}
          onClick={() => setTab("preview")}
        >
          {labels.preview}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "code"}
          className={tab === "code" ? "preview__tab preview__tab--active" : "preview__tab"}
          onClick={() => setTab("code")}
        >
          {labels.code}
        </button>
      </div>
      {tab === "preview" ? (
        <div
          className="preview__surface"
          ref={canvasHost}
          style={{ height: `${String(demo?.height ?? 240)}px` }}
        >
          {status === "error" && (
            <p className="preview__error">
              {labels.previewError}
              {failure === "" ? "" : `: ${failure}`}
            </p>
          )}
        </div>
      ) : (
        <pre className="preview__code">
          <code>{source ?? "…"}</code>
        </pre>
      )}
    </div>
  );
}
