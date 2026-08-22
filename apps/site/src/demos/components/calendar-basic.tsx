import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
import { Calendar, type CalendarDate } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

// Fixed dates keep the rendered scene deterministic across visits.
function SelectableCalendar(_props: Record<string, never>): PingoNode {
  const selected = useSignal<CalendarDate>({ year: 2026, month: 8, day: 22 });
  return createElement(Calendar, {
    defaultMonth: { year: 2026, month: 8, day: 1 },
    value: selected.get(),
    onSelect: (date) => {
      selected.set(date);
    },
  });
}

const demo: PreviewDemo = {
  height: 400,
  render: (context): PingoNode => stage(context, [createElement(SelectableCalendar, {})]),
};

export default demo;
