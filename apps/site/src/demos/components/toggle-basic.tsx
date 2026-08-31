/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { Toggle } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { row, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 120,
  render: (context): PingoNode =>
    stage(context, [
      row(
        [
          <Toggle defaultPressed>加粗</Toggle>,
          <Toggle>斜体</Toggle>,
          <Toggle disabled>下划线</Toggle>,
        ],
        12,
      ),
    ]),
};

export default demo;
