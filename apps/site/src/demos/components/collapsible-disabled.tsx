import { createElement, type PingoNode } from "@dopejs/pingo";
import { Collapsible, Label } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 120,
  render: (context): PingoNode =>
    stage(context, [
      createElement("container", {
        width: 320,
        children: createElement(Collapsible, {
          trigger: "已锁定的部分",
          disabled: true,
          children: createElement(Label, { children: "升级后可用。" }),
        }),
      }),
    ]),
};

export default demo;
