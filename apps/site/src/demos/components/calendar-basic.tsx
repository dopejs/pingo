/** @jsxImportSource @dopejs/pingo */
import { memo, useSignal, type PingoNode } from "@dopejs/pingo";
import { Calendar, type CalendarDate } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { frame, stage } from "../../preview/layout";

// Fixed dates keep the rendered scene deterministic across visits. The
// component is memo-wrapped: pingo function components rendered through
// createElement resolve their hooks only when memoized.
const SelectableCalendar = memo(function SelectableCalendar(
  _props: Record<string, never>,
): PingoNode {
  const selected = useSignal<CalendarDate>({ year: 2026, month: 8, day: 22 });
  return (
    <Calendar
      defaultMonth={{ year: 2026, month: 8, day: 1 }}
      value={selected.get()}
      onSelect={(date) => {
        selected.set(date);
      }}
    />
  );
});

const demo: PreviewDemo = {
  height: 400,
  render: (context): PingoNode => stage(context, [frame(280, [<SelectableCalendar />])]),
};

export default demo;
