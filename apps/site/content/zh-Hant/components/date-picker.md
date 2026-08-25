---
title: Date Picker
description: 繫結日期的彈出式日曆選擇器，渲染在 pingo canvas 上。
---

# Date Picker

日期選擇器是繫結到值的 [Calendar](/components/calendar)：一個觸發器加一個彈出的月曆。下方預覽由 pingo 引擎即時渲染——日曆已展開，可以翻頁、點選日期，並跟隨網站主題切換明暗。

:::preview date-picker-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { DatePicker, type CalendarDate } from "@dopejs/pingo-ui";

root.render(
  createElement(DatePicker, {
    placeholder: "选择日期",
    onSelect: (date: CalendarDate) => console.log(date),
  }),
);
```

日期以 `CalendarDate`（`{ year, month, day }`）表示——拆成欄位儲存，任何時區都無法把它推偏一天。選中日期後彈層自動收起：選擇器停留在開啟狀態就只是一個日曆了。

## 示例

### 格式化與佔位

觸發器預設按 `YYYY-MM-DD` 顯示選中日期；`format` 可自訂渲染，`placeholder` 自訂未選中時的佔位文字。

### 受控開合

`open` 與 `onOpenChange` 組成受控開合；預設時元件自持開合狀態。

## Props

| Prop            | 型別                              | 預設值                                 | 說明                         |
| --------------- | --------------------------------- | -------------------------------------- | ---------------------------- |
| `value`         | `CalendarDate`                    | —                                      | 選中日期                     |
| `month`         | `CalendarDate`                    | —                                      | 受控顯示月份                 |
| `defaultMonth`  | `CalendarDate`                    | `value ?? 2026-01-01`                  | 非受控初始月份               |
| `onSelect`      | `(date: CalendarDate) => void`    | —                                      | 選中日期回調（隨後自動收起） |
| `onMonthChange` | `(month: CalendarDate) => void`   | —                                      | 翻頁回調                     |
| `weekdayLabels` | `readonly string[]`               | `["日","一","二","三","四","五","六"]` | 星期表頭                     |
| `monthLabel`    | `(month: CalendarDate) => string` | —                                      | 自訂月份標題                 |
| `isDisabled`    | `(date: CalendarDate) => boolean` | —                                      | 禁用特定日期                 |
| `open`          | `boolean`                         | —                                      | 受控開合                     |
| `onOpenChange`  | `(open: boolean) => void`         | —                                      | 開合回調                     |
| `placeholder`   | `string`                          | `"选择日期"`                           | 未選中時的佔位文字           |
| `format`        | `(date: CalendarDate) => string`  | `formatDate`（`YYYY-MM-DD`）           | 觸發器上的日期渲染           |
| `className`     | `string`                          | —                                      | 追加在元件類名之後           |

## 無障礙

觸發器帶 button 語義並在 `expanded` / `collapsed` 間切換；日曆部分繼承 Calendar 的網格語義。彈層開啟時焦點進入面板，收起時回到觸發器。
