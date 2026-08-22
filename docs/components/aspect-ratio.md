---
title: Aspect Ratio
description: 按固定宽高比约束内容的容器，渲染在 pingo canvas 上。
---

# Aspect Ratio

Aspect Ratio 让内容保持固定的宽高比：宽度由布局决定，高度按比值自动计算。下方预览由 pingo 引擎实时渲染。

:::preview aspect-ratio-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { AspectRatio } from "@dopejs/pingo-ui";

root.render(
  createElement(AspectRatio, {
    ratio: 16 / 9,
    children: coverImage,
  }),
);
```

组件宽度为父容器的 100%；`ratio` 为宽除以高，例如 `16 / 9` 表示宽屏。

## Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `ratio` | `number` | `1` | 宽高比（宽 ÷ 高） |
| `children` | `PingoNode` | — | 受约束的内容（必填） |
| `className` | `string` | — | 追加在组件类名之后 |

## 无障碍

Aspect Ratio 是纯布局容器，不引入额外语义。由于 CSS 子集中没有 `aspect-ratio` 属性，组件通过实测宽度计算高度，首帧会先以零高度渲染、测量到达后再确定高度。
