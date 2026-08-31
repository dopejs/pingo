/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { Badge } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { row, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 120,
  render: (context): PingoNode =>
    stage(context, [
      row(
        [
          <Badge>Default</Badge>,
          <Badge variant="secondary">Secondary</Badge>,
          <Badge variant="destructive">Destructive</Badge>,
          <Badge variant="outline">Outline</Badge>,
        ],
        12,
      ),
    ]),
};

export default demo;
