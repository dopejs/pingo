---
title: Date Picker
description: 绑定日期的弹出式日历选择器，渲染在 pingo canvas 上。
---

# Date Picker

日期选择器是绑定到值的 [Calendar](/components/calendar)：一个触发器加一个弹出的月历。下方预览由 pingo 引擎实时渲染——日历已展开，可以翻页、点选日期，并跟随站点主题切换明暗。

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

日期以 `CalendarDate`（`{ year, month, day }`）表示——拆成字段保存，任何时区都无法把它推偏一天。选中日期后弹层自动收起：选择器停留在打开状态就只是一个日历了。

## 示例

### 格式化与占位

触发器默认按 `YYYY-MM-DD` 显示选中日期；`format` 可自定义渲染，`placeholder` 自定义未选中时的占位文本。

### 受控开合

`open` 与 `onOpenChange` 组成受控开合；缺省时组件自持开合状态。

## Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `CalendarDate` | — | 选中日期 |
| `month` | `CalendarDate` | — | 受控显示月份 |
| `defaultMonth` | `CalendarDate` | `value ?? 2026-01-01` | 非受控初始月份 |
| `onSelect` | `(date: CalendarDate) => void` | — | 选中日期回调（随后自动收起） |
| `onMonthChange` | `(month: CalendarDate) => void` | — | 翻页回调 |
| `weekdayLabels` | `readonly string[]` | `["日","一","二","三","四","五","六"]` | 星期表头 |
| `monthLabel` | `(month: CalendarDate) => string` | — | 自定义月份标题 |
| `isDisabled` | `(date: CalendarDate) => boolean` | — | 禁用特定日期 |
| `open` | `boolean` | — | 受控开合 |
| `onOpenChange` | `(open: boolean) => void` | — | 开合回调 |
| `placeholder` | `string` | `"选择日期"` | 未选中时的占位文本 |
| `format` | `(date: CalendarDate) => string` | `formatDate`（`YYYY-MM-DD`） | 触发器上的日期渲染 |
| `className` | `string` | — | 追加在组件类名之后 |

## 无障碍

触发器带 button 语义并在 `expanded` / `collapsed` 间切换；日历部分继承 Calendar 的网格语义。弹层打开时焦点进入面板，收起时回到触发器。
