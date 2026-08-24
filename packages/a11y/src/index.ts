/** Structural copy of the Host semantic node; kept dependency-free. */
export interface SemanticMirrorNode {
  readonly bounds: {
    readonly height: number;
    readonly left: number;
    readonly top: number;
    readonly width: number;
  };
  readonly focusable: boolean;
  readonly focused: boolean;
  readonly label: string;
  readonly nodeId: number;
  readonly password: boolean;
  readonly role: string;
  readonly value: string;
}

export interface SemanticTreeMirrorOptions {
  /** Called when the user focuses a mirrored focusable element. */
  readonly onFocusRequest?: (nodeId: number) => void;
  /** Native Enter/Space activation for focusable button semantics. */
  readonly onActivateRequest?: (nodeId: number) => void;
}

/**
 * The semantic value vocabulary the widgets emit, by the state it stands for.
 *
 * The engine carries one opaque string per node. Nothing downstream turned it
 * into an ARIA state, so a screen reader met `role="checkbox"` with no
 * `aria-checked` on it and announced every box as unticked -- and read the
 * word "checked" as the box's name, because the string was written into the
 * element's text.
 */
const CHECKED_VALUES = new Map<string, string>([
  ["checked", "true"],
  ["on", "true"],
  ["unchecked", "false"],
  ["off", "false"],
  ["mixed", "mixed"],
]);

const SELECTED_VALUES = new Map<string, string>([
  ["selected", "true"],
  ["active", "true"],
  ["unselected", "false"],
  ["inactive", "false"],
]);

const EXPANDED_VALUES = new Map<string, string>([
  ["expanded", "true"],
  ["open", "true"],
  ["collapsed", "false"],
  ["closed", "false"],
]);

const SORT_VALUES = new Set(["ascending", "descending", "none", "other"]);

/** Roles whose state this mirror publishes; cleared when a node has none. */
const STATE_ATTRIBUTES = [
  "aria-checked",
  "aria-expanded",
  "aria-selected",
  "aria-pressed",
  "aria-current",
  "aria-sort",
  "aria-valuenow",
] as const;

/** Roles that share one Tab stop per group, per WAI-ARIA. */
const ROVING_ROLES = new Set([
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "option",
  "radio",
  "tab",
  "treeitem",
]);

/** The ARIA state a role/value pair stands for, or undefined for plain text. */
function ariaState(role: string, value: string): { name: string; value: string } | undefined {
  if (value === "" || value === "disabled") return undefined;
  if (value === "current") return { name: "aria-current", value: "true" };
  switch (role) {
    case "checkbox":
    case "radio":
    case "switch":
    case "menuitemcheckbox":
    case "menuitemradio": {
      const checked = CHECKED_VALUES.get(value);
      return checked === undefined ? undefined : { name: "aria-checked", value: checked };
    }
    case "option":
    case "tab":
    case "treeitem": {
      const selected = SELECTED_VALUES.get(value);
      return selected === undefined ? undefined : { name: "aria-selected", value: selected };
    }
    case "button":
    case "menuitem":
    case "combobox": {
      const expanded = EXPANDED_VALUES.get(value);
      if (expanded !== undefined) return { name: "aria-expanded", value: expanded };
      // A toggle button reports pressed, not checked: `on`/`off` is what the
      // Toggle and its group emit, and a selected calendar day is the same
      // two-state button by another name.
      const pressed = CHECKED_VALUES.get(value) ?? SELECTED_VALUES.get(value);
      return pressed === undefined ? undefined : { name: "aria-pressed", value: pressed };
    }
    case "slider":
    case "progressbar":
    case "spinbutton":
      return Number.isFinite(Number(value)) ? { name: "aria-valuenow", value } : undefined;
    case "columnheader":
      return SORT_VALUES.has(value) ? { name: "aria-sort", value } : undefined;
    default:
      return undefined;
  }
}

/**
 * The one node per roving group that keeps a Tab stop.
 *
 * A group is a run of adjacent nodes sharing a role, which is how the engine
 * publishes them: the snapshot is in topology order, so a menu's items arrive
 * together. The selected one takes the stop, and a group with no selection
 * gives it to the first, so the group is always reachable.
 */
function rovingTabStops(nodes: readonly SemanticMirrorNode[]): ReadonlySet<number> {
  const stops = new Set<number>();
  let index = 0;
  while (index < nodes.length) {
    const role = nodes[index]?.role ?? "";
    if (!ROVING_ROLES.has(role)) {
      index += 1;
      continue;
    }
    let end = index;
    while (end + 1 < nodes.length && nodes[end + 1]?.role === role) end += 1;
    let chosen = index;
    for (let scan = index; scan <= end; scan += 1) {
      const node = nodes[scan];
      if (node === undefined) continue;
      const state = ariaState(role, node.value);
      if (state?.value === "true") {
        chosen = scan;
        break;
      }
    }
    const node = nodes[chosen];
    if (node !== undefined) stops.add(node.nodeId);
    index = end + 1;
  }
  return stops;
}

/**
 * Absolute-positioned DOM shadow tree kept beside the canvas for screen
 * readers and semantic E2E selectors. Elements are visually transparent but
 * present in the accessibility tree and focus order.
 */
