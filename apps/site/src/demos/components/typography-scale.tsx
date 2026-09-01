/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { H1, H2, H3, Lead, P } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 300,
  render: (context): PingoNode =>
    stage(context, [
      column(
        [
          <H1>渲染引擎</H1>,
          <Lead>在 canvas 上写 TSX，不生成 DOM。</Lead>,
          <H2>双时钟</H2>,
          <P>UI 时钟与渲染时钟相互独立。</P>,
          <H3>虚拟滚动</H3>,
          <P>窗口由核心规划，滚动稳态不回调 Shell。</P>,
        ],
        12,
      ),
    ]),
};

export default demo;
