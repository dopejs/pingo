/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { Blockquote, InlineCode, Large, Muted, Small } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, row, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 260,
  render: (context): PingoNode =>
    stage(context, [
      column(
        [
          <Large>面向高性能交互而设计</Large>,
          <Blockquote>百万行的代价等于一屏。</Blockquote>,
          row([<InlineCode>pnpm add @dopejs/pingo</InlineCode>], 0),
          <Small>组件与引擎同版本发布</Small>,
          <Muted>真机帧时属于平台资格采集，单独跟踪。</Muted>,
        ],
        12,
      ),
    ]),
};

export default demo;
