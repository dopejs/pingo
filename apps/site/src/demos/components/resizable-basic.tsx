import { createElement, type PingoNode } from "@dopejs/pingo";
import { Resizable } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

function pane(label: string, color: string): PingoNode {
  return createElement("container", {
    backgroundColor: color,
    style: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center" },
    children: createElement("text", { value: label, color: "#ffffffff", fontSize: 13 }),
  });
}

const demo: PreviewDemo = {
  height: 240,
  render: (context): PingoNode =>
    stage(context, [
      createElement("container", {
        width: 420,
        height: 150,
        children: createElement(Resizable, {
          defaultSplit: 0.4,
          first: pane("左侧栏", "#3b82f6ff"),
          second: pane("主内容", "#6366f1ff"),
        }),
      }),
    ]),
};

export default demo;
