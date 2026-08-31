---
title: Text Area
description: 多行文本输入框，由 pingo 编辑引擎驱动，渲染在 canvas 上。
---

# Text Area

多行文本输入，用于备注、简介等较长内容。下方预览由 pingo 引擎实时渲染——点击后可以真正输入多行文本，并跟随站点主题切换明暗。

:::preview text-area-basic
:::

## 用法

```tsx
import { TextArea } from "@dopejs/pingo-ui";

root.render(
  <TextArea
    semanticLabel="个人简介"
    width={360}
    rows={4}
    onValueChange={(value) => console.log(value)}
  />,
);
```

`rows` 决定可见行数并锁定外壳最小高度（`rows × 行高 + 上下内边距`）。与 [Input](/components/input) 一样，`TextArea` 必须用 JSX 以组件形式挂载。编辑细节见[文本编辑指南](/guide/editing)。

## 示例

### 禁用

传入 `disabled` 后字段不再接收输入，不接受焦点，也不显示光标，并应用禁用样式。

## Props

| Prop            | 类型                                     | 默认值  | 说明                                           |
| --------------- | ---------------------------------------- | ------- | ---------------------------------------------- |
| `value`         | `string`                                 | `""`    | 非受控用法的初始值；设置 `controller` 后被忽略 |
| `onValueChange` | `(value: string) => void`                | —       | 每次编辑事务应用后回调最新值                   |
| `controller`    | `TextEditingController`                  | —       | 高级逃生舱：调用方持有的持久控制器             |
| `onTransaction` | `(transaction: EditTransaction) => void` | —       | 每次编辑事务的原始回调                         |
| `onSubmit`      | `() => void`                             | —       | 提交回调                                       |
| `disabled`      | `boolean`                                | `false` | 禁用态：不接受焦点，也不显示光标               |
| `readOnly`      | `boolean`                                | `false` | 只读态                                         |
| `rows`          | `number`                                 | —       | 可见行数，决定外壳最小高度                     |
| `className`     | `string`                                 | —       | 追加在组件类名之后                             |
| `width`         | `number`                                 | —       | 固定宽度（px）                                 |
| `semanticLabel` | `string`                                 | —       | 无障碍名称                                     |

## 无障碍

通过 `semanticLabel` 提供字段名称；`disabled` 与 `readOnly` 都会让字段退出编辑序列。与 Input 共享已知缺口：暂无占位文本与聚焦环样式。
