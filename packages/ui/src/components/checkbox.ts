import { memo, Svg, Text, View, type PingoEvent, type PingoNode } from "@dopejs/pingo-jsx";
import { useSignal } from "@dopejs/pingo-runtime";

import { CheckIcon } from "../icons";
import { classes, skin } from "../theme";

// Type alias (not interface) so the implicit index signature satisfies
// memo's Props extends Record<string, unknown> constraint.
export type CheckboxProps = {
  /** Controlled state. Omit it to let the component own its own. */
  readonly checked?: boolean;
  /** Initial state when uncontrolled, matching Slider/Tabs/Collapsible. */
  readonly defaultChecked?: boolean;
  readonly onCheckedChange?: (checked: boolean) => void;
  readonly disabled?: boolean;
  readonly label?: string;
  readonly className?: string;
  readonly semanticLabel?: string;
};

/** Pure builder: safe to call without a component scope (tests use this). */
export function checkboxDescriptor(
  props: CheckboxProps,
  checked: boolean,
  toggle: () => void,
): PingoNode {
  const disabled = props.disabled === true;
  return View({
    className: skin(
      classes("pui-checkbox", disabled ? "pui-checkbox--disabled" : undefined),
      props.className,
    ),
    direction: "row",
    semanticRole: "checkbox",
    semanticValue: disabled ? "disabled" : checked ? "checked" : "unchecked",
    ...(props.semanticLabel === undefined ? {} : { semanticLabel: props.semanticLabel }),
    ...(disabled
      ? {}
      : {
          onPointerDown: (event: PingoEvent): void => event.currentTarget.focus(),
          onTap: toggle,
          onClick: toggle,
        }),
    children: [
      View({
        className: skin(
          classes("pui-checkbox__box", checked ? "pui-checkbox__box--checked" : undefined),
        ),
        children: checked
          ? Svg({
              className: skin("pui-checkbox__indicator"),
              source: CheckIcon,
            })
          : null,
      }),
      ...(props.label === undefined
        ? []
        : [
            Text({
              className: skin(classes("pui-label", "pui-checkbox__label")),
              value: props.label,
            }),
          ]),
    ],
  });
}

/**
 * shadcn-style checkbox, controlled or not.
 *
 * Pass `checked` to own the state, or `defaultChecked` (or neither) to let the
 * component own it — the same duality as Slider, Tabs and Collapsible. A
 * controlled checkbox whose owner ignores `onCheckedChange` never changes, which
 * is correct but reads as a dead control.
 *
 * JSX-only: uses hooks. Call `checkboxDescriptor` for the tree without them.
 * Memoized.
 */
export const Checkbox = memo(function CheckboxImpl(props: CheckboxProps): PingoNode {
  const internal = useSignal(props.defaultChecked ?? false);
  // .get() (not .peek()): an uncontrolled toggle has to re-render this.
  const checked = props.checked ?? internal.get();
  return checkboxDescriptor(props, checked, () => {
    const next = !checked;
    internal.set(next);
    props.onCheckedChange?.(next);
  });
});
