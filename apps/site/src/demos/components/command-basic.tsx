import { createElement, type PingoNode } from "@dopejs/pingo";
import { Command } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 320,
  render: (context): PingoNode =>
    stage(context, [
      createElement(Command, {
        items: [
          { value: "open", label: "打开文件" },
          { value: "save", label: "保存文件" },
          { value: "share", label: "分享链接" },
          { value: "quit", label: "退出" },
        ],
        onSelect: () => {},
      }),
    ]),
};

export default demo;
