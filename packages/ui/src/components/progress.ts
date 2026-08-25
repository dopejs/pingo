import { memo, View, type PingoNode } from "@dopejs/pingo-jsx";

import { skin } from "../theme";

// Type alias (not interface) so the implicit index signature satisfies
// memo's Props extends Record<string, unknown> constraint.
export type ProgressProps = {
  readonly value: number;
  readonly max?: number;
  readonly className?: string;
};

function ProgressImpl(props: ProgressProps): PingoNode {
  const max = Math.max(1, props.max ?? 100);
  const pct = Math.min(100, Math.max(0, (props.value / max) * 100));
  const className = skin("pui-progress", props.className);
  return View({
    className,
    children: View({
      className: skin("pui-progress__indicator"),
      style: { width: `${pct}%` },
    }),
  });
}

/** shadcn-style progress bar. Memoized: re-renders only when props change. */
export const Progress = memo(ProgressImpl);
