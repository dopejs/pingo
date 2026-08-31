/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { Switch } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { row, stage } from "../../preview/layout";

// Uncontrolled: each switch owns its state, so the preview is clickable without
// a stateful demo wrapper. Pass `checked` instead to own it yourself.
const demo: PreviewDemo = {
  height: 120,
  render: (context): PingoNode =>
    stage(context, [
      row(
        [
          <Switch defaultChecked semanticLabel="飞行模式" />,
          <Switch semanticLabel="静音" />,
          <Switch checked disabled semanticLabel="已禁用" />,
        ],
        16,
      ),
    ]),
};

export default demo;
