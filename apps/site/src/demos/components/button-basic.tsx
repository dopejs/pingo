import { createElement, type PingoNode } from "@dopejs/pingo";
import { Button } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { row, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 160,
  render: (context): PingoNode =>
    stage(context, [
      row(
        [
          createElement(Button, { children: "Default", onPress: () => {} }),
          createElement(Button, {
            children: "Secondary",
            variant: "secondary",
            onPress: () => {},
          }),
          createElement(Button, { children: "Outline", variant: "outline", onPress: () => {} }),
          createElement(Button, { children: "Ghost", variant: "ghost", onPress: () => {} }),
          createElement(Button, {
            children: "Destructive",
            variant: "destructive",
            onPress: () => {},
          }),
        ],
        12,
      ),
    ]),
};

export default demo;
