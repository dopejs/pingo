---
title: Select
description: 组合式下拉选择器，支持键盘导航，渲染在 pingo canvas 上。
---

# Select

下拉选择器由 `Select`、`SelectTrigger`、`SelectContent`、`SelectItem` 组合而成。下方预览由 pingo 引擎实时渲染——列表已展开，可以用方向键导航、回车选中，并跟随站点主题切换明暗。

:::preview select-basic
:::

## 用法

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger } from "@dopejs/pingo-ui";

root.render(
  <Select value="pingo-ui" onValueChange={(value) => console.log(value)}>
    <SelectTrigger placeholder="选择一个包" />
    <SelectContent>
      <SelectItem value="pingo">@dopejs/pingo</SelectItem>
      <SelectItem value="pingo-ui">@dopejs/pingo-ui</SelectItem>
    </SelectContent>
  </Select>,
);
```

所有部分通过 context 协作，都必须用 JSX 以组件形式挂载。触发器显示当前选中的 `value`；未选中时显示 `placeholder`。

## 示例

### 默认展开

`defaultOpen` 让列表初始展开（如上方预览）；`onOpenChange` 监听开合。

## Props

### Select

| Prop            | 类型                      | 默认值  | 说明                           |
| --------------- | ------------------------- | ------- | ------------------------------ |
| `value`         | `string`                  | —       | 选中值，显示在触发器上         |
| `defaultOpen`   | `boolean`                 | `false` | 初始展开                       |
| `onValueChange` | `(value: string) => void` | —       | 选中变化回调（选中后自动收起） |
| `onOpenChange`  | `(open: boolean) => void` | —       | 开合回调                       |
| `children`      | `PingoNode`               | —       | 触发器与内容（必填）           |
| `className`     | `string`                  | —       | 追加在组件类名之后             |

### SelectTrigger

| Prop          | 类型        | 默认值 | 说明                                       |
| ------------- | ----------- | ------ | ------------------------------------------ |
| `children`    | `PingoNode` | —      | 自定义触发器内容；缺省渲染选中值或占位文本 |
| `placeholder` | `string`    | —      | 未选中时的占位文本                         |
| `className`   | `string`    | —      | 追加在组件类名之后                         |

### SelectContent

| Prop        | 类型        | 默认值 | 说明                      |
| ----------- | ----------- | ------ | ------------------------- |
| `children`  | `PingoNode` | —      | `SelectItem` 列表（必填） |
| `className` | `string`    | —      | 追加在组件类名之后        |

### SelectItem

| Prop        | 类型     | 默认值 | 说明               |
| ----------- | -------- | ------ | ------------------ |
| `value`     | `string` | —      | 选项值（必填）     |
| `children`  | `string` | —      | 选项文字（必填）   |
| `className` | `string` | —      | 追加在组件类名之后 |

## 无障碍

触发器带 button 语义并在 `expanded` / `collapsed` 间切换；内容带 menu 语义。方向键移动高亮，`Enter`/`空格` 选中，`Esc` 关闭；选中后焦点回到触发器。
