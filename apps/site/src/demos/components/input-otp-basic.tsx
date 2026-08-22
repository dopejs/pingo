import { createElement, type PingoNode } from "@dopejs/pingo";
import { InputOTP } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 120,
  render: (context): PingoNode =>
    stage(context, [
      createElement(InputOTP, {
        length: 6,
        defaultValue: "12",
        semanticLabel: "一次性验证码",
        onComplete: () => {},
      }),
    ]),
};

export default demo;
