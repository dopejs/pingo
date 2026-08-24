import { describe, expect, it } from "vitest";

import { setTheme } from "../theme";
import { scrollAreaDescriptor } from "./scroll-area";

type Node = { readonly props: Record<string, unknown> };

describe("scrollAreaDescriptor", () => {
  it("wraps its children in a scrolling viewport", () => {
    const node = scrollAreaDescriptor({ children: null }) as unknown as Node;
    expect(node.props["className"]).toBe("pui-scroll-area");
    const viewport = node.props["children"] as Node;
    expect(viewport.props["className"]).toBe("pui-scroll-area__viewport");
    const content = viewport.props["children"] as Node;
    expect(content.props["className"]).toBe("pui-scroll-area__content");
  });

  it("asks Core for no bar rather than drawing one itself", () => {
    // Hiding the bar is a paint decision that belongs to Core: the Shell used
    // to derive the thumb from the scrolled content's box, which made every
    // scroll frame a Shell render and a commit.
    const node = scrollAreaDescriptor({ children: null, hideScrollbar: true }) as unknown as Node;
    const viewport = node.props["children"] as Node;
    expect(viewport.props["className"]).toBe(
      "pui-scroll-area__viewport pui-scroll-area__viewport--bare",
    );
  });

  it("asks for the narrow bar when told to", () => {
    const node = scrollAreaDescriptor({ children: null, thinScrollbar: true }) as unknown as Node;
    const viewport = node.props["children"] as Node;
    expect(viewport.props["className"]).toBe(
      "pui-scroll-area__viewport pui-scroll-area__viewport--thin",
    );
  });

  it("puts a virtual window on the viewport rather than inside it", () => {
    // Virtualization is a View-level contract, so a scroll area holds a
    // million rows without becoming a different component. Core plans the
    // window against the box that scrolls, which is the viewport itself.
    const virtualWindow = {
      itemCount: 100_000,
      estimatedItemSize: 30,
      renderItem: () => null,
    };
    const node = scrollAreaDescriptor({ virtual: virtualWindow }) as unknown as Node;
    const viewport = node.props["children"] as Node;
    expect(viewport.props["className"]).toBe("pui-scroll-area__viewport");
    expect(viewport.props["virtual"]).toBe(virtualWindow);
    // No content wrapper: the items are the viewport's own children.
    expect(viewport.props["children"] ?? null).toBeNull();
  });

  it("carries the dark marker on its own root", () => {
    setTheme("dark");
    const node = scrollAreaDescriptor({ children: null }) as unknown as Node;
    expect(node.props["className"]).toBe("pui-scroll-area pui-dark");
    setTheme("light");
  });
});
