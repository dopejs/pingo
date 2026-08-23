import { createElement, type PingoNode } from "@dopejs/pingo";
import { Checkbox } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, stage } from "../../preview/layout";

// Uncontrolled: each checkbox owns its state, so the preview is clickable
// without a stateful demo wrapper. Pass `checked` instead to own it yourself.
const demo: PreviewDemo = {
  height: 180,
  render: (context): PingoNode =>
    stage(context, [
      column(
        [
          createElement(Checkbox, { defaultChecked: true, label: "已启用通知" }),
          createElement(Checkbox, { label: "接收营销邮件" }),
          createElement(Checkbox, { label: "禁用项", disabled: true }),
        ],
        12,
      ),
    ]),
};

export default demo;
