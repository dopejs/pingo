import { createElement, type PingoNode } from "@dopejs/pingo";
import { AlertDialog } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 280,
  render: (context): PingoNode =>
    stage(context, [
      createElement(AlertDialog, {
        open: true,
        onOpenChange: () => {},
        title: "确认退出？",
        description: "未保存的修改将会丢失。",
        children: null,
      }),
    ]),
};

export default demo;
