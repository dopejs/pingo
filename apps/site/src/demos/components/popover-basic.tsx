import { createElement, type PingoNode } from "@dopejs/pingo";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 220,
  render: (context): PingoNode =>
    stage(context, [
      createElement(Popover, {
        defaultOpen: true,
        children: [
          createElement(PopoverTrigger, {
            children: createElement(Button, {
              children: "打开浮层",
              variant: "outline",
              onPress: () => {},
            }),
          }),
          createElement(PopoverContent, {
            children: createElement("text", { value: "锚定在触发器下方。" }),
          }),
        ],
      }),
    ]),
};

export default demo;
