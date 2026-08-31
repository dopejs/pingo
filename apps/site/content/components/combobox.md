---
title: Combobox
description: 可搜索的下拉选择器，输入过滤选项列表，渲染在 pingo canvas 上。
---

# Combobox

组合框把一个显示选中值的触发器和一份可搜索的选项列表绑定在一起。下方预览由 pingo 引擎实时渲染——列表已展开，可以输入过滤、用方向键选择，并跟随站点主题切换明暗。

:::preview combobox-basic
:::

## 用法

```tsx
import { Combobox } from "@dopejs/pingo-ui";

root.render(
  <Combobox
    items={[
      { value: "next", label: "Next.js" },
      { value: "remix", label: "Remix" },
      { value: "astro", label: "Astro" },
    ]}
    placeholder="选择框架"
    onValueChange={(value) => console.log(value)}
  />,
);
```

`items` 是 `{ value, label }` 数组；过滤是对 `label` 的大小写不敏感子串匹配——刻意不做模糊排序，错误的排序比没有排序更糟。选中后列表自动收起，查询词在**关闭时**清空，避免重新打开时对着一个早已忘记的过滤词。

## 示例

### 受控

`value` / `onValueChange` 与 `open` / `onOpenChange` 都可以受控；缺省时组件用 `defaultValue` / `defaultOpen` 自持状态。

### 空状态

`emptyLabel` 自定义过滤无结果时的提示文本。

## Props

| Prop            | 类型                                          | 默认值     | 说明                           |
| --------------- | --------------------------------------------- | ---------- | ------------------------------ |
| `items`         | `readonly { value: string; label: string }[]` | —          | 选项列表（必填）               |
| `value`         | `string`                                      | —          | 受控选中值                     |
| `defaultValue`  | `string`                                      | —          | 非受控初始选中值               |
| `onValueChange` | `(value: string) => void`                     | —          | 选中变化回调（选中后自动收起） |
| `open`          | `boolean`                                     | —          | 受控开合                       |
| `defaultOpen`   | `boolean`                                     | `false`    | 非受控初始开合                 |
| `onOpenChange`  | `(open: boolean) => void`                     | —          | 开合回调                       |
| `placeholder`   | `string`                                      | `"请选择"` | 未选中时触发器上的占位文本     |
| `emptyLabel`    | `string`                                      | —          | 过滤无结果时的提示             |
| `className`     | `string`                                      | —          | 追加在组件类名之后             |

## 无障碍

触发器带 button 语义并在 `expanded` / `collapsed` 间切换。列表打开时焦点进入搜索框，方向键移动高亮，回车选中并关闭；关闭后焦点回到触发器。
