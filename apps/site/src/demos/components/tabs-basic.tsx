import { createElement, type PingoNode } from "@dopejs/pingo";
import { Label, Tabs, TabsContent, TabsList, TabsTrigger } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 200,
  render: (context): PingoNode =>
    stage(context, [
      createElement("container", {
        width: 360,
        // A flex container with no style prop is on the direct-prop path,
        // where align-items is flex-start; the CSS initial `stretch` is what
        // makes the component inside fill this width.
        style: { flexDirection: "column" },
        children: createElement(Tabs, {
          defaultValue: "account",
          children: [
            createElement(TabsList, {
              children: [
                createElement(TabsTrigger, { value: "account", children: "账户" }),
                createElement(TabsTrigger, { value: "password", children: "密码" }),
                createElement(TabsTrigger, { value: "notifications", children: "通知" }),
              ],
            }),
            createElement(TabsContent, {
              value: "account",
              children: createElement(Label, { children: "管理你的账户信息与偏好。" }),
            }),
            createElement(TabsContent, {
              value: "password",
              children: createElement(Label, { children: "修改你的登录密码。" }),
            }),
            createElement(TabsContent, {
              value: "notifications",
              children: createElement(Label, { children: "选择要接收的通知类型。" }),
            }),
          ],
        }),
      }),
    ]),
};

export default demo;
