import { createElement, type PingoNode } from "@dopejs/pingo";
import { Collapsible, Label } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 200,
  render: (context): PingoNode =>
    stage(context, [
      createElement("container", {
        width: 320,
        children: createElement(Collapsible, {
          trigger: "高级选项",
          defaultOpen: true,
          children: createElement(Label, {
            children: "这里的设置会应用到当前工作区的所有项目。",
          }),
        }),
      }),
    ]),
};

export default demo;
