---
title: Radio Group
description: 单选选项组，支持方向键导航，渲染在 pingo canvas 上。
---

# Radio Group

单选组用于从一组互斥选项中选一项。下方预览由 pingo 引擎实时渲染——可以点击选项或用方向键移动选择，并跟随站点主题切换明暗。

:::preview radio-group-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { RadioGroup, RadioGroupItem } from "@dopejs/pingo-ui";

root.render(
  createElement(RadioGroup, {
    defaultValue: "b",
    onValueChange: (value) => console.log(value),
    children: [
      createElement(RadioGroupItem, { value: "a", label: "选项 A" }),
      createElement(RadioGroupItem, { value: "b", label: "选项 B" }),
      createElement(RadioGroupItem, { value: "c", label: "选项 C" }),
    ],
  }),
);
```

`RadioGroup` 通过 context 向 `RadioGroupItem` 发布当前值，因此两者都必须用 `createElement` 以组件形式挂载。传入 `value` 即进入受控模式；否则用 `defaultValue` 让组件自持状态。

## 示例

### 禁用

在 `RadioGroup` 上传入 `disabled` 会禁用整组，单项语义值变为 `disabled`。

## Props

### RadioGroup

| Prop            | 类型                      | 默认值  | 说明                          |
| --------------- | ------------------------- | ------- | ----------------------------- |
| `value`         | `string`                  | —       | 受控选中值                    |
| `defaultValue`  | `string`                  | —       | 非受控初始选中值              |
| `onValueChange` | `(value: string) => void` | —       | 选中变化回调                  |
| `disabled`      | `boolean`                 | `false` | 禁用整组                      |
| `children`      | `PingoNode`               | —       | `RadioGroupItem` 列表（必填） |
| `className`     | `string`                  | —       | 追加在组件类名之后            |

### RadioGroupItem

| Prop        | 类型     | 默认值 | 说明               |
| ----------- | -------- | ------ | ------------------ |
| `value`     | `string` | —      | 选项值（必填）     |
| `label`     | `string` | —      | 选项文字           |
| `className` | `string` | —      | 追加在组件类名之后 |

## 无障碍

组容器带 `radiogroup` 语义，单项带 `radio` 语义并在 `checked` / `unchecked` / `disabled` 间切换。遵循 WAI-ARIA：单选组无论布局方向如何，两组方向键都可移动选择并同步焦点。
