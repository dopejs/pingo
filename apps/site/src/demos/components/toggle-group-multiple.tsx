import { createElement, type PingoNode } from "@dopejs/pingo";
import { ToggleGroup, ToggleGroupItem } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 120,
  render: (context): PingoNode =>
    stage(context, [
      createElement(ToggleGroup, {
        type: "multiple",
        defaultValue: ["bold"],
        children: [
          createElement(ToggleGroupItem, { value: "bold", children: "加粗" }),
          createElement(ToggleGroupItem, { value: "italic", children: "斜体" }),
          createElement(ToggleGroupItem, { value: "underline", children: "下划线" }),
        ],
      }),
    ]),
};

export default demo;
