---
title: Aspect Ratio
description: 按固定寬高比約束內容的容器，渲染在 pingo canvas 上。
---

# Aspect Ratio

Aspect Ratio 讓內容保持固定的寬高比：寬度由版面決定，高度按比值自動計算。下方預覽由 pingo 引擎即時渲染。

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

元件寬度為父容器的 100%；`ratio` 為寬除以高，例如 `16 / 9` 表示寬屏。

## Props

| Prop | 型別 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `ratio` | `number` | `1` | 寬高比（寬 ÷ 高） |
| `children` | `PingoNode` | — | 受約束的內容（必填） |
| `className` | `string` | — | 追加在元件類名之後 |

## 無障礙

Aspect Ratio 是純版面容器，不引入額外語義。由於 CSS 子集中沒有 `aspect-ratio` 屬性，元件透過實測寬度計算高度，首幀會先以零高度渲染、測量到達後再確定高度。
