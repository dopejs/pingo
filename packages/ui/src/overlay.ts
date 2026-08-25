import { type NodeHandle, type PingoEvent } from "@dopejs/pingo-jsx";
import { createContext, useContext, useMemo } from "@dopejs/pingo-runtime";

/**
 * Focus handoff and keyboard reach for an overlay that opens and closes.
 *
 * Core routes a key event to the focused node and nowhere else, so an overlay
 * that never takes focus never sees Escape. Focus moves to the panel as it
 * mounts and returns to whatever opened it when the panel goes away — otherwise
 * the next key press lands on nothing.
 *
 * **There is nothing to trap.** Core has no tab order at all, so Tab never
 * moves focus on its own and focus cannot leak out of an overlay by keyboard;
 * a modal's backdrop absorbs the only other thing that moves focus, a pointer
 * press. What is actually missing without help is the opposite: a keyboard user
 * has no way to *reach* the controls inside a panel. `focusable` and
 * `keyHandler` supply that, by cycling Tab over whatever the panel registered.
 */
export interface OverlayFocus {
  /** Ref for the element that opens the overlay. */
  readonly trigger: (handle: NodeHandle | null) => void;
  /** Ref for the panel; focuses it as it mounts and restores on unmount. */
  readonly panel: (handle: NodeHandle | null) => void;
  /**
   * Ref for one control inside the panel, at a caller-chosen Tab position.
   *
   * Opt-in rather than discovered: panel content is an arbitrary tree and the
   * Shell cannot tell which of it is meant to be reachable, nor in what order.
   */
  readonly focusable: (order: number) => (handle: NodeHandle | null) => void;
  /** Currently registered controls, in Tab order. */
  readonly ordered: () => readonly NodeHandle[];
  /**
   * Moves focus to the next (or previous) registered control, wrapping around.
   *
   * The cursor lives here rather than in the key handler because the handler is
   * rebuilt on every render while this object is memoized for the overlay's
   * lifetime — a cursor in the handler would silently rewind mid-cycle.
   * Returns false when nothing is registered, so the caller can leave the key
   * alone instead of swallowing it.
   */
  readonly cycle: (backward: boolean) => boolean;
  /**
   * Handlers that close the overlay when focus leaves it for good.
   *
   * Core moves focus to whatever a pointer press lands on, so "the user pressed
   * outside" is "focus left the anchor because of a press the anchor never
   * saw". The press and the focus change it causes carry the same `eventId`,
   * and a press inside the anchor is dispatched through the anchor — so the
   * anchor knows, from the id alone, whether the departure is its own doing.
   *
   * That is the only signal robust enough. The matching `focusin` cannot be
   * relied on: a handler that focuses something re-enters Core mid-dispatch and
   * the arrival can go missing, and on the Worker transport a `focus()` issued
   * as a panel mounts can reach Core before the commit that creates it, leaving
   * a departure with no arrival at all. Both looked identical to "pressed
   * outside", so an overlay closed on the press that opened it and a list
   * closed without ever running its selection.
   *
   * Like `cycle`, the state lives on this object rather than in the handlers:
   * the descriptor is rebuilt on every render and these events routinely
   * straddle one.
   */
  readonly dismissHandlers: (close: () => void) => {
    readonly onPointerDownCapture: (event: PingoEvent) => void;
    readonly onFocusOut: (event: PingoEvent) => void;
    readonly onFocusIn: (event: PingoEvent) => void;
  };
}

export function useOverlayFocus(): OverlayFocus {
  return useMemo(() => createOverlayFocus(), []);
}

