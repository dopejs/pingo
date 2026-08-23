import { type PingoEvent } from "@dopejs/pingo-jsx";
import { describe, expect, it, vi } from "vitest";

import { classes, createOverlayFocus, escapeHandler, overlayKeyHandler } from "./overlay";

function handle(focus: () => void): { focus: () => void } {
  return { focus };
}

describe("createOverlayFocus", () => {
  it("focuses the panel on mount and gives focus back on unmount", () => {
    const triggerFocus = vi.fn();
    const panelFocus = vi.fn();
    const focus = createOverlayFocus();

    focus.trigger(handle(triggerFocus) as never);
    focus.panel(handle(panelFocus) as never);
    expect(panelFocus).toHaveBeenCalledOnce();
    expect(triggerFocus).not.toHaveBeenCalled();

    // Unmounting the panel hands focus back, or the next key reaches nothing.
    focus.panel(null);
    expect(triggerFocus).toHaveBeenCalledOnce();
  });

  it("survives a panel that closes before anything registered a trigger", () => {
    const focus = createOverlayFocus();
    expect(() => focus.panel(null)).not.toThrow();
  });
});

describe("createOverlayFocus tab cycle", () => {
  function registered(count: number): {
    readonly focus: ReturnType<typeof createOverlayFocus>;
    readonly focused: ReturnType<typeof vi.fn>[];
  } {
    const focus = createOverlayFocus();
    const focused = Array.from({ length: count }, () => vi.fn());
    // Registered out of order on purpose: the cycle follows the caller's
    // declared order, not the order handles happened to mount in.
    for (const index of [...focused.keys()].reverse()) {
      focus.focusable(index)(handle(focused[index] as () => void) as never);
    }
    return { focus, focused };
  }

  it("orders controls by their declared position, not their mount order", () => {
    const { focus, focused } = registered(3);
    expect(focus.ordered()).toHaveLength(3);

    focus.cycle(false);
    expect(focused[0]).toHaveBeenCalledOnce();
    focus.cycle(false);
    expect(focused[1]).toHaveBeenCalledOnce();
  });

  it("wraps forward and backward, and starts backward at the last control", () => {
    const forward = registered(3);
    for (let step = 0; step < 4; step += 1) forward.focus.cycle(false);
    // Four forward steps over three controls lands back on the first.
    expect(forward.focused[0]).toHaveBeenCalledTimes(2);

    const backward = registered(3);
    backward.focus.cycle(true);
    expect(backward.focused[2]).toHaveBeenCalledOnce();
    backward.focus.cycle(true);
    expect(backward.focused[1]).toHaveBeenCalledOnce();
  });

  it("reports nothing to cycle when the panel registered no controls", () => {
    expect(createOverlayFocus().cycle(false)).toBe(false);
  });

  it("drops registrations and rewinds when the panel unmounts", () => {
    const { focus, focused } = registered(2);
    focus.cycle(false);
    expect(focused[0]).toHaveBeenCalledOnce();

    focus.panel(null);
    expect(focus.ordered()).toHaveLength(0);
    // A stale handle here would focus a node that no longer exists.
    expect(focus.cycle(false)).toBe(false);
  });

  it("keeps a control's place when it unmounts and remounts at the same order", () => {
    const { focus, focused } = registered(2);
    focus.cycle(false);
    const replacement = vi.fn();
    focus.focusable(0)(null);
    focus.focusable(0)(handle(replacement) as never);

    focus.cycle(false);
    expect(focused[1]).toHaveBeenCalledOnce();
    expect(replacement).not.toHaveBeenCalled();
  });
});

describe("overlayKeyHandler", () => {
  function event(key: string, shiftKey = false): Record<string, unknown> {
    return { key, shiftKey, preventDefault: vi.fn(), stopPropagation: vi.fn() };
  }

  it("claims Tab only while the panel has something to move to", () => {
    const focus = createOverlayFocus();
    const handler = overlayKeyHandler(focus, vi.fn());

    const ignored = event("Tab");
    handler(ignored as never);
    // Nothing registered: Tab must reach whatever else is listening.
    expect(ignored["preventDefault"]).not.toHaveBeenCalled();

    const focused = vi.fn();
    focus.focusable(0)(handle(focused) as never);
    const claimed = event("Tab");
    handler(claimed as never);
    expect(focused).toHaveBeenCalledOnce();
    expect(claimed["preventDefault"]).toHaveBeenCalledOnce();
    expect(claimed["stopPropagation"]).toHaveBeenCalledOnce();
  });

  it("cycles backward on Shift+Tab", () => {
    const focus = createOverlayFocus();
    const first = vi.fn();
    const last = vi.fn();
    focus.focusable(0)(handle(first) as never);
    focus.focusable(1)(handle(last) as never);
    const handler = overlayKeyHandler(focus, vi.fn());

    handler(event("Tab", true) as never);
    expect(last).toHaveBeenCalledOnce();
    expect(first).not.toHaveBeenCalled();
  });

  it("still closes on Escape and leaves unrelated keys alone", () => {
    const close = vi.fn();
    const focus = createOverlayFocus();
    focus.focusable(0)(handle(vi.fn()) as never);
    const handler = overlayKeyHandler(focus, close);

    handler(event("Escape") as never);
    expect(close).toHaveBeenCalledOnce();

    const other = event("ArrowDown");
    handler(other as never);
    expect(other["preventDefault"]).not.toHaveBeenCalled();
  });

  it("survives a rebuilt handler mid-cycle, because the cursor lives in the registry", () => {
    const focus = createOverlayFocus();
    const focused = [vi.fn(), vi.fn()];
    focus.focusable(0)(handle(focused[0] as () => void) as never);
    focus.focusable(1)(handle(focused[1] as () => void) as never);

    overlayKeyHandler(focus, vi.fn())(event("Tab") as never);
    // A re-render rebuilds the handler; the cycle must not rewind to the first.
    overlayKeyHandler(focus, vi.fn())(event("Tab") as never);
    expect(focused[1]).toHaveBeenCalledOnce();
  });
});

