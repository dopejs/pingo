import { memo, View, type PingoEvent, type PingoNode } from "@dopejs/pingo-jsx";
import { useSignal } from "@dopejs/pingo-runtime";

import { classes, skin } from "../theme";

// Type alias (not interface) so the implicit index signature satisfies
// memo's Props extends Record<string, unknown> constraint.
export type SwitchProps = {
  /** Controlled state. Omit it to let the component own its own. */
  readonly checked?: boolean;
  /** Initial state when uncontrolled, matching Slider/Tabs/Collapsible. */
  readonly defaultChecked?: boolean;
  readonly onCheckedChange?: (checked: boolean) => void;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly semanticLabel?: string;
};

/** Pure builder: safe to call without a component scope (tests use this). */
export function switchDescriptor(
  props: SwitchProps,
  checked: boolean,
  toggle: () => void,
): PingoNode {
  const disabled = props.disabled === true;
  return View({
    className: skin(
      classes(
        "pui-switch",
        checked ? "pui-switch--checked" : undefined,
        disabled ? "pui-switch--disabled" : undefined,
      ),
      props.className,
    ),
    semanticRole: "switch",
    semanticValue: disabled ? "disabled" : checked ? "on" : "off",
    ...(props.semanticLabel === undefined ? {} : { semanticLabel: props.semanticLabel }),
    ...(disabled
      ? {}
      : {
          onPointerDown: (event: PingoEvent): void => event.currentTarget.focus(),
          onTap: toggle,
          onClick: toggle,
        }),
    children: View({
      className: skin(
        classes("pui-switch__thumb", checked ? "pui-switch__thumb--checked" : undefined),
      ),
    }),
  });
}

/**
 * shadcn-style switch, controlled or not.
 *
 * Pass `checked` to own the state, or `defaultChecked` (or neither) to let the
 * component own it — the same duality as Slider, Tabs and Collapsible. A
 * controlled switch whose owner ignores `onCheckedChange` never moves, which is
 * correct but reads as a dead control.
 *
 * JSX-only: uses hooks. Call `switchDescriptor` for the tree without them.
 * Memoized.
 */
export const Switch = memo(function SwitchImpl(props: SwitchProps): PingoNode {
  const internal = useSignal(props.defaultChecked ?? false);
  // .get() (not .peek()): an uncontrolled toggle has to re-render this.
  const checked = props.checked ?? internal.get();
  return switchDescriptor(props, checked, () => {
    const next = !checked;
    internal.set(next);
    props.onCheckedChange?.(next);
  });
});
