import type { FunctionComponent, PingoNode } from "./types";

/** Stable memo brand shared across package copies and realms. */
export const PINGO_MEMO_TYPE: symbol = Symbol.for("dopejs.pingo.memo");

export type PropsAreEqual<Props> = (previous: Readonly<Props>, next: Readonly<Props>) => boolean;

/**
 * Component wrapper produced by `memo`. The wrapper is a singleton callable:
 * element identity (`instance.type === descriptor.type`) is preserved, so the
 * reconciler's compatibility check works unchanged.
 *
 * It is callable because TypeScript resolves a JSX tag's props from a call
 * signature and a plain object has none, so `<Memoized />` was a type error --
 * which made every memoized component, including all of `@dopejs/pingo-ui`,
 * unusable from TSX. Rendering still goes through `component`; calling the
 * wrapper directly renders once without memoization, which is what a direct
 * call already meant for a plain function component.
 */
export interface MemoComponent<Props = Record<string, never>> {
  (props: Props): PingoNode;
  readonly $$typeof: typeof PINGO_MEMO_TYPE;
  readonly component: FunctionComponent<Props>;
  readonly compare: PropsAreEqual<Props> | undefined;
}

/**
 * Skips re-rendering a component when its props are shallowly equal to the
 * last render's props. Function props compare by reference — inline handlers
 * defeat memo, exactly as in React. Signal-driven re-renders bypass memo:
 * a component subscribed to a signal always re-renders when it writes.
 */
export function memo<Props extends Record<string, unknown>>(
  component: FunctionComponent<Props>,
  compare?: PropsAreEqual<Props>,
): MemoComponent<Props> {
  const wrapper = (props: Props): PingoNode => component(props);
  return Object.defineProperties(wrapper, {
    $$typeof: { enumerable: true, value: PINGO_MEMO_TYPE },
    compare: { enumerable: true, value: compare },
    component: { enumerable: true, value: component },
  }) as MemoComponent<Props>;
}

export function isMemoComponent(value: unknown): value is MemoComponent<never> {
  // A memo wrapper is a function, so the object test alone would reject it.
  return (
    ((typeof value === "object" && value !== null) || typeof value === "function") &&
    "$$typeof" in value &&
    value.$$typeof === PINGO_MEMO_TYPE
  );
}

/** Default memo comparison: Object.is per value plus key-count equality. */
export function shallowEqual(
  left: Readonly<Record<string, unknown>>,
  right: Readonly<Record<string, unknown>>,
): boolean {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) return false;
  for (const key of leftKeys) {
    if (!Object.hasOwn(right, key) || !Object.is(left[key], right[key])) return false;
  }
  return true;
}
