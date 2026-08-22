import { createElement, type PingoNode } from "@dopejs/pingo";
import { Divider, Label } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 140,
  render: (context): PingoNode =>
    stage(context, [
      createElement("container", {
        width: 320,
        style: { flexDirection: "column" },
        children: [
          createElement(Label, { children: "上方内容" }),
          createElement("container", { height: 16 }),
          createElement(Divider, {}),
          createElement("container", { height: 16 }),
          createElement(Label, { children: "下方内容" }),
        ],
      }),
    ]),
};

export default demo;
