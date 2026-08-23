---
title: Input
description: 单行文本输入框，由 pingo 编辑引擎驱动，渲染在 canvas 上。
---

# Input

单行文本输入。下方预览由 pingo 引擎实时渲染——点击后可以真正输入、选中、删除，并跟随站点主题切换明暗。

:::preview input-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Input } from "@dopejs/pingo-ui";

root.render(
  createElement(Input, {
    semanticLabel: "邮箱",
    width: 320,
    onValueChange: (value) => console.log(value),
  }),
);
```

`Input` 内部通过 hooks 维护一个稳定的 `TextEditingController`，因此必须用 `createElement(Input, props)` 以组件形式挂载，不能直接当函数调用。编辑细节见[文本编辑指南](/guide/editing)。

## 示例

### 前后缀与密码

`prefix`/`suffix` 插槽可以放图标或单位；`password` 开启掩码输入；`disabled` 禁用整个字段。

:::preview input-adornments
:::

### 受控用法

传入自己的 `controller` 即进入受控模式，此时 `value` 只作为初始值被忽略，由调用方持有控制器并跨渲染保持同一实例。

## Props

| Prop            | 类型                                                                                  | 默认值   | 说明                                           |
| --------------- | ------------------------------------------------------------------------------------- | -------- | ---------------------------------------------- |
| `value`         | `string`                                                                              | `""`     | 非受控用法的初始值；设置 `controller` 后被忽略 |
| `onValueChange` | `(value: string) => void`                                                             | —        | 每次编辑事务应用后回调最新值                   |
| `controller`    | `TextEditingController`                                                               | —        | 高级逃生舱：调用方持有的持久控制器             |
| `onTransaction` | `(transaction: EditTransaction) => void`                                              | —        | 每次编辑事务的原始回调                         |
| `onSubmit`      | `() => void`                                                                          | —        | 提交（回车）回调                               |
| `disabled`      | `boolean`                                                                             | `false`  | 禁用态：不接受焦点，也不显示光标               |
| `readOnly`      | `boolean`                                                                             | `false`  | 只读态：仍可聚焦并选中复制                     |
| `password`      | `boolean`                                                                             | `false`  | 掩码输入                                       |
| `inputMode`     | `"decimal" \| "email" \| "none" \| "numeric" \| "search" \| "tel" \| "text" \| "url"` | `"text"` | 软键盘布局提示                                 |
| `className`     | `string`                                                                              | —        | 追加在组件类名之后                             |
| `width`         | `number`                                                                              | —        | 固定宽度（px）                                 |
| `semanticLabel` | `string`                                                                              | —        | 无障碍名称                                     |
| `prefix`        | `PingoNode`                                                                           | —        | 前置装饰，如图标或货币符号                     |
| `suffix`        | `PingoNode`                                                                           | —        | 后置装饰，如单位或清除按钮                     |

## 无障碍

通过 `semanticLabel` 提供字段名称；`disabled` 与 `readOnly` 都会让字段退出编辑序列。当前已知缺口：暂无占位文本（placeholder）与聚焦环样式。
