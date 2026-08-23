import { TextEditingController, type EditTransaction } from "@dopejs/pingo-editing";
import {
  Input as EngineInput,
  memo,
  View,
  type EditableInputMode,
  type NodeHandle,
  type PingoEvent,
  type PingoNode,
} from "@dopejs/pingo-jsx";
import { useMemo, useRef, type RefObject } from "@dopejs/pingo-runtime";

import { useTheme } from "../theme";

// Type alias (not interface) so the implicit index signature satisfies
// memo's Props extends Record<string, unknown> constraint.
export type InputProps = {
  /** Initial value for uncontrolled usage; ignored when `controller` is set. */
  readonly value?: string;
  /** Called after each edit transaction with the controller-applied value. */
  readonly onValueChange?: (value: string) => void;
  /** Advanced escape hatch: caller-owned durable controller. */
  readonly controller?: TextEditingController;
  readonly onTransaction?: (transaction: EditTransaction) => void;
  readonly onSubmit?: () => void;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly password?: boolean;
  readonly inputMode?: EditableInputMode;
  readonly className?: string;
  readonly width?: number;
  readonly semanticLabel?: string;
  /** Leading adornment, for example an icon or a currency symbol. */
  readonly prefix?: PingoNode;
  /** Trailing adornment, for example a unit or a clear affordance. */
  readonly suffix?: PingoNode;
};

/**
 * Hands a press that landed on the decoration to the editable inside it.
 *
 * The editable covers only the box its own text needs: the border, the padding
 * and the adornments belong to the wrapper, so a press on any of them hit no
 * editable at all and did nothing — roughly half the area of something that
 * looks like a single field. A press that did reach the editable is left alone:
 * Core already focuses it and places the caret at the press, and focusing again
 * from here would run first and suppress that placement.
 */
export function focusField(field: RefObject<NodeHandle | null>): (event: PingoEvent) => void {
  return (event) => {
    if (event.target.nodeId === field.current?.nodeId) return;
    field.current?.focus();
  };
}

/**
 * Builds the Input descriptor tree. Pure: safe to call without a component scope.
 *
 * `field` is optional so the descriptor stays callable outside a component; the
 * component supplies one, and without it the decorated area around the editable
 * is inert.
 */
export function inputDescriptor(
  props: InputProps,
  controller: TextEditingController,
  field?: RefObject<NodeHandle | null>,
): PingoNode {
  const theme = useTheme();
  const disabled = props.disabled === true;
  const readOnly = disabled || props.readOnly === true;
  // pingo has no descendant selectors, so each themed element carries its own
  // dark marker, matching the Card sub-element convention.
  const slotClass = (name: string): string => (theme === "dark" ? `${name} pui-dark` : name);
  return View({
    className: [
      "pui-input",
      disabled ? "pui-input--disabled" : undefined,
      theme === "dark" ? "pui-dark" : undefined,
      props.className,
    ]
      .filter((part) => part !== undefined && part !== "")
      .join(" "),
    ...(props.width === undefined ? {} : { width: props.width }),
    ...(field === undefined || disabled ? {} : { onPointerDown: focusField(field) }),
    children: [
      props.prefix === undefined
        ? undefined
        : View({ className: slotClass("pui-input__prefix"), children: props.prefix }),
      EngineInput({
        className: "pui-input__field",
        ...(field === undefined ? {} : { ref: field }),
        controller,
        readOnly,
        ...(props.password === undefined ? {} : { password: props.password }),
        ...(props.inputMode === undefined ? {} : { inputMode: props.inputMode }),
        ...(props.semanticLabel === undefined ? {} : { semanticLabel: props.semanticLabel }),
        onTransaction: (transaction) => {
          // The reconciler applies the transaction to the controller BEFORE
          // invoking this callback (reconciler.ts controller wiring), so
          // controller.value is already current here.
          props.onValueChange?.(controller.value);
          props.onTransaction?.(transaction);
        },
        ...(props.onSubmit === undefined ? {} : { onSubmit: props.onSubmit }),
      }),
      props.suffix === undefined
        ? undefined
        : View({ className: slotClass("pui-input__suffix"), children: props.suffix }),
    ].filter((child) => child !== undefined),
  });
}

/**
 * shadcn-style decorated input. MUST be used as a JSX component
 * (createElement(Input, props) / <Input />) — it uses hooks to keep the
 * editing controller stable across renders; calling `.component(props)` as a
 * plain function throws outside a component scope. Memoized: re-renders only
 * when props change — hits require stable handler references (an inline
 * `onValueChange` defeats memo, same semantics as every memo'd component).
 * Known gaps (tracked in the capability plan): no placeholder, no focus ring.
 */
export const Input = memo(function InputImpl(props: InputProps): PingoNode {
  // Deps [] intentionally capture the initial controller/value: a later
  // `controller` prop change is ignored — callers owning a controller should
  // keep passing the same instance for the component's lifetime.
  const controller = useMemo(
    () => props.controller ?? new TextEditingController({ value: props.value ?? "" }),
    [],
  );
  const field = useRef<NodeHandle | null>(null);
  return inputDescriptor(props, controller, field);
});
