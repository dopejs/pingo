import { createElement, type PingoNode } from "@dopejs/pingo";
import { Breadcrumb } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 120,
  render: (context): PingoNode =>
    stage(context, [
      createElement(Breadcrumb, {
        items: [
          { label: "首页", onNavigate: () => {} },
          { label: "组件", onNavigate: () => {} },
          { label: "数据展示", onNavigate: () => {} },
          { label: "Breadcrumb" },
        ],
      }),
    ]),
};

export default demo;
