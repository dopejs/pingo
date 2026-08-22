import { createElement, type PingoNode } from "@dopejs/pingo";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 260,
  render: (context): PingoNode =>
    stage(context, [
      createElement(DropdownMenu, {
        defaultOpen: true,
        onValueChange: () => {},
        children: [
          createElement(DropdownMenuTrigger, {
            children: createElement(Button, {
              children: "打开菜单",
              variant: "outline",
              onPress: () => {},
            }),
          }),
          createElement(DropdownMenuContent, {
            children: [
              createElement(DropdownMenuItem, { value: "profile", children: "个人资料" }),
              createElement(DropdownMenuItem, { value: "billing", children: "账单" }),
              createElement(DropdownMenuItem, { value: "settings", children: "设置" }),
            ],
          }),
        ],
      }),
    ]),
};

export default demo;
