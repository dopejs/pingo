import { createElement, type PingoNode } from "@dopejs/pingo";
import { Menubar, MenubarMenu } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 220,
  render: (context): PingoNode =>
    stage(context, [
      createElement(Menubar, {
        value: "file",
        onValueChange: () => {},
        children: [
          createElement(MenubarMenu, {
            value: "file",
            label: "文件",
            children: column(
              [
                createElement("text", { value: "新建" }),
                createElement("text", { value: "打开…" }),
                createElement("text", { value: "保存" }),
              ],
              8,
            ),
          }),
          createElement(MenubarMenu, {
            value: "edit",
            label: "编辑",
            children: createElement("text", { value: "撤销" }),
          }),
        ],
      }),
    ]),
};

export default demo;
