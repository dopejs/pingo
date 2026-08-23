import { createElement, type PingoNode } from "@dopejs/pingo";
import { Calendar } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { frame, stage } from "../../preview/layout";

// Fixed month keeps the rendered scene deterministic; weekends are disabled.
const demo: PreviewDemo = {
  height: 400,
  render: (context): PingoNode =>
    stage(context, [
      frame(280, [
        createElement(Calendar, {
          defaultMonth: { year: 2026, month: 8, day: 1 },
          value: { year: 2026, month: 8, day: 22 },
          isDisabled: (date) => {
            const weekday = new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay();
            return weekday === 0 || weekday === 6;
          },
          onSelect: () => {},
        }),
      ]),
    ]),
};

export default demo;
