import { createElement, type PingoNode } from "@dopejs/pingo";
import { Menubar, MenubarMenu } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 120,
  render: (context): PingoNode =>
    stage(context, [
      createElement(Menubar, {
        children: [
          createElement(MenubarMenu, {
            value: "file",
            label: "文件",
            children: createElement("text", { value: "新建" }),
          }),
          createElement(MenubarMenu, {
            value: "edit",
            label: "编辑",
            children: createElement("text", { value: "撤销" }),
          }),
          createElement(MenubarMenu, {
            value: "view",
            label: "视图",
            children: createElement("text", { value: "缩放" }),
          }),
        ],
      }),
    ]),
};

export default demo;
