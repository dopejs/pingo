import { createElement, type PingoNode } from "@dopejs/pingo";
import { Alert } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, stage } from "../../preview/layout";

// Alert has no intrinsic width in the skin; wrap it in a fixed-width
// container so it stretches like it would in a real layout.
function framed(node: PingoNode): PingoNode {
  return createElement("container", { width: 440, children: node });
}

const demo: PreviewDemo = {
  height: 200,
  render: (context): PingoNode =>
    stage(context, [
      column(
        [
          framed(createElement(Alert, { title: "提示", children: "你的配置已自动保存。" })),
          framed(
            createElement(Alert, {
              title: "同步失败",
              variant: "destructive",
              children: "请检查网络连接后重试。",
            }),
          ),
        ],
        12,
      ),
    ]),
};

export default demo;
