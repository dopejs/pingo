---
title: Calendar
description: shadcn风格月历，固定六行网格，日期以年月日部分表示以避免时区偏移。
---

# Calendar

shadcn 风格的月历。日期用 `{ year, month, day }` 三个部分表示（`month` 从 1 开始），任何时区都不会把日期移位；网格固定六行，翻月时组件高度不变。下方预览由 pingo 引擎实时渲染——可以点击选择日期、用箭头翻月，并跟随站点主题切换明暗。

:::preview calendar-basic
:::

## 用法

选中态是**受控**的：点击日期触发 `onSelect`，由你回写 `value`。月份则可以在组件内部自管理（`defaultMonth`），也可以通过 `month` + `onMonthChange` 完全受控。

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

## 示例

### 禁用日期

`isDisabled` 按日期返回是否可选；禁用的日期不响应指针与键盘。下面禁用了周末：

:::preview calendar-disabled
:::

## Props

### CalendarProps

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `CalendarDate` | — | 选中的日期（受控） |
| `month` | `CalendarDate` | — | 显示的月份（受控）；省略时由内部状态管理 |
| `defaultMonth` | `CalendarDate` | `value` ?? 2026 年 1 月 | 非受控模式下的初始月份 |
| `onSelect` | `(date: CalendarDate) => void` | — | 点击日期回调 |
| `onMonthChange` | `(month: CalendarDate) => void` | — | 翻月回调（受控与非受控都会触发） |
| `weekdayLabels` | `readonly string[]` | `["日","一","二","三","四","五","六"]` | 星期表头，从周日开始 |
| `monthLabel` | `(month: CalendarDate) => string` | `"2026 年 8 月"` 格式 | 自定义月份标题 |
| `isDisabled` | `(date: CalendarDate) => boolean` | — | 禁用某些日期 |
| `className` | `string` | — | 追加在组件类名之后 |

### CalendarDate

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `year` | `number` | 年份 |
| `month` | `number` | 月份，1–12 |
| `day` | `number` | 日，1–31 |

包内同时导出 `daysInMonth`、`monthGrid`、`shiftMonth`、`sameDate` 等纯函数，便于自定义日期逻辑。

## 无障碍

日历整体是 `group` 语义；翻月箭头的无障碍名称为 "previous month" / "next month"，日期单元格为 button 语义，选中日带 `selected` 语义值。键盘上 `PageUp` / `PageDown` 可从网格任意位置翻月，不会把键盘用户困在当前月。更多见[无障碍指南](/guide/accessibility)。
