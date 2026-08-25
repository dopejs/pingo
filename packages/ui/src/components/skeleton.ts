import { memo, View, type KeyframeAnimationSpec, type PingoNode } from "@dopejs/pingo-jsx";

import { skin } from "../theme";

// Type alias (not interface) so the implicit index signature satisfies
// memo's Props extends Record<string, unknown> constraint.
export type SkeletonProps = {
  readonly width?: number;
  readonly height?: number;
  /** Pulses by default; pass `false` for a still placeholder. */
  readonly animated?: boolean;
  readonly className?: string;
};

/**
 * shadcn's `animate-pulse`, as a Core keyframe animation.
 *
 * Core owns the timeline, so the pulse keeps running on its own clock while
 * the Shell is busy -- which is the whole point of a loading placeholder.
 * The engine takes a finite iteration count rather than `infinite`; a million
 * two-second cycles is twenty-three days, long past any load this stands in
 * for.
 */
const PULSE_ITERATIONS = 1_000_000;

const PULSE: KeyframeAnimationSpec = {
  property: "opacity",
  keyframes: [
    { offset: 0, value: 1 },
    { offset: 0.5, value: 0.5 },
    { offset: 1, value: 1 },
  ],
  durationMs: 2000,
  easing: { cubicBezier: [0.4, 0, 0.6, 1] },
  iterations: PULSE_ITERATIONS,
  direction: "normal",
  fill: "both",
};

function SkeletonImpl(props: SkeletonProps): PingoNode {
  const className = skin("pui-skeleton", props.className);
  return View({
    className,
    ...(props.width === undefined ? {} : { width: props.width }),
    ...(props.height === undefined ? {} : { height: props.height }),
    ...(props.animated === false ? {} : { animation: PULSE }),
  });
}

/** shadcn-style skeleton placeholder. Memoized: re-renders only on new props. */
export const Skeleton = memo(SkeletonImpl);
