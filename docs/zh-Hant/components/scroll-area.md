---
title: Scroll Area
description: 帶繪製式捲軸的捲動容器，渲染在 pingo canvas 上。
---

# Scroll Area

Scroll Area 在固定尺寸的視口內捲動過長的內容，並繪製一條與主題一致的捲軸。下方預覽由 pingo 引擎即時渲染——在列表上捲動試試。

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

元件自身寬高為父容器的 100%，需要一個有確定尺寸的父容器；內容超出視口時才會出現捲軸。

## Props

| Prop            | 型別        | 預設值  | 說明                           |
| --------------- | ----------- | ------- | ------------------------------ |
| `children`      | `PingoNode` | —       | 捲動內容（必填）               |
| `hideScrollbar` | `boolean`   | `false` | 隱藏繪製的捲軸（捲動能力不變） |
| `className`     | `string`    | —       | 追加在元件類名之後             |

## 無障礙

捲動行為由引擎 Core 提供，視口保持可聚焦與鍵盤捲動能力。捲軸由視口與內容的實測幾何推導，拖快時捲軸滑塊可能滯後一幀。

捲動相關的引擎行為見[捲動指南](/guide/scrolling)。
