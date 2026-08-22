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
        title: "删除这个项目？",
        description: "项目与其全部数据将被永久删除，无法恢复。",
        actionLabel: "删除",
        destructive: true,
        children: null,
      }),
    ]),
};

export default demo;
