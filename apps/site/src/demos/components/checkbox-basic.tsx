import { createElement, type PingoNode } from "@dopejs/pingo";
import { Checkbox } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, stage } from "../../preview/layout";

// Checkbox is controlled: without a stateful parent these stay static pairs,
// the same convention the storybook showcase uses.
const demo: PreviewDemo = {
  height: 180,
  render: (context): PingoNode =>
    stage(context, [
      column(
        [
          createElement(Checkbox, {
            checked: true,
            label: "已启用通知",
            onCheckedChange: () => {},
          }),
          createElement(Checkbox, {
            checked: false,
            label: "接收营销邮件",
            onCheckedChange: () => {},
          }),
          createElement(Checkbox, {
            checked: false,
            label: "禁用项",
            disabled: true,
          }),
        ],
        12,
      ),
    ]),
};

export default demo;
