import { createElement, type PingoNode } from "@dopejs/pingo";
import { Sidebar, SidebarItem, SidebarSection } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 320,
  render: (context): PingoNode =>
    stage(context, [
      createElement(Sidebar, {
        defaultValue: "stats",
        onValueChange: () => {},
        children: [
          createElement(SidebarSection, {
            title: "工作区",
            children: [
              createElement(SidebarItem, { value: "home", label: "首页" }),
              createElement(SidebarItem, { value: "stats", label: "统计" }),
              createElement(SidebarItem, { value: "projects", label: "项目" }),
            ],
          }),
          createElement(SidebarSection, {
            title: "系统",
            children: [
              createElement(SidebarItem, { value: "members", label: "成员" }),
              createElement(SidebarItem, { value: "settings", label: "设置" }),
            ],
          }),
        ],
      }),
    ]),
};

export default demo;
