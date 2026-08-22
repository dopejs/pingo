import type { HostedCanvasRoot, PingoNode } from "@dopejs/pingo";

/**
 * Contract for a documentation preview demo.
 *
 * A demo is a standalone module under `apps/site/src/demos/` whose default
 * export renders one self-contained pingo scene. The build pipeline derives
 * the demo id from the file name, so `demos/components/button-basic.tsx` is
 * referenced from markdown as `:::preview button-basic`.
 */
export interface PreviewDemoContext {
  /** CSS pixel size of the preview canvas. */
  readonly width: number;
  readonly height: number;
}

export interface PreviewDemo {
  /** Preferred CSS height of the preview surface. Defaults to 240. */
  readonly height?: number;
  /** Builds the scene tree for the current surface size. */
  render(context: PreviewDemoContext): PingoNode;
  /**
   * Runs once after the first render; use it for async assets or extra
   * wiring. May return a cleanup function (or a promise of one).
   */
  activate?(root: HostedCanvasRoot): (() => void) | void | Promise<(() => void) | void>;
}
