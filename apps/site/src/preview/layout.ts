import { createElement, type PingoNode } from "@dopejs/pingo";

import type { PreviewDemoContext } from "./contract";

/**
 * Shared layout helpers for preview demos.
 *
 * flexDirection/alignItems are not direct props on the container element, so
 * they go through the typed inline `style` channel. pingo has no `gap`
 * property; spacing is an explicit fixed-size container between siblings.
 * The stage background stays transparent so the site's own surface (and its
 * light/dark theme switch) shows through the canvas.
 */
export function row(children: readonly PingoNode[], spacing = 8): PingoNode {
  return createElement("container", {
    style: { flexDirection: "row", alignItems: "center" },
    children: children.flatMap((node, index) =>
      index === 0 ? [node] : [createElement("container", { width: spacing }), node],
    ),
  });
}

export function column(children: readonly PingoNode[], spacing = 8): PingoNode {
  return createElement("container", {
    style: { flexDirection: "column" },
    children: children.flatMap((node, index) =>
      index === 0 ? [node] : [createElement("container", { height: spacing }), node],
    ),
  });
}

/** Full-surface transparent container that centers its children. */
export function stage(context: PreviewDemoContext, children: readonly PingoNode[]): PingoNode {
  return createElement("container", {
    width: context.width,
    height: context.height,
    style: { flexDirection: "column", justifyContent: "center", alignItems: "center" },
    children,
  });
}
