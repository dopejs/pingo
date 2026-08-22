import { createElement, type PingoNode } from "@dopejs/pingo";
import { Badge } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { row, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 120,
  render: (context): PingoNode =>
    stage(context, [
      row(
        [
          createElement(Badge, { children: "Default" }),
          createElement(Badge, { children: "Secondary", variant: "secondary" }),
          createElement(Badge, { children: "Destructive", variant: "destructive" }),
          createElement(Badge, { children: "Outline", variant: "outline" }),
        ],
        12,
      ),
    ]),
};

export default demo;
