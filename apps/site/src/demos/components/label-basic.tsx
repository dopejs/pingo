import { createElement, type PingoNode } from "@dopejs/pingo";
import { Input, Label } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 150,
  render: (context): PingoNode =>
    stage(context, [
      column(
        [
          createElement(Label, { children: "邮箱" }),
          createElement(Input, {
            semanticLabel: "邮箱",
            width: 320,
            onValueChange: () => {},
          }),
        ],
        8,
      ),
    ]),
};

export default demo;
