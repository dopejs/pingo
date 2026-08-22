---
title: Form
description: 表单容器与字段包装器，负责布局、语义与错误/描述信息位，渲染在 pingo canvas 上。
---

# Form

`Form` 是表单容器，`FormField` 把标签、控件和错误/描述信息组装成一个字段。下方预览由 pingo 引擎实时渲染——字段里的输入框可以真正编辑，并跟随站点主题切换明暗。

:::preview form-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Form, FormField, Input } from "@dopejs/pingo-ui";

root.render(
  createElement(Form, {
    children: createElement(FormField, {
      label: "邮箱",
      required: true,
      error: emailError, // 校验规则由调用方持有
      children: createElement(Input, {
        semanticLabel: "邮箱",
        onValueChange: (value) => validate(value),
      }),
    }),
  }),
);
```

校验不在组件内：何时校验、报什么错、如何组合都是产品决策。调用方持有规则并传入 `error`，组件只负责布局、语义与信息位。

## 示例

### 错误与描述

`error` 存在时字段被标记为无效，并**替换**描述文本——两行指引中若有一行是失败信息，另一行会把它淹没。`required` 在标签后追加 `*` 标记。

## Props

### Form

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | 表单内容（必填） |
| `className` | `string` | — | 追加在组件类名之后 |

### FormField

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `label` | `string` | — | 字段标签（必填） |
| `children` | `PingoNode` | — | 字段控件（必填） |
| `error` | `string` | — | 错误信息；存在即标记字段无效并替换描述 |
| `description` | `string` | — | 辅助描述文本 |
| `required` | `boolean` | `false` | 必填标记，标签后追加 `*` |
| `className` | `string` | — | 追加在组件类名之后 |

## 无障碍

`Form` 带 `form` 语义角色；`FormField` 带 `group` 语义并以标签命名，无效时语义值为 `invalid`。语义标注在组上而不是控件上——控件是调用方的，组是唯一保证存在的元素。