export class SemanticTreeMirror {
  readonly #container: HTMLElement;
  readonly #elements = new Map<number, HTMLElement>();
  readonly #options: SemanticTreeMirrorOptions;
  #disposed = false;

  public constructor(canvas: HTMLElement, options: SemanticTreeMirrorOptions = {}) {
    this.#options = options;
    const document = canvas.ownerDocument;
    this.#container = document.createElement("div");
    this.#container.setAttribute("data-pingo-semantics", "");
    Object.assign(this.#container.style, {
      position: "absolute",
      left: "0",
      top: "0",
      width: "0",
      height: "0",
      overflow: "visible",
      pointerEvents: "none",
    });
    canvas.insertAdjacentElement("afterend", this.#container);
  }

  public get container(): HTMLElement {
    return this.#container;
  }

  /** Applies one full semantic snapshot with per-node incremental DOM updates. */
  public update(nodes: readonly SemanticMirrorNode[]): void {
    if (this.#disposed) return;
    const rovingStops = rovingTabStops(nodes);
    const seen = new Set<number>();
    for (const node of nodes) {
      seen.add(node.nodeId);
      let element = this.#elements.get(node.nodeId);
      if (element === undefined) {
        element = this.#container.ownerDocument.createElement("div");
        element.setAttribute("data-pingo-node", String(node.nodeId));
        Object.assign(element.style, {
          position: "absolute",
          color: "transparent",
          background: "transparent",
          overflow: "hidden",
        });
        element.addEventListener("focus", () => {
          const raw = element?.getAttribute("data-pingo-node");
          if (raw !== null && raw !== undefined) {
            this.#options.onFocusRequest?.(Number(raw));
          }
        });
        element.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          if (element?.getAttribute("role") !== "button") return;
          event.preventDefault();
          if (event.key === "Enter") this.activate(element);
        });
        element.addEventListener("keyup", (event) => {
          if (event.key !== " " || element?.getAttribute("role") !== "button") return;
          event.preventDefault();
          this.activate(element);
        });
        this.#container.append(element);
        this.#elements.set(node.nodeId, element);
      }
      element.style.left = `${String(node.bounds.left)}px`;
      element.style.top = `${String(node.bounds.top)}px`;
      element.style.width = `${String(node.bounds.width)}px`;
      element.style.height = `${String(node.bounds.height)}px`;
      if (node.role === "") element.removeAttribute("role");
      else element.setAttribute("role", node.role);
      if (node.label === "") element.removeAttribute("aria-label");
      else element.setAttribute("aria-label", node.label);
      const value = node.password ? "" : node.value;
      const state = ariaState(node.role, value);
      // A state is an attribute, never text: written as text content it became
      // the element's accessible name, so a ticked box announced itself as
      // "checked" and said nothing about being ticked.
      const text = state === undefined ? value : "";
      if (element.textContent !== text) element.textContent = text;
      for (const name of STATE_ATTRIBUTES) {
        if (state?.name === name) element.setAttribute(name, state.value);
        else element.removeAttribute(name);
      }
      if (node.password) element.setAttribute("aria-invalid", "false");
      const disabled = value === "disabled";
      if (disabled) element.setAttribute("aria-disabled", "true");
      else element.removeAttribute("aria-disabled");
      // Roving tabindex: one stop per group, as WAI-ARIA specifies for radios,
      // tabs, options and menu items. Without it a menu of twenty entries put
      // twenty stops in the page's Tab order.
      const roving = ROVING_ROLES.has(node.role);
      const tabbable = !roving || rovingStops.has(node.nodeId);
      element.tabIndex = node.focusable && !disabled && tabbable ? 0 : -1;
      if (node.focusable && !disabled) {
        element.style.pointerEvents = "none";
      }
    }
    for (const [nodeId, element] of this.#elements) {
      if (!seen.has(nodeId)) {
        element.remove();
        this.#elements.delete(nodeId);
      }
    }
  }

  public dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    this.#container.remove();
    this.#elements.clear();
  }

  private activate(element: HTMLElement): void {
    const raw = element.getAttribute("data-pingo-node");
    if (raw !== null) this.#options.onActivateRequest?.(Number(raw));
  }
}

/** Semantic E2E selector: finds mirrored elements by role and optional name. */
export function queryAllByRole(
  root: ParentNode,
  role: string,
  options: { readonly name?: string } = {},
): HTMLElement[] {
  const matches: HTMLElement[] = [];
  for (const element of root.querySelectorAll<HTMLElement>(`[data-pingo-node][role]`)) {
    if (element.getAttribute("role") !== role) continue;
    if (options.name !== undefined && element.getAttribute("aria-label") !== options.name) continue;
    matches.push(element);
  }
  return matches;
}

/** Semantic E2E selector returning exactly one match or throwing. */
export function getByRole(
  root: ParentNode,
  role: string,
  options: { readonly name?: string } = {},
): HTMLElement {
  const matches = queryAllByRole(root, role, options);
  if (matches.length !== 1) {
    throw new Error(
      `expected exactly one "${role}" element${
        options.name === undefined ? "" : ` named "${options.name}"`
      }, found ${String(matches.length)}`,
    );
  }
  const [match] = matches;
  if (match === undefined) throw new Error("unreachable: single match missing");
  return match;
}
