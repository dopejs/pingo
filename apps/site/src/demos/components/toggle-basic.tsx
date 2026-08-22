import { createElement, type PingoNode } from "@dopejs/pingo";
import { Toggle } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { row, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 120,
  render: (context): PingoNode =>
    stage(context, [
      row(
        [
          createElement(Toggle, { children: "加粗", defaultPressed: true }),
          createElement(Toggle, { children: "斜体" }),
          createElement(Toggle, { children: "下划线", disabled: true }),
        ],
        12,
      ),
    ]),
};

export default demo;
