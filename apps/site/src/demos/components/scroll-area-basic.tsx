import { createElement, type PingoNode } from "@dopejs/pingo";
import { Label, ScrollArea } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const ITEMS = [
  "收件箱",
  "星标邮件",
  "已发送",
  "草稿",
  "归档",
  "垃圾邮件",
  "已删除",
  "工作",
  "家庭",
  "旅行",
  "收据",
  "订阅",
];

const demo: PreviewDemo = {
  height: 260,
  render: (context): PingoNode =>
    stage(context, [
      createElement("container", {
        width: 260,
        height: 200,
        children: createElement(ScrollArea, {
          children: ITEMS.map((name) =>
            createElement("container", {
              padding: 8,
              children: createElement(Label, { children: name }),
            }),
          ),
        }),
      }),
    ]),
};

export default demo;
