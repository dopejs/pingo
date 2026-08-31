---
title: Collapsible
description: 單個可展開收起的內容區，渲染在 pingo canvas 上。
---

# Collapsible

Collapsible 是 Accordion 的單項原語：一個觸發器控制一塊內容的展開與收起，適合只需要一個摺疊區的場景。下方預覽由 pingo 引擎即時渲染——點選觸發器切換。

:::preview collapsible-basic
:::

## 用法

```tsx
import { Collapsible } from "@dopejs/pingo-ui";

root.render(
  <Collapsible trigger="高级选项" defaultOpen>
    <text value="折叠区内容。" />
  </Collapsible>,
);
```

既支援非受控（`defaultOpen`）也支援受控（`open` + `onOpenChange`）兩種用法。

## 示例

### 禁用

傳入 `disabled` 後觸發器不再響應指標與鍵盤，並應用禁用樣式。

:::preview collapsible-disabled
:::

## Props

| Prop           | 型別                      | 預設值  | 說明                     |
| -------------- | ------------------------- | ------- | ------------------------ |
| `trigger`      | `string`                  | —       | 觸發器文字（必填）       |
| `children`     | `PingoNode`               | —       | 展開後顯示的內容（必填） |
| `open`         | `boolean`                 | —       | 受控：當前展開狀態       |
| `defaultOpen`  | `boolean`                 | `false` | 非受控：初始展開狀態     |
| `onOpenChange` | `(open: boolean) => void` | —       | 展開狀態變化回調         |
| `disabled`     | `boolean`                 | `false` | 禁用觸發器               |
| `className`    | `string`                  | —       | 追加在元件類名之後       |

## 無障礙

觸發器具備 button 語義，並向輔助技術暴露 expanded/collapsed 狀態；Enter 與空格切換展開。內容收起時以 `display: none` 隱藏而非卸載，內部的捲動位置與編輯狀態得以保留。
