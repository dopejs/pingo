import { createElement, type PingoNode } from "@dopejs/pingo";
import { Avatar, Button, TopBar } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { row, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 140,
  render: (context): PingoNode =>
    stage(context, [
      createElement("container", {
        width: Math.min(context.width - 48, 560),
        // A flex container with no style prop is on the direct-prop path,
        // where align-items is flex-start; the CSS initial `stretch` is what
        // makes the component inside fill this width.
        style: { flexDirection: "column" },
        children: [
          createElement(TopBar, {
            title: "仪表盘",
            leading: createElement(Avatar, { fallback: "P", size: 28 }),
            actions: row(
              [
                createElement(Button, {
                  children: "新建",
                  variant: "outline",
                  size: "sm",
                  onPress: () => {},
                }),
                createElement(Avatar, { fallback: "ZJ", size: 32 }),
              ],
              8,
            ),
          }),
        ],
      }),
    ]),
};

export default demo;
