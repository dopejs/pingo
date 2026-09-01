import { describe, expect, it } from "vitest";

import { pingoUiCssText } from "../generated/styles";
import { Blockquote, H1, H2, InlineCode, Muted, P } from "./typography";

type Node = { props: Record<string, unknown> };
type Wrapper = { props: { className: string; children: Node } };

describe("typography", () => {
  it("announces a heading level, so H1 and H4 do not sound alike", () => {
    // A heading with no level is announced as level 2 by most screen readers.
    const node = H1.component({ children: "标题" }) as Node;
    expect(node.props.semanticRole).toBe("heading");
    expect(node.props.semanticValue).toBe("1");
    expect((H2.component({ children: "小标题" }) as Node).props.semanticValue).toBe("2");
  });

  it("separates the announced level from the visual step", () => {
    // A page may open a section with H1 metrics while the outline needs level 2.
    const node = H1.component({ children: "标题", level: 2 }) as Node;
    expect(node.props.className).toBe("pui-h1");
    expect(node.props.semanticValue).toBe("2");
  });

  it("leaves body text without a role", () => {
    // A paragraph is prose, not a landmark; a role would make a screen reader
    // stop on every one of them.
    const node = P.component({ children: "正文" }) as Node;
    expect(node.props.semanticRole).toBeUndefined();
    expect(node.props.className).toBe("pui-p");
  });

  it("appends user className last", () => {
    const node = Muted.component({ children: "x", className: "mine" }) as Node;
    expect(node.props.className).toBe("pui-muted mine");
  });

  it("puts the rule on the box and the metrics on the text", () => {
    // pingo resolves text metrics per node, so a styled wrapper cannot make its
    // contents large the way shadcn's cascade does.
    const quote = Blockquote.component({ children: "引用" }) as unknown as Wrapper;
    expect(quote.props.className).toBe("pui-blockquote");
    expect(quote.props.children.props.className).toBe("pui-blockquote__text");
    const code = InlineCode.component({ children: "npm i" }) as unknown as Wrapper;
    expect(code.props.children.props.className).toBe("pui-code__text");
  });

  it("ships a skin for every class it names", () => {
    for (const name of [
      "pui-h1",
      "pui-h2",
      "pui-h3",
      "pui-h4",
      "pui-p",
      "pui-lead",
      "pui-large",
      "pui-small",
      "pui-muted",
      "pui-blockquote",
      "pui-blockquote__text",
      "pui-code",
      "pui-code__text",
    ]) {
      expect(pingoUiCssText, name).toContain(`.${name}`);
    }
  });
});
