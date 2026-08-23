import { createElement, type PingoNode } from "@dopejs/pingo";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { row, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 300,
  render: (context): PingoNode =>
    stage(context, [
      createElement("container", {
        width: 340,
        // A flex container with no style prop is on the direct-prop path,
        // where align-items is flex-start; the CSS initial `stretch` is what
        // makes the component inside fill this width.
        style: { flexDirection: "column" },
        children: createElement(Card, {
          children: [
            createElement(CardHeader, {
              children: [
                createElement(CardTitle, { children: "账户设置" }),
                createElement(CardDescription, { children: "管理你的账户偏好与通知。" }),
              ],
            }),
            createElement(CardContent, {
              children: createElement("text", {
                value: "将你的更改同步到所有设备，或仅保存在本地。",
              }),
            }),
            createElement(CardFooter, {
              children: row(
                [
                  createElement(Button, { children: "保存", onPress: () => {} }),
                  createElement(Button, {
                    children: "取消",
                    variant: "outline",
                    onPress: () => {},
                  }),
                ],
                8,
              ),
            }),
          ],
        }),
      }),
    ]),
};

export default demo;
