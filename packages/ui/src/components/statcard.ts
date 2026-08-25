import { memo, Text, View, type PingoNode } from "@dopejs/pingo-jsx";

import { classes } from "../overlay";
import { skin } from "../theme";

export type StatTrend = "up" | "down" | "flat";

// Type alias (not interface) so the implicit index signature satisfies
// memo's Props extends Record<string, unknown> constraint.
export type StatCardProps = {
  readonly label: string;
  readonly value: string;
  /** Change since the comparison period, for example `+12.5%`. */
  readonly delta?: string;
  readonly trend?: StatTrend;
  readonly description?: string;
  readonly className?: string;
};

/**
 * Pure builder: safe to call without a component scope (tests use this).
 *
 * `trend` colours the delta and nothing else; `flat` stays muted rather than
 * picking a direction, because a flat metric is neither good nor bad.
 */
export function statCardDescriptor(props: StatCardProps): PingoNode {
  const trend = props.trend ?? "flat";
  return View({
    className: skin("pui-statcard", props.className),
    semanticRole: "group",
    semanticLabel: props.label,
    children: [
      Text({ className: skin("pui-statcard__label"), value: props.label }),
      View({
        className: "pui-statcard__row",
        children: [
          Text({ className: "pui-statcard__value", value: props.value }),
          ...(props.delta === undefined
            ? []
            : [
                Text({
                  className: skin(
                    classes(
                      "pui-statcard__delta",
                      trend === "flat" ? undefined : `pui-statcard__delta--${trend}`,
                    ),
                  ),
                  value: props.delta,
                }),
              ]),
        ],
      }),
      ...(props.description === undefined
        ? []
        : [
            Text({
              className: skin("pui-statcard__description"),
              value: props.description,
            }),
          ]),
    ],
  });
}

/** Metric tile. Memoized: re-renders only when props change. */
export const StatCard = memo(statCardDescriptor);
