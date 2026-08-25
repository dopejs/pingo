import { memo, Svg, Text, View, type PingoEvent, type PingoNode } from "@dopejs/pingo-jsx";

import { CloseIcon } from "../icons";
import { classes } from "../overlay";
import { skin } from "../theme";

export type ToastVariant = "default" | "destructive";

export type ToastProps = {
  readonly open: boolean;
  readonly title: string;
  readonly description?: string;
  readonly variant?: ToastVariant;
  /** Dismiss affordance. Omit for a toast the caller retires on a timer. */
  readonly onClose?: () => void;
  readonly className?: string;
};

/** Pure builder: safe to call without a component scope (tests use this). */
export function toastDescriptor(props: ToastProps): PingoNode {
  if (!props.open) return null;
  const destructive = props.variant === "destructive";
  return View({
    className: skin(
      classes("pui-toast", destructive ? "pui-toast--destructive" : undefined),
      props.className,
    ),
    semanticRole: "status",
    children: [
      Text({ className: "pui-toast__title", value: props.title }),
      ...(props.description === undefined
        ? []
        : [
            Text({
              // A destructive toast already inverts its foreground; muting it
              // again would put grey on red.
              className: destructive ? "" : skin("pui-toast__description"),
              value: props.description,
            }),
          ]),
      // shadcn's ToastClose, and the only way to retire a toast by hand. It is
      // absolutely positioned so it does not join the text column's flow.
      ...(props.onClose === undefined
        ? []
        : [
            View({
              className: skin("pui-toast__close"),
              semanticRole: "button",
              semanticLabel: "关闭",
              onPointerDown: (event: PingoEvent): void => event.currentTarget.focus(),
              onTap: () => props.onClose?.(),
              onClick: () => props.onClose?.(),
              children: Svg({
                className: skin(
                  classes(
                    "pui-toast__close-icon",
                    destructive ? "pui-toast__close-icon--destructive" : undefined,
                  ),
                ),
                source: CloseIcon,
              }),
            }),
          ]),
    ],
  });
}

/** shadcn-style toast. Uses no hooks: `Toast.component(props)` is safe directly. */
export const Toast = memo(toastDescriptor);

export type ToastViewportProps = { readonly children: PingoNode; readonly className?: string };

/**
 * Corner stack for toasts.
 *
 * Absolutely positioned against *its own parent*, because the containing block
 * in this engine is the parent rather than the nearest positioned ancestor.
 * Mount it near the root; see apps/site/content/guide/style-support.md.
 */
export const ToastViewport = memo(function ToastViewportImpl(props: ToastViewportProps): PingoNode {
  return View({
    className: classes("pui-toast__viewport", props.className),
    children: props.children,
  });
});
