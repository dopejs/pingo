import { createElement, type PingoNode } from "@dopejs/pingo";
import { MenubarMenu, NavigationMenu } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 220,
  render: (context): PingoNode =>
    stage(context, [
      createElement(NavigationMenu, {
        value: "docs",
        onValueChange: () => {},
        children: [
          createElement(MenubarMenu, {
            value: "products",
            label: "产品",
            children: column(
              [
                createElement("text", { value: "渲染引擎" }),
                createElement("text", { value: "组件库" }),
              ],
              8,
            ),
          }),
          createElement(MenubarMenu, {
            value: "docs",
            label: "文档",
            children: column(
              [
                createElement("text", { value: "快速开始" }),
                createElement("text", { value: "API 参考" }),
              ],
              8,
            ),
          }),
          createElement(MenubarMenu, {
            value: "community",
            label: "社区",
            children: createElement("text", { value: "讨论区" }),
          }),
        ],
      }),
    ]),
};

export default demo;
