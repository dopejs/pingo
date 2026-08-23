---
title: Slider
description: 数值滑杆，支持拖拽与键盘微调，渲染在 pingo canvas 上。
---

# Slider

滑杆用于在一个区间内选择数值。下方预览由 pingo 引擎实时渲染——可以拖拽滑块或用方向键微调，并跟随站点主题切换明暗。

:::preview slider-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Slider } from "@dopejs/pingo-ui";

root.render(
  createElement(Slider, {
    defaultValue: 40,
    min: 0,
    max: 100,
    step: 1,
    semanticLabel: "音量",
    onValueChange: (value) => console.log(value),
  }),
);
```

`Slider` 内部通过 hooks 持有拖拽状态，必须用 `createElement` 以组件形式挂载。传入 `value` 即进入受控模式；否则用 `defaultValue` 让组件自持状态。

## 示例

### 区间与步进

`min` / `max` 限定取值区间（默认 0–100），`step` 决定键盘微调的粒度（默认 1）。

### 禁用

传入 `disabled` 后滑杆不再响应拖拽与键盘。

## Props

| Prop            | 类型                      | 默认值  | 说明               |
| --------------- | ------------------------- | ------- | ------------------ |
| `value`         | `number`                  | —       | 受控当前值         |
| `defaultValue`  | `number`                  | `min`   | 非受控初始值       |
| `onValueChange` | `(value: number) => void` | —       | 值变化回调         |
| `min`           | `number`                  | `0`     | 最小值             |
| `max`           | `number`                  | `100`   | 最大值             |
| `step`          | `number`                  | `1`     | 键盘步进           |
| `disabled`      | `boolean`                 | `false` | 禁用态             |
| `semanticLabel` | `string`                  | —       | 无障碍名称         |
| `className`     | `string`                  | —       | 追加在组件类名之后 |

## 无障碍

组件带 `slider` 语义角色，语义值为当前数值的字符串形式。`←`/`↓` 减一个 `step`，`→`/`↑` 加一个 `step`，`Home`/`End` 跳到区间两端；数值始终被钳制在 `[min, max]` 内。
