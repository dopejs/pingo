import {
  createElement,
  memo,
  Svg,
  Text,
  View,
  type NodeHandle,
  type PingoEvent,
  type PingoNode,
} from "@dopejs/pingo-jsx";
import { createContext, useContext, useMemo, useSignal } from "@dopejs/pingo-runtime";

import { ChevronDownIcon } from "../icons";
import { labelledValues, orderedValues, step } from "../keyboard";
import { classes, escapeHandler, useOverlayFocus, type OverlayFocus } from "../overlay";
import { skin, useTheme } from "../theme";
import { anchorDescriptor } from "./popover";
import { useAnchoredPlacement, type AnchoredPlacement } from "../use-anchored";

/** Gap between an anchor and its panel, matching `$popover-offset`. */
const ANCHOR_OFFSET = 4;

export type MenuContextValue = {
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
  /** Selected value, for a Select; a plain menu has none. */
  readonly value: string | undefined;
  readonly onSelect: (value: string) => void;
  /** Value the keyboard cursor sits on. */
  readonly active: string | undefined;
  readonly setActive: (value: string | undefined) => void;
  readonly focus: OverlayFocus;
  readonly registerItem: (value: string, handle: NodeHandle | null) => void;
  readonly focusItem: (value: string) => void;
  /** The item's own text for a value, so the trigger shows it and not the id. */
  readonly labelFor: (value: string) => string | undefined;
  /**
   * Stable fan-out ref for the panel: focus handoff plus measurement,
   * memoized so the reconciler does not re-focus the panel every render.
   */
  readonly panelRef: (handle: NodeHandle | null) => void;
  /** Measured placement, or undefined when readback is off. See Popover. */
  readonly placement?: AnchoredPlacement;
};

const MenuContext = createContext<MenuContextValue | undefined>(undefined);

export type MenuRootProps = {
  readonly value?: string;
  /**
   * Initial selection when the caller does not hold `value`.
   *
   * A Select had no uncontrolled mode at all: `value` was the only way in, so
   * a caller who just wanted a working select had to wire state for it. shadcn
   * takes `defaultValue` here and so does every other control in this library.
   */
  readonly defaultValue?: string;
  readonly defaultOpen?: boolean;
  readonly onValueChange?: (value: string) => void;
  readonly onOpenChange?: (open: boolean) => void;
  readonly children: PingoNode;
  readonly className?: string;
};

function MenuRoot(props: MenuRootProps, closeOnSelect: boolean): PingoNode {
  const openSignal = useSignal(props.defaultOpen === true);
  const valueSignal = useSignal<string | undefined>(props.defaultValue);
  const activeSignal = useSignal<string | undefined>(undefined);
  const focus = useOverlayFocus();
  const handles = useMemo(() => new Map<string, NodeHandle>(), []);
  const open = openSignal.get();
  const placement = useAnchoredPlacement(open, "bottom", ANCHOR_OFFSET);
  // Stable fan-out ref so the reconciler does not re-focus the panel each render.
  const panelRef = useMemo(
    () => (handle: NodeHandle | null) => {
      focus.panel(handle);
      placement.panelRef(handle);
    },
    [focus, placement.panelRef],
  );
  // Read from the descriptor tree rather than from mounted items: a closed
  // Select renders no content at all, so nothing has registered itself yet
  // when the trigger first has to name the selected value.
  const labels = labelledValues(props.children);
  const value: MenuContextValue = {
    open,
    setOpen: (next) => {
      openSignal.set(next);
      if (!next) activeSignal.set(undefined);
      props.onOpenChange?.(next);
    },
    // .get() (not .peek()): an uncontrolled choice must re-render the root so
    // the trigger and the checked item both follow it.
    value: props.value ?? valueSignal.get(),
    onSelect: (selected) => {
      valueSignal.set(selected);
      props.onValueChange?.(selected);
      if (closeOnSelect) {
        openSignal.set(false);
        activeSignal.set(undefined);
        props.onOpenChange?.(false);
      }
    },
    active: activeSignal.get(),
    setActive: (next) => activeSignal.set(next),
    focus,
    registerItem: (item, handle) => {
      if (handle === null) handles.delete(item);
      else handles.set(item, handle);
    },
    focusItem: (item) => handles.get(item)?.focus(),
    labelFor: (item) => labels.get(item),
    panelRef,
    placement,
  };
  return createElement(MenuContext.Provider, {
    value,
    children: anchorDescriptor({
      ...props,
      ref: placement.anchorRef,
      dismiss: focus.dismissHandlers(() => value.setOpen(false)),
    }),
  });
}

/** shadcn-style dropdown menu root. JSX-only: uses hooks. */
export const DropdownMenu = memo(function DropdownMenuImpl(props: MenuRootProps): PingoNode {
  return MenuRoot(props, true);
});

/** shadcn-style select root. JSX-only: uses hooks. */
export const Select = memo(function SelectImpl(props: MenuRootProps): PingoNode {
  return MenuRoot(props, true);
});

export type MenuTriggerProps = {
  readonly children?: PingoNode;
  readonly placeholder?: string;
  readonly className?: string;
};

