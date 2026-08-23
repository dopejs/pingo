import { createElement, type PingoNode } from "@dopejs/pingo";
import { Button, HoverCard } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { anchorStage, column } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 260,
  render: (context): PingoNode =>
    anchorStage(context, [
      createElement(HoverCard, {
        onOpenChange: () => {},
        children: createElement(Button, {
          children: "@pingo",
          variant: "ghost",
          onPress: () => {},
        }),
        content: column(
          [
            createElement("text", { value: "pingo" }),
            createElement("text", { value: "Canvas 渲染引擎与 UI 组件库。" }),
          ],
          8,
        ),
      }),
    ]),
};

export default demo;
