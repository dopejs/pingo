import {
  createElement,
  memo,
  Text,
  View,
  type NodeHandle,
  type PingoEvent,
  type PingoNode,
} from "@dopejs/pingo-jsx";
import { createContext, useContext, useMemo, useSignal } from "@dopejs/pingo-runtime";

import {
  classes,
  OverlayFocusContext,
  overlayKeyHandler,
  useOverlayFocus,
  type OverlayFocus,
} from "../overlay";
import { useAnchoredPlacement, type AnchoredPlacement } from "../use-anchored";
import { useTheme } from "../theme";

/** Gap between an anchored panel and its trigger, matching `$popover-offset`. */
export const ANCHOR_OFFSET = 4;

export type AnchorContextValue = {
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
  readonly focus: OverlayFocus;
  /**
   * Stable fan-out ref for the panel: hands it to focus on mount and to the
   * measurement observer. Memoized so the reconciler does not detach/reattach
   * the ref every render, which would re-focus the panel in a loop.
   */
  readonly panelRef: (handle: NodeHandle | null) => void;
  /**
   * Measured placement, or undefined when readback is off.
   *
   * Undefined means the skin's static side is used, which is exactly the
   * behaviour before E8 and the rollback path when the flag is off.
   */
  readonly placement?: AnchoredPlacement;
};

const AnchorContext = createContext<AnchorContextValue | undefined>(undefined);

export type PopoverProps = {
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly children: PingoNode;
  readonly className?: string;
};

/**
 * Builds the anchor wrapper shared by every anchored overlay.
 *
 * The content is a child of this wrapper and positioned against it, which is
 * what keeps it pinned while the page scrolls: Core derives the geometry from
 * the parent, so nothing repositions per frame.
 */
export function anchorDescriptor(props: {
  readonly children: PingoNode;
  readonly className?: string;
  /** Ref used to measure the box the panel is positioned against. */
  readonly ref?: (handle: NodeHandle | null) => void;
  /**
   * Focus handlers that close the overlay, from `OverlayFocus.dismissHandlers`.
   *
   * On the wrapper rather than on the panel: the trigger, the panel and
   * everything inside either are all within it, so opening, moving into the
   * list and coming back are all internal, and only a press that leaves counts.
   */
  readonly dismiss?: {
    readonly onFocusOut: () => void;
    readonly onFocusIn: () => void;
  };
}): PingoNode {
  return View({
    className: classes("pui-anchor", props.className),
    ...(props.ref === undefined ? {} : { ref: props.ref }),
    ...(props.dismiss ?? {}),
    children: props.children,
  });
}

/** shadcn-style popover root. JSX-only: uses hooks. */
export const Popover = memo(function PopoverImpl(props: PopoverProps): PingoNode {
  const internal = useSignal(props.defaultOpen === true);
  const focus = useOverlayFocus();
  // .get() (not .peek()): the root subscribes to its own signal so an
  // uncontrolled toggle re-renders it and republishes the context value.
  const open = props.open ?? internal.get();
  const placement = useAnchoredPlacement(open, "bottom", ANCHOR_OFFSET);
  // Fan-out the panel to focus and to the measurement observer once, memoized:
  // both halves are stable, so a fresh inline ref each render would make the
  // reconciler detach/reattach and re-focus the panel every frame.
  const panelRef = useMemo(
    () => (handle: NodeHandle | null) => {
      focus.panel(handle);
      placement.panelRef(handle);
    },
    [focus, placement.panelRef],
  );
  const value: AnchorContextValue = {
    open,
    setOpen: (next) => {
      internal.set(next);
      props.onOpenChange?.(next);
    },
    focus,
    panelRef,
    placement,
  };
  return createElement(AnchorContext.Provider, {
    value,
    // Nested rather than folded into AnchorContext: useFocusableRef serves
    // every overlay kind, so it reads one context regardless of which built it.
    children: createElement(OverlayFocusContext.Provider, {
      value: focus,
      children: anchorDescriptor({
        ...props,
        ref: placement.anchorRef,
        dismiss: focus.dismissHandlers(() => value.setOpen(false)),
      }),
    }),
  });
});

