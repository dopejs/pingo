---
title: Skeleton
description: 內容載入期間的佔位骨架塊，渲染在 pingo canvas 上。
---

# Skeleton

Skeleton 在內容載入完成前展示與最終版面形狀相近的佔位塊，降低等待時的跳變感。下方預覽由 pingo 引擎即時渲染，並跟隨網站主題切換明暗。

:::preview skeleton-card
:::

## 用法

```tsx
import { Skeleton } from "@dopejs/pingo-ui";

root.render(<Skeleton width={320} height={16} />);
```

`width` / `height` 均可省略，此時尺寸完全交給外層版面與你的樣式表。

## 示例

### 組合成頁面骨架

用多個不同尺寸的 Skeleton 拼出即將出現的內容結構——上方預覽就是一個「頭像 + 標題 + 兩行正文」的卡片骨架。pingo 沒有 gap 屬性，塊間距用固定尺寸的空容器實作，參見[樣式指南](/guide/styling)。

## Props

| Prop        | 型別     | 預設值 | 說明                               |
| ----------- | -------- | ------ | ---------------------------------- |
| `width`     | `number` | —      | 佔位塊寬度（px），省略時由版面決定 |
| `height`    | `number` | —      | 佔位塊高度（px），省略時由版面決定 |
| `className` | `string` | —      | 追加在元件類名之後                 |

## 無障礙

Skeleton 是裝飾性佔位，不攜帶語義。載入完成後應整體替換為真實內容；長時間停留在骨架屏意味著載入失敗，請給出錯誤提示與重試入口。

當前為靜態佔位（無脈衝動畫）——核心動畫子集暫不支援 CSS keyframes。
