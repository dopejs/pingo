import { createElement, type PingoNode } from "@dopejs/pingo";
import {
  Button,
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, row, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 320,
  render: (context): PingoNode =>
    stage(context, [
      createElement(Dialog, {
        open: true,
        onOpenChange: () => {},
        children: column(
          [
            createElement(DialogHeader, {
              children: column([
                createElement(DialogTitle, { children: "编辑资料" }),
                createElement(DialogDescription, {
                  children: "修改会立即同步到你的公开资料。",
                }),
              ]),
            }),
            createElement("text", { value: "对话框内容放在这里。" }),
            createElement(DialogFooter, {
              children: row([
                createElement(Button, {
                  children: "取消",
                  variant: "outline",
                  onPress: () => {},
                }),
                createElement(Button, { children: "保存", onPress: () => {} }),
              ]),
            }),
          ],
          12,
        ),
      }),
    ]),
};

export default demo;
