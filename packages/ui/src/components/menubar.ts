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
import { orderedValues, step } from "../keyboard";
import { classes } from "../overlay";
import { skin } from "../theme";
import { useAnchoredPlacement, type AnchoredPlacement } from "../use-anchored";

import { ANCHOR_OFFSET } from "./popover";

export type MenubarContextValue = {
  /** Value of the open menu, or undefined when the bar is idle. */
  readonly open: string | undefined;
  readonly setOpen: (value: string | undefined) => void;
  readonly registerMenu: (value: string, handle: NodeHandle | null) => void;
  readonly focusMenu: (value: string) => void;
  /**
   * Whether the bar is a navigation menu rather than a menubar.
   *
   * The two differ in more than semantics in shadcn: a menubar is a bordered
   * strip of compact triggers, while a navigation menu is a bare row whose
   * triggers each carry a chevron. A menu entry cannot tell which it is in
   * from its own props, so the bar says.
   */
  readonly navigation: boolean;
};

const MenubarContext = createContext<MenubarContextValue | undefined>(undefined);

export type MenubarProps = {
  readonly value?: string;
  readonly onValueChange?: (value: string | undefined) => void;
  readonly children: PingoNode;
  readonly className?: string;
  /** Navigation semantics instead of menubar semantics. */
  readonly navigation?: boolean;
};

function MenubarImpl(props: MenubarProps): PingoNode {
  const openSignal = useSignal<string | undefined>(undefined);
  const handles = useMemo(() => new Map<string, NodeHandle>(), []);
  // .get() (not .peek()): opening a menu must re-render and republish context.
  const open = props.value ?? openSignal.get();
  const context: MenubarContextValue = {
    open,
    navigation: props.navigation === true,
    setOpen: (value) => {
      openSignal.set(value);
      props.onValueChange?.(value);
    },
    registerMenu: (value, handle) => {
      if (handle === null) handles.delete(value);
      else handles.set(value, handle);
    },
    focusMenu: (value) => handles.get(value)?.focus(),
  };
  return createElement(MenubarContext.Provider, {
    value: context,
    children: View({
      className: skin(
        props.navigation === true ? "pui-navigation-menu" : "pui-menubar",
        props.className,
      ),
      direction: "row",
      semanticRole: props.navigation === true ? "navigation" : "menubar",
      // Left/Right walks the bar. Once a menu is open the same keys move
      // between menus rather than closing one and opening nothing, which is
      // what makes a menubar feel like one control instead of several.
      onKeyDown: (event: PingoEvent): void => {
        const values = orderedValues(props.children);
        if (event.key === "Escape" && open !== undefined) {
          event.preventDefault();
          event.stopPropagation();
          context.setOpen(undefined);
          context.focusMenu(open);
          return;
        }
        const next = step(values, open ?? values[0], event.key, "horizontal");
        if (next === undefined) return;
        event.preventDefault();
        context.focusMenu(next);
        if (open !== undefined) context.setOpen(next);
      },
      children: props.children,
    }),
  });
}

/** shadcn-style menubar: a row of menus that share one open slot. */
export const Menubar = memo(MenubarImpl);

/** shadcn-style navigation menu: a Menubar with navigation semantics. */
export const NavigationMenu = memo(function NavigationMenuImpl(
  props: Omit<MenubarProps, "navigation">,
): PingoNode {
  return MenubarImpl({ ...props, navigation: true });
});

export type MenubarMenuProps = {
  readonly value: string;
  readonly label: string;
  readonly children: PingoNode;
  readonly className?: string;
};

/**
 * Pure builder: safe to call without a component scope (tests use this).
 *
 * `placement` is undefined outside a component scope, and then the skin's
 * static side stands. Measuring is what puts the list under its trigger: the
 * skin says `top: 100%`, and an out-of-flow child resolves that against the
 * parent's constraint rather than its used height, so an unmeasured list
 * dropped a stage-height below the bar and off the surface entirely.
 */
export function menubarMenuDescriptor(
  props: MenubarMenuProps,
  context: MenubarContextValue | undefined,
  placement?: AnchoredPlacement,
): PingoNode {
  const open = context?.open === props.value;
  const toggle = (): void => context?.setOpen(open ? undefined : props.value);
  // A navigation menu's trigger carries a chevron, so it is a row with a label
  // and an icon in it; a menubar's is the label alone, as shadcn has it. Both
  // keep the role, the ref and every handler on the node the user presses.
  const navigation = context?.navigation === true;
  const triggerProps = {
    className: skin(
      classes(
        "pui-menubar__trigger",
        navigation ? "pui-menubar__trigger--navigation" : undefined,
        open ? "pui-menubar__trigger--open" : undefined,
      ),
    ),
    semanticRole: "menuitem",
    semanticValue: open ? "expanded" : "collapsed",
    ref: (handle: NodeHandle | null) => context?.registerMenu(props.value, handle),
    onPointerDown: (event: PingoEvent): void => event.currentTarget.focus(),
    onTap: toggle,
    onClick: toggle,
    // Enter, Space and Down all open — Down because a menubar user reaching
    // for the list expects the same key that moves into it.
    onKeyDown: (event: PingoEvent): void => {
      if (event.key !== "Enter" && event.key !== " " && event.key !== "ArrowDown") return;
      event.preventDefault();
      context?.setOpen(props.value);
    },
  };
  return View({
    className: classes("pui-menubar__menu", props.className),
    ...(placement === undefined ? {} : { ref: placement.anchorRef }),
    children: [
      navigation
        ? View({
            ...triggerProps,
            children: [
              Text({ value: props.label }),
              // Rotated rather than swapped for a second glyph, the way the
              // Accordion's is. The class is what gives it a box: an Svg with
              // no size collapses to 0x0.
              Svg({
                className: skin("pui-menubar__indicator"),
                source: ChevronDownIcon,
                ...(open ? { style: { transform: "rotate(180deg)" } } : {}),
              }),
            ],
          })
        : Text({ ...triggerProps, value: props.label }),
      open
        ? View({
            className: skin("pui-menubar__content"),
            ...(placement === undefined ? {} : { ref: placement.panelRef }),
            ...(placement?.style === undefined ? {} : { style: placement.style }),
            semanticRole: "menu",
            children: props.children,
          })
        : null,
    ],
  });
}

/** shadcn-style menubar entry. JSX-only: reads the bar via context. */
export const MenubarMenu = memo(function MenubarMenuImpl(props: MenubarMenuProps): PingoNode {
  const context = useContext(MenubarContext);
  const placement = useAnchoredPlacement(context?.open === props.value, "bottom", ANCHOR_OFFSET);
  return menubarMenuDescriptor(props, context, placement);
});
