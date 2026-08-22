import { createElement, type PingoNode } from "@dopejs/pingo";
import { Accordion, AccordionItem } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 260,
  render: (context): PingoNode =>
    stage(context, [
      createElement("container", {
        width: 360,
        children: createElement(Accordion, {
          defaultOpenValue: "intro",
          children: [
            createElement(AccordionItem, {
              value: "intro",
              title: "什么是 pingo-ui？",
              children: createElement("text", {
                value: "与 shadcn/ui 对齐的组件库，渲染在 pingo canvas 引擎之上。",
              }),
            }),
            createElement(AccordionItem, {
              value: "theme",
              title: "支持暗色主题吗？",
              children: createElement("text", {
                value: "支持。所有组件跟随站点主题自动切换明暗两套皮肤。",
              }),
            }),
            createElement(AccordionItem, {
              value: "keyboard",
              title: "键盘可以操作吗？",
              children: createElement("text", {
                value: "方向键在标题之间移动焦点，Enter 或空格展开与收起。",
              }),
            }),
          ],
        }),
      }),
    ]),
};

export default demo;
