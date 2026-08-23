---
title: Calendar
description: shadcn 스타일의 월간 달력으로, 6행 그리드가 고정되어 있으며 날짜를 연월일 부분으로 표현하여 시간대 오프셋을 방지합니다.
---

# Calendar

shadcn 스타일의 월간 달력입니다. 날짜는 `{ year, month, day }` 세 부분으로 표현되며(`month`는 1부터 시작), 어떤 시간대에서도 날짜가 밀리지 않습니다. 그리드는 6행으로 고정되어 월을 넘겨도 컴포넌트 높이가 변하지 않습니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링합니다. 날짜를 클릭하여 선택하고, 화살표로 월을 넘기며, 사이트 테마에 따라 밝은 모드와 어두운 모드가 전환되는 것을 확인할 수 있습니다.

:::preview calendar-basic
:::

## 사용법

선택 상태는 **제어형**입니다. 날짜를 클릭하면 `onSelect`가 발생하고, 사용자가 `value`를 다시 기록해야 합니다. 월은 컴포넌트 내부에서 자체 관리하거나(`defaultMonth`), `month` + `onMonthChange`로 완전히 제어할 수 있습니다.

```tsx
import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
import { Calendar, type CalendarDate } from "@dopejs/pingo-ui";

function DateField(): PingoNode {
  const selected = useSignal<CalendarDate>({ year: 2026, month: 8, day: 22 });
  return createElement(Calendar, {
    defaultMonth: { year: 2026, month: 8, day: 1 },
    value: selected.get(),
    onSelect: (date) => selected.set(date),
  });
}
```

## 예시

### 날짜 비활성화

`isDisabled`는 날짜별로 선택 가능 여부를 반환합니다. 비활성화된 날짜는 포인터와 키보드에 반응하지 않습니다. 아래는 주말을 비활성화한 예입니다.

:::preview calendar-disabled
:::

## Props

### CalendarProps

| Prop            | 타입                              | 기본값                                 | 설명                                               |
| --------------- | --------------------------------- | -------------------------------------- | -------------------------------------------------- |
| `value`         | `CalendarDate`                    | —                                      | 선택된 날짜(제어형)                                |
| `month`         | `CalendarDate`                    | —                                      | 표시할 월(제어형). 생략하면 내부 상태로 관리합니다 |
| `defaultMonth`  | `CalendarDate`                    | `value` ?? 2026년 1월                  | 비제어 모드의 초기 월                              |
| `onSelect`      | `(date: CalendarDate) => void`    | —                                      | 날짜 클릭 콜백                                     |
| `onMonthChange` | `(month: CalendarDate) => void`   | —                                      | 월 전환 콜백(제어형과 비제어형 모두 발생)          |
| `weekdayLabels` | `readonly string[]`               | `["일","월","화","수","목","금","토"]` | 일요일부터 시작하는 요일 헤더                      |
| `monthLabel`    | `(month: CalendarDate) => string` | `"2026년 8월"` 형식                    | 사용자 지정 월 제목                                |
| `isDisabled`    | `(date: CalendarDate) => boolean` | —                                      | 특정 날짜 비활성화                                 |
| `className`     | `string`                          | —                                      | 컴포넌트 클래스 이름 뒤에 추가                     |

### CalendarDate

| 필드    | 타입     | 설명     |
| ------- | -------- | -------- |
| `year`  | `number` | 연도     |
| `month` | `number` | 월, 1–12 |
| `day`   | `number` | 일, 1–31 |

패키지에는 `daysInMonth`, `monthGrid`, `shiftMonth`, `sameDate` 등 순수 함수도 함께 내보내므로 사용자 지정 날짜 로직에 활용할 수 있습니다.

## 접근성

달력 전체는 `group` 의미론을 가집니다. 월 전환 화살표의 접근성 이름은 "previous month" / "next month"이며, 날짜 셀은 button 의미론을 갖고, 선택된 날짜는 `selected` 의미론 값을 가집니다. 키보드에서 `PageUp` / `PageDown`으로 그리드 어느 위치에서든 월을 넘길 수 있어 키보드 사용자가 현재 월에 갇히지 않습니다. 자세한 내용은 [접근성 가이드](/guide/accessibility)를 참조하세요.
