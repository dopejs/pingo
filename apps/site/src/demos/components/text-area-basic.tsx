import { createElement, type PingoNode } from "@dopejs/pingo";
import { TextArea } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 240,
  render: (context): PingoNode =>
    stage(context, [
      column(
        [
          createElement(TextArea, {
            semanticLabel: "个人简介",
            width: 360,
            rows: 4,
            value: "用 canvas 写 UI，用 CSS 做样式。",
            onValueChange: () => {},
          }),
          createElement(TextArea, {
            semanticLabel: "备注",
            width: 360,
            rows: 2,
            value: "禁用状态",
            disabled: true,
          }),
        ],
        12,
      ),
    ]),
};

export default demo;
