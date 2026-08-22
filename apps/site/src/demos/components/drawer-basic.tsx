import { createElement, type PingoNode } from "@dopejs/pingo";
import {
  Button,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Drawer,
} from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 340,
  render: (context): PingoNode =>
    stage(context, [
      createElement(Drawer, {
        open: true,
        onOpenChange: () => {},
        children: column(
          [
            createElement(DialogHeader, {
              children: column([
                createElement(DialogTitle, { children: "移动到哪里？" }),
                createElement(DialogDescription, {
                  children: "选择一个目标文件夹。",
                }),
              ]),
            }),
            createElement(Button, { children: "完成", onPress: () => {} }),
          ],
          12,
        ),
      }),
    ]),
};

export default demo;
