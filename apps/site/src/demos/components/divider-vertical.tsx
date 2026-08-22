import { createElement, type PingoNode } from "@dopejs/pingo";
import { Divider, Label } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 120,
  render: (context): PingoNode =>
    stage(context, [
      createElement("container", {
        height: 48,
        style: { flexDirection: "row", alignItems: "center" },
        children: [
          createElement(Label, { children: "首页" }),
          createElement("container", { width: 16 }),
          createElement(Divider, { orientation: "vertical" }),
          createElement("container", { width: 16 }),
          createElement(Label, { children: "文档" }),
          createElement("container", { width: 16 }),
          createElement(Divider, { orientation: "vertical" }),
          createElement("container", { width: 16 }),
          createElement(Label, { children: "设置" }),
        ],
      }),
    ]),
};

export default demo;
