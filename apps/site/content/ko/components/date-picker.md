---
title: Date Picker
description: 날짜를 바인딩하는 팝업형 캘린더 선택기로, pingo canvas에 렌더링됩니다.
---

# Date Picker

날짜 선택기는 값에 바인딩되는 [Calendar](/components/calendar)입니다. 트리거와 팝업형 월간 캘린더로 구성됩니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링합니다. 캘린더가 펼쳐져 있으며, 페이지를 넘기고 날짜를 선택할 수 있고, 사이트 테마에 따라 밝은 모드와 어두운 모드가 전환됩니다.

:::preview date-picker-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { DatePicker, type CalendarDate } from "@dopejs/pingo-ui";

root.render(
  createElement(DatePicker, {
    placeholder: "날짜 선택",
    onSelect: (date: CalendarDate) => console.log(date),
  }),
);
```

날짜는 `CalendarDate`(`{ year, month, day }`)로 표현됩니다. 필드로 나누어 저장하므로 어느 시간대에서도 하루가 밀리지 않습니다. 날짜를 선택하면 팝업이 자동으로 닫힙니다. 선택기가 열린 상태를 유지하면 단순한 캘린더에 불과합니다.

## 예제

### 포맷과 플레이스홀더

트리거는 기본적으로 `YYYY-MM-DD` 형식으로 선택된 날짜를 표시합니다. `format`으로 렌더링을 사용자 정의할 수 있고, `placeholder`로 선택되지 않았을 때의 플레이스홀더 텍스트를 사용자 정의할 수 있습니다.

### 제어되는 열림/닫힘

`open`과 `onOpenChange`가 제어되는 열림/닫힘을 구성합니다. 기본값에서는 컴포넌트가 열림/닫힘 상태를 자체적으로 유지합니다.

## Props

| Prop            | 타입                              | 기본값                                 | 설명                                     |
| --------------- | --------------------------------- | -------------------------------------- | ---------------------------------------- |
| `value`         | `CalendarDate`                    | —                                      | 선택된 날짜                              |
| `month`         | `CalendarDate`                    | —                                      | 제어되는 표시 월                         |
| `defaultMonth`  | `CalendarDate`                    | `value ?? 2026-01-01`                  | 비제어 초기 월                           |
| `onSelect`      | `(date: CalendarDate) => void`    | —                                      | 날짜 선택 콜백(이후 자동으로 닫힘)       |
| `onMonthChange` | `(month: CalendarDate) => void`   | —                                      | 페이지 전환 콜백                         |
| `weekdayLabels` | `readonly string[]`               | `["일","월","화","수","목","금","토"]` | 요일 헤더                                |
| `monthLabel`    | `(month: CalendarDate) => string` | —                                      | 사용자 정의 월 제목                      |
| `isDisabled`    | `(date: CalendarDate) => boolean` | —                                      | 특정 날짜 비활성화                       |
| `open`          | `boolean`                         | —                                      | 제어되는 열림/닫힘                       |
| `onOpenChange`  | `(open: boolean) => void`         | —                                      | 열림/닫힘 콜백                           |
| `placeholder`   | `string`                          | `"날짜 선택"`                          | 선택되지 않았을 때의 플레이스홀더 텍스트 |
| `format`        | `(date: CalendarDate) => string`  | `formatDate`(`YYYY-MM-DD`)             | 트리거의 날짜 렌더링                     |
| `className`     | `string`                          | —                                      | 컴포넌트 클래스 이름 뒤에 추가           |

## 접근성

트리거는 button 시맨틱을 가지며 `expanded` / `collapsed` 상태를 전환합니다. 캘린더 부분은 Calendar의 그리드 시맨틱을 상속합니다. 팝업이 열리면 포커스가 패널로 들어가고, 닫히면 트리거로 돌아갑니다.
