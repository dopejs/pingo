import { memo, View, type PingoNode } from "@dopejs/pingo-jsx";

import { classes, skin } from "../theme";

// Type alias (not interface) so the implicit index signature satisfies
// memo's Props extends Record<string, unknown> constraint.
export type DividerProps = {
  readonly orientation?: "horizontal" | "vertical";
  readonly className?: string;
};

function DividerImpl(props: DividerProps): PingoNode {
  const className = skin(
    classes("pui-divider", props.orientation === "vertical" ? "pui-divider--vertical" : undefined),
    props.className,
  );
  return View({ className });
}

/** shadcn-style separator. Memoized: re-renders only when props change. */
export const Divider = memo(DividerImpl);
