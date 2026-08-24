import { memo, Svg, Text, View, type PingoNode, type PingoSvg } from "@dopejs/pingo-jsx";

import { useTheme } from "../theme";

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

function join(...parts: readonly (string | undefined)[]): string {
  return parts.filter((part) => part !== undefined && part !== "").join(" ");
}

function AlertImpl(props: AlertProps): PingoNode {
  const theme = useTheme();
  const dark = theme === "dark" ? "pui-dark" : undefined;
  const destructive = props.variant === "destructive";
  const body = [
    Text({
      className: join(
        "pui-alert__title",
        destructive ? "pui-alert__title--destructive" : undefined,
        dark,
      ),
      value: props.title,
    }),
    Text({ className: join("pui-alert__description", dark), value: props.children }),
  ];
  return View({
    className: join(
      "pui-alert",
      destructive ? "pui-alert--destructive" : undefined,
      dark,
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
                className: join(
                  "pui-alert__icon",
                  destructive ? "pui-alert__icon--destructive" : undefined,
                  dark,
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
