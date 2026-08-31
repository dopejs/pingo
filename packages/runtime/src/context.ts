import type { Signal } from "./signal";

/** Stable context brand shared across package copies and realms. */
export const PINGO_CONTEXT_TYPE: symbol = Symbol.for("dopejs.pingo.context");
/** Stable provider brand shared across package copies and realms. */
export const PINGO_PROVIDER_TYPE: symbol = Symbol.for("dopejs.pingo.context.provider");

/** A context object created by `createContext`. */
export interface PingoContext<T> {
  readonly $$typeof: typeof PINGO_CONTEXT_TYPE;
  readonly defaultValue: T;
  readonly Provider: ContextProvider<T>;
}

/**
 * Element type wrapper: `<context.Provider value={...}>children</...>`.
 *
 * Callable for the same reason a memo wrapper is: TypeScript resolves a JSX
 * tag's props from a call signature, so a plain object made
 * `<context.Provider>` a type error and left TSX with no way to express
 * context at all. The reconciler dispatches on `$$typeof` and never calls
 * this; a direct call passes the children through, which is what the
 * reconciler renders for a provider.
 */
export interface ContextProvider<T> {
  (props: ContextProviderProps<T>): unknown;
  readonly $$typeof: typeof PINGO_PROVIDER_TYPE;
  readonly context: PingoContext<T>;
}

/**
 * Identity-only view of a context, for the lookup bridge.
 *
 * `PingoContext<T>` is invariant in `T` -- its provider takes `T` as a prop --
 * so no single instantiation exists that every context is assignable to. The
 * bridge matches providers by reference identity and reads neither the default
 * value nor the provider, so it takes the brand and nothing else.
 */
export interface AnyPingoContext {
  readonly $$typeof: typeof PINGO_CONTEXT_TYPE;
}

/**
 * Variance-erased provider, for unions that accept any provider as an element
 * type. `ContextProvider<T>` is invariant in `T`, so no instantiation of it
 * serves that purpose.
 */
export interface AnyContextProvider {
  (props: ContextProviderProps<never>): unknown;
  readonly $$typeof: typeof PINGO_PROVIDER_TYPE;
  readonly context: AnyPingoContext;
}

/** Props accepted by a context Provider element. */
export interface ContextProviderProps<T> {
  readonly value: T;
  readonly children?: unknown;
}

export function createContext<T>(defaultValue: T): PingoContext<T> {
  // Two-phase init for the context↔provider self-reference; the object is
  // complete before createContext returns.
  const context = {} as PingoContext<T>;
  const render = (props: ContextProviderProps<T>): unknown => props.children ?? null;
  const provider = Object.defineProperties(render, {
    $$typeof: { enumerable: true, value: PINGO_PROVIDER_TYPE },
    context: { enumerable: true, value: context },
  }) as ContextProvider<T>;
  Object.assign(context, {
    $$typeof: PINGO_CONTEXT_TYPE,
    defaultValue,
    Provider: provider,
  } satisfies PingoContext<T>);
  return context;
}

export function isContextProvider(value: unknown): value is ContextProvider<never> {
  // A provider is a function, so the object test alone would reject it.
  return (
    ((typeof value === "object" && value !== null) || typeof value === "function") &&
    "$$typeof" in value &&
    value.$$typeof === PINGO_PROVIDER_TYPE
  );
}

/** Lookup bridge result: the nearest provider's signal for one context. */
export type ContextLookup = (context: AnyPingoContext) => Signal<unknown> | undefined;
