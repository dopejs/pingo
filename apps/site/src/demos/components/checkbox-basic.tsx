/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
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
          <Checkbox defaultChecked label="已启用通知" />,
          <Checkbox label="接收营销邮件" />,
          <Checkbox label="禁用项" disabled />,
        ],
        12,
      ),
    ]),
};

export default demo;
