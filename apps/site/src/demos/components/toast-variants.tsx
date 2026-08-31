/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { Toast } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, stage } from "../../preview/layout";

// Static variant showcase: the viewport width (320px) lives on
// ToastViewport, so bare toasts get a fixed-width wrapper here.
function framed(node: PingoNode): PingoNode {
  // The style prop opts this wrapper into the CSS initial `align-items:
  // stretch`, which is what makes the toast fill the 320.
  return (
    <container width={320} style={{ flexDirection: "column" }}>
      {node}
    </container>
  );
}

const demo: PreviewDemo = {
  height: 220,
  render: (context): PingoNode =>
    stage(context, [
      column(
        [
          framed(<Toast open title="已保存" description="配置已写入本地。" />),
          framed(
            <Toast
              open
              title="同步失败"
              description="请检查网络连接后重试。"
              variant="destructive"
            />,
          ),
        ],
        12,
      ),
    ]),
};

export default demo;