/** Pure factory: safe to call without a component scope (tests use this). */
export function createOverlayFocus(): OverlayFocus {
  let trigger: NodeHandle | null = null;
  let panelNodeId: number | undefined;
  const controls = new Map<number, NodeHandle>();
  // The focus departure waiting to be confirmed, and what to run if it is;
  // and the id of the last press the anchor saw. Per overlay, not per render:
  // see `dismissHandlers`.
  let departure: { eventId: number; close: () => void } | undefined;
  let pressedInsideEventId: number | undefined;
  // Position, not handle: a control that remounts at the same order keeps its
  // place. -1 means focus is still on the panel itself.
  let cursor = -1;
  const ordered = (): NodeHandle[] =>
    [...controls.entries()].sort(([left], [right]) => left - right).map(([, handle]) => handle);
  return {
    trigger: (handle) => {
      trigger = handle;
    },
    panel: (handle) => {
      panelNodeId = handle?.nodeId;
      if (handle === null) {
        // Registrations belong to the panel instance going away; a reopened
        // panel re-registers, so keeping them would cycle onto dead handles.
        controls.clear();
        cursor = -1;
        trigger?.focus();
        return;
      }
      handle.focus();
    },
    focusable: (order) => (handle) => {
      if (handle === null) controls.delete(order);
      else controls.set(order, handle);
    },
    ordered,
    cycle: (backward) => {
      const list = ordered();
      if (list.length === 0) return false;
      // From the panel itself, forward lands on the first control and backward
      // on the last — what a freshly opened panel wants.
      cursor =
        cursor < 0
          ? backward
            ? list.length - 1
            : 0
          : (cursor + (backward ? list.length - 1 : 1)) % list.length;
      list[cursor]?.focus();
      return true;
    },
    dismissHandlers: (close) => ({
      // Capture, so it runs however deep inside the anchor the press landed.
      onPointerDownCapture: (event) => {
        pressedInsideEventId = event.eventId;
      },
      onFocusOut: (event) => {
        // The press that moved focus was inside this overlay: its own trigger,
        // its panel, or anything in either.
        if (pressedInsideEventId === event.eventId) return;
        // Focus going nowhere is not a dismissal either. Core clears focus
        // outright when a focus request names a node it does not have, which is
        // what a panel's own `focus()` looks like when it overtakes the commit
        // that mounts it.
        if (event.relatedTarget === null) return;
        const nodeId = event.relatedTarget.nodeId;
        if (nodeId === panelNodeId || nodeId === trigger?.nodeId) return;
        if (ordered().some((handle) => handle.nodeId === nodeId)) return;
        departure = { eventId: event.eventId, close };
        // A frame, not a microtask: the arrival that cancels this can come from
        // a re-entrant Core call or, on the Worker transport, from a later
        // message. A dismissal one frame late is invisible; a dismissal that
        // fires while focus is still inside the overlay is what closed a list
        // in the middle of the press that was choosing from it.
        const settle = (): void => {
          const pending = departure;
          if (pending === undefined || pending.eventId !== event.eventId) return;
          departure = undefined;
          pending.close();
        };
        if (typeof requestAnimationFrame === "function") requestAnimationFrame(settle);
        else setTimeout(settle, 16);
      },
      onFocusIn: (event) => {
        // Any arrival inside the anchor cancels a pending departure: focus is
        // demonstrably back inside, whichever event carried it there.
        void event;
        departure = undefined;
      },
    }),
  };
}

/**
 * Builds an `onKeyDown` that closes on Escape, cycles Tab over the panel's
 * registered controls, and leaves every other key alone.
 *
 * Swallowing keys the overlay does not act on would stop them reaching whatever
 * else is listening, so only Escape and Tab are claimed — and Tab only when
 * something is registered to move to. A panel that registers nothing keeps the
 * plain Escape-only behavior.
 */
export function overlayKeyHandler(
  focus: OverlayFocus,
  close: () => void,
): (event: PingoEvent) => void {
  return (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    if (!focus.cycle(event.shiftKey)) return;
    event.preventDefault();
    event.stopPropagation();
  };
}

/**
 * Builds an `onKeyDown` that closes on Escape and leaves every other key alone.
 *
 * Swallowing keys an overlay does not act on would stop them reaching whatever
 * else is listening, so only Escape is claimed.
 */
export function escapeHandler(close: () => void): (event: PingoEvent) => void {
  return (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    close();
  };
}

// Re-exported from its home in theme.ts, where it sits next to `skin`, the
// themed variant every component reaches for instead.
export { classes } from "./theme";

/**
 * Publishes the enclosing overlay's focus registry to its content.
 *
 * An overlay creates its `OverlayFocus` internally, so without this the
 * `focusable` registry would be unreachable from the content the caller
 * actually renders — the Tab cycle would exist but never have anything in it.
 */
export const OverlayFocusContext = createContext<OverlayFocus | undefined>(undefined);

/**
 * Ref that registers a control at `order` in the enclosing overlay's Tab cycle.
 *
 * Outside an overlay it is a no-op, so the same component can be used both
 * inside and outside one without branching.
 */
export function useFocusableRef(order: number): (handle: NodeHandle | null) => void {
  const focus = useContext(OverlayFocusContext);
  // Memoized on the registry and position: a fresh ref identity every render
  // would make the reconciler detach and reattach the handle each time.
  return useMemo(
    () => (focus === undefined ? (): void => {} : focus.focusable(order)),
    [focus, order],
  );
}
