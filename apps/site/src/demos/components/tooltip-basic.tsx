import { createElement, type PingoNode } from "@dopejs/pingo";
import { Button, Tooltip } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 160,
  render: (context): PingoNode =>
    stage(context, [
      createElement(Tooltip, {
        content: "这是一段说明文字。",
        children: createElement(Button, {
          children: "悬停我",
          variant: "ghost",
          onPress: () => {},
        }),
      }),
    ]),
};

export default demo;
