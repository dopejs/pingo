import { createElement, type PingoNode } from "@dopejs/pingo";
import { ToggleGroup, ToggleGroupItem } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 120,
  render: (context): PingoNode =>
    stage(context, [
      createElement(ToggleGroup, {
        type: "single",
        defaultValue: ["center"],
        children: [
          createElement(ToggleGroupItem, { value: "left", children: "左对齐" }),
          createElement(ToggleGroupItem, { value: "center", children: "居中" }),
          createElement(ToggleGroupItem, { value: "right", children: "右对齐" }),
        ],
      }),
    ]),
};

export default demo;
