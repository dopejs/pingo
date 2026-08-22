import { createElement, type PingoNode } from "@dopejs/pingo";
import { Input } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 170,
  render: (context): PingoNode =>
    stage(context, [
      column(
        [
          createElement(Input, { semanticLabel: "用户名", width: 320 }),
          createElement(Input, {
            semanticLabel: "用户名",
            width: 320,
            value: "pingo@dopejs.com",
            onValueChange: () => {},
          }),
        ],
        12,
      ),
    ]),
};

export default demo;
