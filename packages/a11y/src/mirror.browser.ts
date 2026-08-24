import { describe, expect, it } from "vitest";

import { SemanticTreeMirror, type SemanticMirrorNode } from "./index";

/**
 * The mirror publishes state as ARIA attributes, not as text.
 *
 * The engine carries one opaque semantic value per node and the mirror wrote
 * it straight into `textContent`. A screen reader therefore met a checkbox
 * with no `aria-checked` on it -- announced as unticked however it stood --
 * and read the word "checked" as the box's name. Tabs, options, menu items
 * and sliders were all silent about their state in the same way.
 */
function node(overrides: Partial<SemanticMirrorNode> & { nodeId: number }): SemanticMirrorNode {
  return {
    bounds: { height: 20, left: 0, top: 0, width: 100 },
    focusable: true,
    focused: false,
    label: "",
    password: false,
    role: "",
    value: "",
    ...overrides,
  };
}

function mount(): { mirror: SemanticTreeMirror; canvas: HTMLElement } {
  const canvas = document.createElement("canvas");
  document.body.append(canvas);
  return { mirror: new SemanticTreeMirror(canvas), canvas };
}

function element(mirror: SemanticTreeMirror, nodeId: number): HTMLElement {
  const found = mirror.container.querySelector<HTMLElement>(
    `[data-pingo-node="${String(nodeId)}"]`,
  );
  if (found === null) throw new Error(`no mirrored element for ${String(nodeId)}`);
  return found;
}

describe("semantic mirror state", () => {
  it("maps each role's value onto the attribute that role reports", () => {
    const { mirror } = mount();
    mirror.update([
      node({ nodeId: 1, role: "checkbox", value: "checked", label: "通知" }),
      node({ nodeId: 2, role: "switch", value: "off", label: "开关" }),
      node({ nodeId: 3, role: "tab", value: "active", label: "账户" }),
      node({ nodeId: 4, role: "button", value: "expanded", label: "菜单" }),
      node({ nodeId: 5, role: "button", value: "on", label: "加粗" }),
      node({ nodeId: 6, role: "slider", value: "40", label: "音量" }),
      node({ nodeId: 7, role: "columnheader", value: "descending", label: "提交" }),
      node({ nodeId: 8, role: "button", value: "current", label: "第 3 页" }),
    ]);
    expect(element(mirror, 1).getAttribute("aria-checked")).toBe("true");
    expect(element(mirror, 2).getAttribute("aria-checked")).toBe("false");
    expect(element(mirror, 3).getAttribute("aria-selected")).toBe("true");
    expect(element(mirror, 4).getAttribute("aria-expanded")).toBe("true");
    expect(element(mirror, 5).getAttribute("aria-pressed")).toBe("true");
    expect(element(mirror, 6).getAttribute("aria-valuenow")).toBe("40");
    expect(element(mirror, 7).getAttribute("aria-sort")).toBe("descending");
    expect(element(mirror, 8).getAttribute("aria-current")).toBe("true");
    // The state is an attribute, so it is not also the element's name.
    expect(element(mirror, 1).textContent).toBe("");
    mirror.dispose();
  });

  it("keeps a value the role has no state for as the element's text", () => {
    const { mirror } = mount();
    mirror.update([node({ nodeId: 1, role: "textbox", value: "hello", label: "邮箱" })]);
    expect(element(mirror, 1).textContent).toBe("hello");
    expect(element(mirror, 1).getAttribute("aria-checked")).toBeNull();
    mirror.dispose();
  });

  it("clears a state that a later snapshot no longer reports", () => {
    const { mirror } = mount();
    mirror.update([node({ nodeId: 1, role: "checkbox", value: "checked" })]);
    mirror.update([node({ nodeId: 1, role: "checkbox", value: "unchecked" })]);
    expect(element(mirror, 1).getAttribute("aria-checked")).toBe("false");
    mirror.update([node({ nodeId: 1, role: "checkbox", value: "" })]);
    expect(element(mirror, 1).getAttribute("aria-checked")).toBeNull();
    mirror.dispose();
  });

  it("gives a roving group one tab stop and every other role its own", () => {
    const { mirror } = mount();
    mirror.update([
      node({ nodeId: 1, role: "tablist", focusable: false }),
      node({ nodeId: 2, role: "tab", value: "inactive" }),
      node({ nodeId: 3, role: "tab", value: "active" }),
      node({ nodeId: 4, role: "tab", value: "inactive" }),
      node({ nodeId: 5, role: "button", value: "" }),
    ]);
    expect(element(mirror, 2).tabIndex).toBe(-1);
    expect(element(mirror, 3).tabIndex).toBe(0);
    expect(element(mirror, 4).tabIndex).toBe(-1);
    // A button is not a roving role: it keeps its own stop.
    expect(element(mirror, 5).tabIndex).toBe(0);
    mirror.dispose();
  });

  it("still reaches a roving group that has selected nothing", () => {
    const { mirror } = mount();
    mirror.update([
      node({ nodeId: 1, role: "option", value: "unselected" }),
      node({ nodeId: 2, role: "option", value: "unselected" }),
    ]);
    expect(element(mirror, 1).tabIndex).toBe(0);
    expect(element(mirror, 2).tabIndex).toBe(-1);
    mirror.dispose();
  });

  it("takes a disabled node out of the focus order whatever its role is", () => {
    const { mirror } = mount();
    mirror.update([
      node({ nodeId: 1, role: "checkbox", value: "disabled" }),
      node({ nodeId: 2, role: "button", value: "disabled" }),
    ]);
    for (const nodeId of [1, 2]) {
      expect(element(mirror, nodeId).getAttribute("aria-disabled")).toBe("true");
      expect(element(mirror, nodeId).tabIndex).toBe(-1);
    }
    mirror.dispose();
  });
});
