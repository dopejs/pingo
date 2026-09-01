/**
 * Catalog of the documented UI components, grouped for the /components
 * sidebar. Names map to routes `/components/<name>` and to demo ids
 * `<name>-<variant>` under `apps/site/src/demos/components/`.
 */
export type ComponentGroup = "form" | "layout" | "overlay" | "data" | "feedback" | "product";

export interface ComponentEntry {
  readonly name: string;
  readonly group: ComponentGroup;
}

export const COMPONENT_GROUPS: readonly ComponentGroup[] = [
  "form",
  "layout",
  "overlay",
  "data",
  "feedback",
  "product",
];

export const COMPONENT_CATALOG: readonly ComponentEntry[] = [
  { name: "button", group: "form" },
  { name: "icon-button", group: "form" },
  { name: "input", group: "form" },
  { name: "text-area", group: "form" },
  { name: "checkbox", group: "form" },
  { name: "radio-group", group: "form" },
  { name: "switch", group: "form" },
  { name: "select", group: "form" },
  { name: "slider", group: "form" },
  { name: "form", group: "form" },
  { name: "input-otp", group: "form" },
  { name: "label", group: "form" },
  { name: "date-picker", group: "form" },
  { name: "combobox", group: "form" },
  { name: "toggle", group: "form" },
  { name: "toggle-group", group: "form" },
  { name: "accordion", group: "layout" },
  { name: "card", group: "layout" },
  { name: "tabs", group: "layout" },
  { name: "typography", group: "layout" },
  { name: "divider", group: "layout" },
  { name: "resizable", group: "layout" },
  { name: "scroll-area", group: "layout" },
  { name: "aspect-ratio", group: "layout" },
  { name: "collapsible", group: "layout" },
  { name: "sidebar", group: "layout" },
  { name: "dialog", group: "overlay" },
  { name: "alert-dialog", group: "overlay" },
  { name: "drawer", group: "overlay" },
  { name: "sheet", group: "overlay" },
  { name: "popover", group: "overlay" },
  { name: "tooltip", group: "overlay" },
  { name: "hover-card", group: "overlay" },
  { name: "context-menu", group: "overlay" },
  { name: "dropdown-menu", group: "overlay" },
  { name: "menubar", group: "overlay" },
  { name: "navigation-menu", group: "overlay" },
  { name: "command", group: "overlay" },
  { name: "table", group: "data" },
  { name: "data-table", group: "data" },
  { name: "calendar", group: "data" },
  { name: "pagination", group: "data" },
  { name: "breadcrumb", group: "data" },
  { name: "alert", group: "feedback" },
  { name: "toast", group: "feedback" },
  { name: "progress", group: "feedback" },
  { name: "skeleton", group: "feedback" },
  { name: "badge", group: "feedback" },
  { name: "avatar", group: "feedback" },
  { name: "list-row", group: "product" },
  { name: "statcard", group: "product" },
  { name: "topbar", group: "product" },
];
