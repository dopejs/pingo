---
title: Sheet
description: 從任意螢幕邊緣滑入的面板，適合篩選、詳情等次級內容。
---

# Sheet

Sheet 從容器邊緣滑入一個面板，常用於篩選條件、詳情側欄等不打斷主流程的次級內容。下方預覽由 pingo 引擎即時渲染，並跟隨網站主題切換明暗。

:::preview sheet-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Sheet } from "@dopejs/pingo-ui";

root.render(
  createElement(Sheet, {
    open,
    onOpenChange: (next) => setOpen(next),
    side: "right",
    children: createElement("text", { value: "面板内容" }),
  }),
);
```

浮層填滿它自己的父容器，請掛載在靠近根節點的位置。`open` 為受控 prop；點選遮罩或按 `Escape` 會透過 `onOpenChange(false)` 請求關閉。面板內的標題/按鈕區塊可複用 `DialogHeader`、`DialogTitle`、`DialogDescription` 與 `DialogFooter`。

## 示例

### 方向

`side` 支援 `"left"`、`"right"`、`"top"`、`"bottom"`，預設 `"right"`。只需要上下邊緣時請使用語義更明確的 [Drawer](/components/drawer)。

## Props

繼承 `DialogProps`（`open`、`onOpenChange`、`children`、`className`），另有：

| Prop   | 型別                                     | 預設值    | 說明     |
| ------ | ---------------------------------------- | --------- | -------- |
| `side` | `"left" \| "right" \| "top" \| "bottom"` | `"right"` | 滑入邊緣 |

## 無障礙

面板具備 complementary 語義；開啟時焦點移入面板，`Escape` 關閉後焦點回到觸發元素。
