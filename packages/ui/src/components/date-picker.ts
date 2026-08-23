import {
  createElement,
  memo,
  Svg,
  Text,
  View,
  type PingoEvent,
  type PingoNode,
} from "@dopejs/pingo-jsx";
import { useSignal } from "@dopejs/pingo-runtime";

import { ChevronDownIcon } from "../icons";
import { classes, OverlayFocusContext, useOverlayFocus } from "../overlay";
import { useTheme } from "../theme";
import { useAnchoredPlacement, type AnchoredPlacement } from "../use-anchored";

import { calendarDescriptor, type CalendarDate, type CalendarProps } from "./calendar";
import { ANCHOR_OFFSET, anchorDescriptor } from "./popover";

export type DatePickerProps = Omit<CalendarProps, "className"> & {
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly placeholder?: string;
  readonly format?: (date: CalendarDate) => string;
  readonly className?: string;
};

/** Zero-padded ISO-like rendering, with no time zone to get wrong. */
export function formatDate(date: CalendarDate): string {
  const pad = (value: number): string => String(value).padStart(2, "0");
  return `${String(date.year)}-${pad(date.month)}-${pad(date.day)}`;
}

/** Pure builder: safe to call without a component scope (tests use this). */
export function datePickerDescriptor(
  props: DatePickerProps,
  state: {
    readonly open: boolean;
    readonly month: CalendarDate;
    readonly setOpen: (open: boolean) => void;
    readonly setMonth: (month: CalendarDate) => void;
    /**
     * Measured placement, or undefined outside a component scope.
     *
     * The skin cannot place the panel on its own: `top: 100%` needs a
     * percentage basis the engine only has once the anchor's height is
     * definite, and a column's is not, so the panel landed on top of its own
     * trigger. Measuring is the same path Popover and the menus already take.
     */
    readonly placement?: AnchoredPlacement;
  },
): PingoNode {
  const dark = useTheme() === "dark" ? "pui-dark" : undefined;
  const toggle = (): void => state.setOpen(!state.open);
  return anchorDescriptor({
    className: classes("pui-date-picker", props.className),
    ...(state.placement === undefined ? {} : { ref: state.placement.anchorRef }),
    onDismiss: () => state.setOpen(false),
    children: [
      View({
        className: classes("pui-date-picker__trigger", dark),
        direction: "row",
        semanticRole: "button",
        semanticValue: state.open ? "expanded" : "collapsed",
        onPointerDown: (event: PingoEvent): void => event.currentTarget.focus(),
        onTap: toggle,
        onClick: toggle,
        children: [
          Text({
            className: classes(
              "pui-date-picker__value",
              props.value === undefined ? "pui-date-picker__value--placeholder" : undefined,
              dark,
            ),
            value:
              props.value === undefined
                ? (props.placeholder ?? "选择日期")
                : (props.format ?? formatDate)(props.value),
          }),
          // Says the trigger opens something, the way the select and combobox
          // triggers do.
          Svg({ className: classes("pui-date-picker__indicator", dark), source: ChevronDownIcon }),
        ],
      }),
      state.open
        ? View({
            className: classes("pui-date-picker__content", dark),
            ...(state.placement === undefined ? {} : { ref: state.placement.panelRef }),
            ...(state.placement?.style === undefined ? {} : { style: state.placement.style }),
            children: calendarDescriptor(
              {
                ...props,
                onMonthChange: state.setMonth,
                onSelect: (date) => {
                  props.onSelect?.(date);
                  // Closing on choice is the whole point of the picker; a
                  // calendar that stays open is just a calendar.
                  state.setOpen(false);
                },
              },
              state.month,
            ),
          })
        : null,
    ],
  });
}

/** shadcn-style date picker: a Calendar in a Popover, bound to a value. */
export const DatePicker = memo(function DatePickerImpl(props: DatePickerProps): PingoNode {
  const openSignal = useSignal(false);
  const monthSignal = useSignal<CalendarDate>(
    props.defaultMonth ?? props.value ?? { year: 2026, month: 1, day: 1 },
  );
  const focus = useOverlayFocus();
  // .get() (not .peek()): opening and paging must re-render this component.
  const open = props.open ?? openSignal.get();
  const placement = useAnchoredPlacement(open, "bottom", ANCHOR_OFFSET);
  return createElement(OverlayFocusContext.Provider, {
    value: focus,
    children: datePickerDescriptor(props, {
      open,
      placement,
      month: props.month ?? monthSignal.get(),
      setOpen: (next) => {
        openSignal.set(next);
        props.onOpenChange?.(next);
      },
      setMonth: (next) => {
        monthSignal.set(next);
        props.onMonthChange?.(next);
      },
    }),
  });
});
