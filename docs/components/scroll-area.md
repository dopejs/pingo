---
title: Scroll Area
description: 带绘制式滚动条的滚动容器，渲染在 pingo canvas 上。
---

# Scroll Area

Scroll Area 在固定尺寸的视口内滚动过长的内容，并绘制一条与主题一致的滚动条。下方预览由 pingo 引擎实时渲染——在列表上滚动试试。

:::preview scroll-area-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { ScrollArea } from "@dopejs/pingo-ui";

root.render(
  createElement(ScrollArea, {
    children: items.map((item) => createElement("text", { value: item })),
  }),
);
```

组件自身宽高为父容器的 100%，需要一个有确定尺寸的父容器；内容超出视口时才会出现滚动条。

## Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | 滚动内容（必填） |
| `hideScrollbar` | `boolean` | `false` | 隐藏绘制的滚动条（滚动能力不变） |
| `className` | `string` | — | 追加在组件类名之后 |

## 无障碍

滚动行为由引擎 Core 提供，视口保持可聚焦与键盘滚动能力。滚动条由视口与内容的实测几何推导，拖快时滚动条滑块可能滞后一帧。

滚动相关的引擎行为见[滚动指南](/guide/scrolling)。
