import { createElement, type PingoNode } from "@dopejs/pingo";
import { Progress } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, stage } from "../../preview/layout";

// The track stretches to its parent's width, so wrap each bar in a
// fixed-width container.
function bar(value: number): PingoNode {
  return createElement("container", {
    width: 320,
    children: createElement(Progress, { value }),
  });
}

const demo: PreviewDemo = {
  height: 140,
  render: (context): PingoNode =>
    stage(context, [column([bar(25), bar(60), bar(90)], 16)]),
};

export default demo;
