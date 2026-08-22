import { createElement, type PingoNode } from "@dopejs/pingo";
import { Switch } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { row, stage } from "../../preview/layout";

// Switch is controlled: static on/off/disabled pairs, matching the storybook
// showcase convention.
const demo: PreviewDemo = {
  height: 120,
  render: (context): PingoNode =>
    stage(context, [
      row(
        [
          createElement(Switch, {
            checked: true,
            semanticLabel: "飞行模式",
            onCheckedChange: () => {},
          }),
          createElement(Switch, {
            checked: false,
            semanticLabel: "飞行模式",
            onCheckedChange: () => {},
          }),
          createElement(Switch, { checked: true, disabled: true, semanticLabel: "飞行模式" }),
        ],
        16,
      ),
    ]),
};

export default demo;