/** Pure builder: safe to call without a component scope (tests use this). */
export function menuTriggerDescriptor(
  props: MenuTriggerProps,
  context: MenuContextValue | undefined,
  select: boolean,
): PingoNode {
  const dark = useTheme() === "dark" ? "pui-dark" : undefined;
  const toggle = (): void => context?.setOpen(context.open !== true);
  const selected = context?.value;
  const label =
    selected === undefined ? props.placeholder : (context?.labelFor(selected) ?? selected);
  return View({
    className: classes(
      select ? "pui-select__trigger" : "pui-anchor__trigger",
      select ? dark : undefined,
      props.className,
    ),
    semanticRole: "button",
    semanticValue: context?.open === true ? "expanded" : "collapsed",
    ...(context === undefined ? {} : { ref: context.focus.trigger }),
    onPointerDown: (event: PingoEvent): void => event.currentTarget.focus(),
    onTap: toggle,
    onClick: toggle,
    children: props.children ??
      // A select renders its own label, so it owes the user the affordance that
      // says it opens something. A dropdown trigger is the caller's node.
      [
        Text({
          className: classes(
            context?.value === undefined ? "pui-select__placeholder" : undefined,
            context?.value === undefined ? dark : undefined,
          ),
          value: label ?? "",
        }),
        select ? Svg({ className: skin("pui-select__indicator"), source: ChevronDownIcon }) : null,
      ],
  });
}

/** shadcn-style dropdown trigger. JSX-only: reads the root via context. */
export const DropdownMenuTrigger = memo(function DropdownMenuTriggerImpl(
  props: MenuTriggerProps,
): PingoNode {
  return menuTriggerDescriptor(props, useContext(MenuContext), false);
});

/** shadcn-style select trigger. JSX-only: reads the root via context. */
export const SelectTrigger = memo(function SelectTriggerImpl(props: MenuTriggerProps): PingoNode {
  return menuTriggerDescriptor(props, useContext(MenuContext), true);
});

export type MenuContentProps = { readonly children: PingoNode; readonly className?: string };

/** Pure builder: safe to call without a component scope (tests use this). */
export function menuContentDescriptor(
  props: MenuContentProps,
  context: MenuContextValue | undefined,
  select = false,
): PingoNode {
  if (context?.open !== true) return null;
  const dark = useTheme() === "dark" ? "pui-dark" : undefined;
  const values = orderedValues(props.children);
  return View({
    className: classes(
      "pui-anchor__content",
      "pui-menu__content",
      // A select's list is its trigger's, so it follows that width; a dropdown
      // menu is its own surface and keeps the popover default.
      select ? "pui-select__content" : undefined,
      dark,
      props.className,
    ),
    semanticRole: "menu",
    ref: context.panelRef,
    // Absent when unmeasured, so the skin's static side stands and the tree is
    // identical to the pre-E8 one.
    ...(context.placement?.style === undefined ? {} : { style: context.placement.style }),
    // One handler for the whole list: the key reaches the focused item and
    // bubbles through here, so items can come and go freely.
    onKeyDown: (event: PingoEvent): void => {
      if (event.key === "Enter" || event.key === " ") {
        if (context.active === undefined) return;
        event.preventDefault();
        context.onSelect(context.active);
        return;
      }
      const next = step(values, context.active, event.key, "vertical");
      if (next === undefined) {
        escapeHandler(() => context.setOpen(false))(event);
        return;
      }
      event.preventDefault();
      context.setActive(next);
      context.focusItem(next);
    },
    children: props.children,
  });
}

/** shadcn-style dropdown surface. JSX-only: reads the root via context. */
export const DropdownMenuContent = memo(function DropdownMenuContentImpl(
  props: MenuContentProps,
): PingoNode {
  return menuContentDescriptor(props, useContext(MenuContext));
});

/** shadcn-style select surface. JSX-only: reads the root via context. */
export const SelectContent = memo(function SelectContentImpl(props: MenuContentProps): PingoNode {
  return menuContentDescriptor(props, useContext(MenuContext), true);
});

export type MenuItemProps = {
  readonly value: string;
  readonly children: string;
  readonly className?: string;
};

/** Pure builder: safe to call without a component scope (tests use this). */
export function menuItemDescriptor(
  props: MenuItemProps,
  context: MenuContextValue | undefined,
): PingoNode {
  const active = context?.active === props.value || context?.value === props.value;
  const select = (): void => context?.onSelect(props.value);
  return View({
    className: skin(
      classes("pui-menu__item", active ? "pui-menu__item--active" : undefined),
      props.className,
    ),
    semanticRole: "menuitem",
    semanticValue: active ? "selected" : "unselected",
    ...(context === undefined
      ? {}
      : { ref: (handle: NodeHandle | null) => context.registerItem(props.value, handle) }),
    onPointerDown: (event: PingoEvent): void => {
      context?.setActive(props.value);
      event.currentTarget.focus();
    },
    onTap: select,
    onClick: select,
    children: Text({ value: props.children }),
  });
}

/** shadcn-style dropdown item. JSX-only: reads the root via context. */
export const DropdownMenuItem = memo(function DropdownMenuItemImpl(
  props: MenuItemProps,
): PingoNode {
  return menuItemDescriptor(props, useContext(MenuContext));
});

/** shadcn-style select option. JSX-only: reads the root via context. */
export const SelectItem = memo(function SelectItemImpl(props: MenuItemProps): PingoNode {
  return menuItemDescriptor(props, useContext(MenuContext));
});
