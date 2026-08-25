import { memo, View, type PingoNode, type VirtualViewProps } from "@dopejs/pingo-jsx";

import { classes } from "../overlay";
import { skin } from "../theme";

export type ScrollAreaProps = {
  /** Items to scroll. Mutually exclusive with `virtual`. */
  readonly children?: PingoNode;
  /**
   * Bounded data window, for a list too long to materialize.
   *
   * Virtualization is a View-level contract in this engine, not a component:
   * the viewport takes the window and Core plans it, so a scroll area does not
   * have to become a different component to hold a million rows. It is never
   * inferred -- overflow alone scrolls, it does not virtualize.
   */
  readonly virtual?: VirtualViewProps;
  /** Hides the scrollbar; Core still scrolls. Maps to `scrollbar-width: none`. */
  readonly hideScrollbar?: boolean;
  /** Draws the narrow bar instead of the default one. */
  readonly thinScrollbar?: boolean;
  readonly className?: string;
};

/** Pure builder: safe to call without a component scope (tests use this). */
export function scrollAreaDescriptor(props: ScrollAreaProps): PingoNode {
  const viewport = classes(
    "pui-scroll-area__viewport",
    props.hideScrollbar === true ? "pui-scroll-area__viewport--bare" : undefined,
    props.thinScrollbar === true ? "pui-scroll-area__viewport--thin" : undefined,
  );
  return View({
    className: skin("pui-scroll-area", props.className),
    children:
      props.virtual === undefined
        ? View({
            className: viewport,
            children: View({ className: "pui-scroll-area__content", children: props.children }),
          })
        : // The window goes on the viewport itself: Core plans it against the
          // box that scrolls, and an inner wrapper would not be that box.
          View({ className: viewport, virtual: props.virtual }),
  });
}

/**
 * shadcn-style scroll area. Core owns the scrolling and the scrollbar.
 *
 * The bar used to be Shell-drawn: the component observed the scrolled content's
 * box, derived the thumb from it and re-rendered. That made every scroll frame
 * a Shell render and a commit -- two presented frames per scroll step, the
 * content moving in one and the thumb catching up in the next -- and it put a
 * measurement that is a frame late in the middle of a gesture. Core draws the
 * bar from the scroll state it already owns, so a scroll frame costs the Shell
 * nothing at all.
 */
export const ScrollArea = memo(function ScrollAreaImpl(props: ScrollAreaProps): PingoNode {
  return scrollAreaDescriptor(props);
});
