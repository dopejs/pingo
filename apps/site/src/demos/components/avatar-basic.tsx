import { createElement, type PingoNode } from "@dopejs/pingo";
import { Avatar } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { row, stage } from "../../preview/layout";

// The docs sandbox has no network image asset, so the initials-fallback path
// is the representative one; sizes show the explicit `size` prop against the
// skin's 40px default.
const demo: PreviewDemo = {
  height: 120,
  render: (context): PingoNode =>
    stage(context, [
      row(
        [
          createElement(Avatar, { fallback: "张", size: 32 }),
          createElement(Avatar, { fallback: "李" }),
          createElement(Avatar, { fallback: "王", size: 56 }),
        ],
        16,
      ),
    ]),
};

export default demo;
