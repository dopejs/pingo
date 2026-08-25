import { memo, View, type PingoEvent, type PingoNode } from "@dopejs/pingo-jsx";
import { useMemo, useSignal } from "@dopejs/pingo-runtime";

import { classes } from "../overlay";
import { skin } from "../theme";
import { useAnchoredPlacement, type AnchoredPlacement } from "../use-anchored";

import { ANCHOR_OFFSET, anchorDescriptor } from "./popover";

export type HoverCardProps = {
  readonly children: PingoNode;
  readonly content: PingoNode;
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  /** Delay before opening, in milliseconds. */
  readonly openDelayMs?: number;
  /** Delay before closing, so crossing the gap to the card does not dismiss it. */
  readonly closeDelayMs?: number;
  readonly className?: string;
};

/**
 * Pure builder: safe to call without a component scope (tests use this).
 *
 * `placement` is undefined outside a component scope, and then the skin's
 * static side stands. Measuring is what puts the card under its trigger: the
 * skin says `top: 100%`, and an out-of-flow child resolves that against the
 * parent's constraint rather than its used height, so an unmeasured card
 * landed a stage-height below the trigger and off the surface entirely.
 */
export function hoverCardDescriptor(
  props: HoverCardProps,
  open: boolean,
  schedule: (open: boolean) => void,
  placement?: AnchoredPlacement,
): PingoNode {
  return anchorDescriptor({
    className: classes("pui-hover-card", props.className),
    ...(placement === undefined ? {} : { ref: placement.anchorRef }),
    children: [
      View({
        className: "pui-hover-card__trigger",
        // Pointer enter/leave rather than a CSS hover rule: the card has to
        // outlive the pointer leaving the trigger, and a style cannot wait.
        onPointerEnter: (): void => schedule(true),
        onPointerLeave: (): void => schedule(false),
        onPointerDown: (event: PingoEvent): void => event.currentTarget.focus(),
        onFocus: (): void => schedule(true),
        onBlur: (): void => schedule(false),
        children: props.children,
      }),
      open
        ? View({
            className: skin("pui-hover-card__content"),
            ...(placement === undefined ? {} : { ref: placement.panelRef }),
            ...(placement?.style === undefined ? {} : { style: placement.style }),
            // The card keeps itself open while the pointer is over it, which is
            // what makes the close delay usable rather than merely generous.
            onPointerEnter: (): void => schedule(true),
            onPointerLeave: (): void => schedule(false),
            children: props.content,
          })
        : null,
    ],
  });
}

/** shadcn-style hover card. JSX-only: uses hooks. */
export const HoverCard = memo(function HoverCardImpl(props: HoverCardProps): PingoNode {
  const openSignal = useSignal(false);
  const timer = useMemo(
    () => ({ handle: undefined as ReturnType<typeof setTimeout> | undefined }),
    [],
  );
  // .get() (not .peek()): the delayed open must re-render this component.
  const open = props.open ?? openSignal.get();
  const placement = useAnchoredPlacement(open, "bottom", ANCHOR_OFFSET);
  const schedule = (next: boolean): void => {
    if (timer.handle !== undefined) clearTimeout(timer.handle);
    const delay = next ? (props.openDelayMs ?? 300) : (props.closeDelayMs ?? 200);
    timer.handle = setTimeout(() => {
      timer.handle = undefined;
      openSignal.set(next);
      props.onOpenChange?.(next);
    }, delay);
  };
  return hoverCardDescriptor(props, open, schedule, placement);
});
