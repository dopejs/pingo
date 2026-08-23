---
title: Calendar
description: shadcn 風格的月曆，固定六行網格，日期以年月日部分表示以避免時區偏移。
---

# Calendar

shadcn 風格的月曆。日期用 `{ year, month, day }` 三個部分表示（`month` 從 1 開始），任何時區都不會把日期移位；網格固定六行，翻月時元件高度不變。下方預覽由 pingo 引擎即時渲染——可以點選選擇日期、用箭頭翻月，並跟隨網站主題切換明暗。

:::preview calendar-basic
:::

## 用法

選中態是**受控**的：點選日期觸發 `onSelect`，由你回寫 `value`。月份則可以在元件內部自管理（`defaultMonth`），也可以透過 `month` + `onMonthChange` 完全受控。

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

`isDisabled` 按日期回傳是否可選；禁用的日期不響應指標與鍵盤。下面禁用了週末：

:::preview calendar-disabled
:::

## Props

### CalendarProps

| Prop            | 型別                              | 預設值                                 | 說明                                     |
| --------------- | --------------------------------- | -------------------------------------- | ---------------------------------------- |
| `value`         | `CalendarDate`                    | —                                      | 選中的日期（受控）                       |
| `month`         | `CalendarDate`                    | —                                      | 顯示的月份（受控）；省略時由內部狀態管理 |
| `defaultMonth`  | `CalendarDate`                    | `value` ?? 2026 年 1 月                | 非受控模式下的初始月份                   |
| `onSelect`      | `(date: CalendarDate) => void`    | —                                      | 點選日期回調                             |
| `onMonthChange` | `(month: CalendarDate) => void`   | —                                      | 翻月回調（受控與非受控都會觸發）         |
| `weekdayLabels` | `readonly string[]`               | `["日","一","二","三","四","五","六"]` | 星期表頭，從週日開始                     |
| `monthLabel`    | `(month: CalendarDate) => string` | `"2026 年 8 月"` 格式                  | 自訂月份標題                             |
| `isDisabled`    | `(date: CalendarDate) => boolean` | —                                      | 禁用某些日期                             |
| `className`     | `string`                          | —                                      | 追加在元件類名之後                       |

### CalendarDate

| 欄位    | 型別     | 說明       |
| ------- | -------- | ---------- |
| `year`  | `number` | 年份       |
| `month` | `number` | 月份，1–12 |
| `day`   | `number` | 日，1–31   |

套件內同時匯出 `daysInMonth`、`monthGrid`、`shiftMonth`、`sameDate` 等純函式，便於自訂日期邏輯。

## 無障礙

日曆整體是 `group` 語義；翻月箭頭的無障礙名稱為 "previous month" / "next month"，日期單元格為 button 語義，選中日帶 `selected` 語義值。鍵盤上 `PageUp` / `PageDown` 可從網格任意位置翻月，不會把鍵盤使用者困在當前月。更多見[無障礙指南](/guide/accessibility)。