describe("escapeHandler", () => {
  it("claims Escape and leaves every other key alone", () => {
    const close = vi.fn();
    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();
    const handler = escapeHandler(close);

    handler({ key: "Escape", preventDefault, stopPropagation } as never);
    expect(close).toHaveBeenCalledOnce();
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(stopPropagation).toHaveBeenCalledOnce();

    for (const key of ["Enter", " ", "a", "ArrowDown"]) {
      handler({ key, preventDefault, stopPropagation } as never);
    }
    expect(close).toHaveBeenCalledOnce();
    expect(preventDefault).toHaveBeenCalledOnce();
  });
});

describe("dismissHandlers", () => {
  /** A focus event carrying only what the dismissal reads. */
  const focusEvent = (eventId: number, relatedNodeId: number | null): PingoEvent =>
    ({
      eventId,
      relatedTarget: relatedNodeId === null ? null : { nodeId: relatedNodeId },
    }) as unknown as PingoEvent;
  const press = (eventId: number): PingoEvent => ({ eventId }) as unknown as PingoEvent;
  // The decision is deferred by a frame, so the arrival always wins whether it
  // comes from the same batch, a re-entrant Core call, or a later message.
  // Node has no rAF, which is the timer fallback this waits out.
  const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 40));

  it("closes when a press outside moves focus away", async () => {
    const close = vi.fn();
    const handlers = createOverlayFocus().dismissHandlers(close);
    handlers.onFocusOut(focusEvent(7, 99));
    expect(close).not.toHaveBeenCalled();
    await settle();
    expect(close).toHaveBeenCalledOnce();
  });

  it("stays open when the press that moved focus was inside the anchor", async () => {
    const close = vi.fn();
    const handlers = createOverlayFocus().dismissHandlers(close);
    // The press and the focus change it causes share an event id, and a press
    // inside the anchor is dispatched through it.
    handlers.onPointerDownCapture(press(7));
    handlers.onFocusOut(focusEvent(7, 99));
    await settle();
    expect(close).not.toHaveBeenCalled();
  });

  it("stays open when focus goes nowhere at all", async () => {
    const close = vi.fn();
    const handlers = createOverlayFocus().dismissHandlers(close);
    // Core clears focus outright when a focus request names a node it does not
    // have yet -- a panel's own `focus()` overtaking the commit that mounts it.
    handlers.onFocusOut(focusEvent(7, null));
    await settle();
    expect(close).not.toHaveBeenCalled();
  });

  it("stays open when focus comes back, even across a re-render", async () => {
    const close = vi.fn();
    const focus = createOverlayFocus();
    // The departure and the arrival routinely straddle a render: the handlers
    // the arrival reaches are not the ones that raised the departure.
    focus.dismissHandlers(close).onFocusOut(focusEvent(7, 99));
    focus.dismissHandlers(close).onFocusIn(focusEvent(7, 42));
    await settle();
    expect(close).not.toHaveBeenCalled();

    // And the next departure is still armed.
    focus.dismissHandlers(close).onFocusOut(focusEvent(8, 99));
    await settle();
    expect(close).toHaveBeenCalledOnce();
  });

  it("keeps overlays independent of each other", async () => {
    const first = vi.fn();
    const second = vi.fn();
    createOverlayFocus().dismissHandlers(first).onFocusOut(focusEvent(7, 99));
    createOverlayFocus().dismissHandlers(second).onFocusIn(focusEvent(7, 42));
    await settle();
    // One overlay cancelling its own departure must not keep another open.
    expect(first).toHaveBeenCalledOnce();
    expect(second).not.toHaveBeenCalled();
  });
});

describe("classes", () => {
  it("drops empty and undefined parts", () => {
    expect(classes("a", undefined, "", "b")).toBe("a b");
    expect(classes(undefined)).toBe("");
  });
});
