---
title: Toggle Group
description: 一组两态切换按钮，单选或多选，支持方向键导航，渲染在 pingo canvas 上。
---

# Toggle Group

切换按钮组把若干 [Toggle](/components/toggle) 组合成一个单选或多选集合。下方预览由 pingo 引擎实时渲染——可以点按切换、用方向键在项间移动，并跟随站点主题切换明暗。

:::preview toggle-group-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { ToggleGroup, ToggleGroupItem } from "@dopejs/pingo-ui";

root.render(
  createElement(ToggleGroup, {
    type: "single",
    defaultValue: ["center"],
    onValueChange: (value) => console.log(value),
    children: [
      createElement(ToggleGroupItem, { value: "left", children: "左对齐" }),
      createElement(ToggleGroupItem, { value: "center", children: "居中" }),
      createElement(ToggleGroupItem, { value: "right", children: "右对齐" }),
    ],
  }),
);
```

`ToggleGroup` 通过 context 向 `ToggleGroupItem` 发布选中集合，两者都必须用 `createElement` 以组件形式挂载。`type: "single"` 时新选择会清掉上一个；`"multiple"` 时逐项累加。

## 示例

### 多选

`type="multiple"` 允许同时按下多项，如文本格式工具栏。

:::preview toggle-group-multiple
:::

## Props

### ToggleGroup

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `"single" \| "multiple"` | `"single"` | 单选清掉上一个选择；多选逐项累加 |
| `value` | `readonly string[]` | — | 受控选中值集合 |
| `defaultValue` | `readonly string[]` | `[]` | 非受控初始选中集合 |
| `onValueChange` | `(value: readonly string[]) => void` | — | 选中集合变化回调 |
| `children` | `PingoNode` | — | `ToggleGroupItem` 列表（必填） |
| `className` | `string` | — | 追加在组件类名之后 |

### ToggleGroupItem

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 项值（必填） |
| `children` | `string` | — | 项文本（必填） |
| `disabled` | `boolean` | `false` | 禁用单项 |
| `className` | `string` | — | 追加在组件类名之后 |

## 无障碍

组容器带 `group` 语义，各项继承 Toggle 的 button 语义与 `on` / `off` 语义值。键盘处理集中在组上：`←`/`→` 把焦点移到相邻项，`Enter`/`空格` 切换当前项——项的增删不影响这套导航。