export type AnchorTriggerProps = { readonly children: PingoNode; readonly className?: string };

/** Pure builder: safe to call without a component scope (tests use this). */
export function anchorTriggerDescriptor(
  props: AnchorTriggerProps,
  context: AnchorContextValue | undefined,
): PingoNode {
  const toggle = (): void => context?.setOpen(!(context.open ?? false));
  return View({
    className: classes("pui-anchor__trigger", props.className),
    semanticRole: "button",
    semanticValue: context?.open === true ? "expanded" : "collapsed",
    ...(context === undefined ? {} : { ref: context.focus.trigger }),
    onPointerDown: (event: PingoEvent): void => event.currentTarget.focus(),
    onTap: toggle,
    onClick: toggle,
    children: props.children,
  });
}

/** shadcn-style popover trigger. JSX-only: reads the root via context. */
export const PopoverTrigger = memo(function PopoverTriggerImpl(
  props: AnchorTriggerProps,
): PingoNode {
  return anchorTriggerDescriptor(props, useContext(AnchorContext));
});

export type AnchorContentProps = {
  readonly children: PingoNode;
  readonly className?: string;
};

/** Pure builder: safe to call without a component scope (tests use this). */
export function anchorContentDescriptor(
  props: AnchorContentProps,
  context: AnchorContextValue | undefined,
  extra?: string,
): PingoNode {
  if (context?.open !== true) return null;
  const dark = useTheme() === "dark" ? "pui-dark" : undefined;
  const placement = context.placement;
  return View({
    className: classes("pui-anchor__content", extra, dark, props.className),
    // One stable ref for focus handoff and measurement: the root memoizes it
    // so an identity change does not re-focus the panel every render.
    ref: context.panelRef,
    // No style at all when unmeasured, so the skin's static side stands and the
    // rendered tree is identical to the pre-E8 one.
    ...(placement?.style === undefined ? {} : { style: placement.style }),
    onKeyDown: overlayKeyHandler(context.focus, () => context.setOpen(false)),
    children: props.children,
  });
}

/** shadcn-style popover surface. JSX-only: reads the root via context. */
export const PopoverContent = memo(function PopoverContentImpl(
  props: AnchorContentProps,
): PingoNode {
  return anchorContentDescriptor(props, useContext(AnchorContext));
});

export type TooltipProps = {
  readonly content: string;
  readonly children: PingoNode;
  readonly className?: string;
};

/** Pure builder: safe to call without a component scope (tests use this). */
export function tooltipDescriptor(
  props: TooltipProps,
  visible: boolean,
  setVisible: (visible: boolean) => void,
  placement?: AnchoredPlacement,
): PingoNode {
  const dark = useTheme() === "dark" ? "pui-dark" : undefined;
  return View({
    className: classes("pui-anchor", props.className),
    ...(placement === undefined ? {} : { ref: placement.anchorRef }),
    onPointerEnter: (): void => setVisible(true),
    onPointerLeave: (): void => setVisible(false),
    children: [
      props.children,
      visible
        ? View({
            className: classes("pui-anchor__content", "pui-tooltip__content", dark),
            semanticRole: "tooltip",
            ...(placement === undefined ? {} : { ref: placement.panelRef }),
            ...(placement?.style === undefined ? {} : { style: placement.style }),
            children: Text({ value: props.content }),
          })
        : null,
    ],
  });
}

/**
 * shadcn-style tooltip. JSX-only: uses hooks.
 *
 * Shown on pointer enter rather than on focus: a focus-driven tooltip needs a
 * focus-visible signal the component cannot see from here.
 */
export const Tooltip = memo(function TooltipImpl(props: TooltipProps): PingoNode {
  const visible = useSignal(false);
  const open = visible.get();
  return tooltipDescriptor(
    props,
    open,
    (next) => visible.set(next),
    useAnchoredPlacement(open, "top", ANCHOR_OFFSET),
  );
});
