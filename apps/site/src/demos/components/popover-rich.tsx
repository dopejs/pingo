import { createElement, type PingoNode } from "@dopejs/pingo";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { anchorStage, column } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 260,
  render: (context): PingoNode =>
    anchorStage(context, [
      createElement(Popover, {
        children: [
          createElement(PopoverTrigger, {
            children: createElement(Button, {
              children: "尺寸",
              variant: "outline",
              onPress: () => {},
            }),
          }),
          createElement(PopoverContent, {
            children: column(
              [
                createElement("text", { value: "画布尺寸" }),
                createElement("text", { value: "宽度 1280 · 高度 720" }),
                createElement("text", { value: "点击触发器可收起面板。" }),
              ],
              8,
            ),
          }),
        ],
      }),
    ]),
};

export default demo;
