/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { Breadcrumb } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 120,
  render: (context): PingoNode =>
    stage(context, [
      <Breadcrumb
        separator="›"
        items={[
          { label: "工作台", onNavigate: () => {} },
          { label: "pingo 官网", onNavigate: () => {} },
          { label: "设置" },
        ]}
      />,
    ]),
};

export default demo;
