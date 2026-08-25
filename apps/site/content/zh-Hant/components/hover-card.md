---
title: Hover Card
description: 懸停時展開的富內容卡片，帶開啟與關閉延遲。
---

# Hover Card

Hover Card 在懸停（或聚焦）觸發器時展開一張富內容卡片——比 Tooltip 承載更多資訊，比如使用者資料預覽。下方預覽由 pingo 引擎即時渲染（以受控 `open` 常開展示），並跟隨網站主題切換明暗。

:::preview hover-card-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { HoverCard } from "@dopejs/pingo-ui";

root.render(
  createElement(HoverCard, {
    openDelayMs: 300,
    closeDelayMs: 200,
    children: createElement("text", { value: "@pingo" }),
    content: createElement("text", { value: "Canvas 渲染引擎与 UI 组件库。" }),
  }),
);
```

卡片在開啟後懸停在卡片自身上也不會關閉，因此 `closeDelayMs` 給了指標跨越觸發器與卡片之間空隙的時間。傳入 `open` 可切換為受控模式，配合 `onOpenChange` 自行管理狀態。

## Props

| Prop           | 型別                      | 預設值 | 說明                   |
| -------------- | ------------------------- | ------ | ---------------------- |
| `children`     | `PingoNode`               | —      | 觸發元素（必填）       |
| `content`      | `PingoNode`               | —      | 卡片內容（必填）       |
| `open`         | `boolean`                 | —      | 受控開合狀態           |
| `onOpenChange` | `(open: boolean) => void` | —      | 開合變化回調           |
| `openDelayMs`  | `number`                  | `300`  | 開啟延遲（毫秒）       |
| `closeDelayMs` | `number`                  | `200`  | 關閉延遲（毫秒）       |
| `className`    | `string`                  | —      | 追加在錨點容器類名之後 |

## 無障礙

觸發器在聚焦時同樣會開啟卡片，失焦關閉，鍵盤使用者不會丟失內容。
