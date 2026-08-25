import { memo, Svg, Text, View, type PingoNode, type PingoSvg } from "@dopejs/pingo-jsx";

import { classes, skin } from "../theme";

export type AlertVariant = "default" | "destructive";

// Type alias (not interface) so the implicit index signature satisfies
// memo's Props extends Record<string, unknown> constraint.
export type AlertProps = {
  readonly title: string;
  readonly children: string;
  readonly variant?: AlertVariant;
  /** Leading icon, as shadcn's `[&>svg]` slot. Omit for a text-only callout. */
  readonly icon?: PingoSvg;
  readonly className?: string;
};

function AlertImpl(props: AlertProps): PingoNode {
  const destructive = props.variant === "destructive";
  const body = [
    Text({
      className: skin(
        classes("pui-alert__title", destructive ? "pui-alert__title--destructive" : undefined),
      ),
      value: props.title,
    }),
    Text({ className: skin("pui-alert__description"), value: props.children }),
  ];
  return View({
    className: skin(
      classes("pui-alert", destructive ? "pui-alert--destructive" : undefined),
      props.className,
    ),
    // With an icon the callout is a row of icon plus text column, as shadcn
    // lays it out; without one it stays the plain column it always was, so
    // every existing caller renders byte-identically.
    children:
      props.icon === undefined
        ? body
        : View({
            className: "pui-alert__row",
            children: [
              Svg({
                className: skin(
                  classes(
                    "pui-alert__icon",
                    destructive ? "pui-alert__icon--destructive" : undefined,
                  ),
                ),
                source: props.icon,
              }),
              View({ className: "pui-alert__body", children: body }),
            ],
          }),
  });
}

/** shadcn-style alert callout. Memoized: re-renders only when props change. */
export const Alert = memo(AlertImpl);
