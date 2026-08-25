import { signal } from "@dopejs/pingo-runtime";

export type PingoUiTheme = "light" | "dark";

/**
 * Module-level theme signal. pingo has no context API; components reading
 * `useTheme()` during render are auto-subscribed by the reconciler's
 * observer tracking, so `setTheme` re-renders every subscribed component.
 */
const themeSignal = signal<PingoUiTheme>("light");

/** Switches the active theme. Every subscribed component re-renders. */
export function setTheme(next: PingoUiTheme): void {
  themeSignal.set(next);
}

/** Reads the theme without subscribing (for non-render call sites). */
export function getTheme(): PingoUiTheme {
  return themeSignal.peek();
}

/** Reads the theme inside component render; auto-subscribes the component. */
export function useTheme(): PingoUiTheme {
  return themeSignal.get();
}

/** Joins class names, dropping the empty ones. Applies no theme. */
export function classes(...parts: readonly (string | undefined)[]): string {
  return parts.filter((part) => part !== undefined && part !== "").join(" ");
}

/**
 * Joins a themed element's own skin classes with the caller's className and
 * appends the active theme marker.
 *
 * Dark is expressed as a same-node compound rule (`.pui-card.pui-dark`)
 * because pingo has no descendant selectors, so every themed node has to carry
 * the marker itself. Routing that through one helper is what keeps a component
 * from silently rendering light in dark mode: previously each component
 * re-derived the marker by hand, through three separate idioms, and a
 * component that skipped the step failed silently.
 *
 * The marker sits between the skin classes and the caller's className, which
 * is the order all three previous idioms already produced.
 *
 * Reading the theme signal here subscribes the calling component, so callers
 * must be inside a render scope -- the requirement `useTheme` already carried.
 */
export function skin(base: string, className?: string): string {
  return classes(base, useTheme() === "dark" ? "pui-dark" : undefined, className);
}
