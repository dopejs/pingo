import { createElement, type PingoNode } from "@dopejs/pingo";
import { DatePicker } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 420,
  render: (context): PingoNode =>
    stage(context, [
      createElement(DatePicker, {
        open: true,
        value: { year: 2026, month: 8, day: 23 },
        placeholder: "选择日期",
        onSelect: () => {},
      }),
    ]),
};

export default demo;
