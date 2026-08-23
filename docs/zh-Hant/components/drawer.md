---
title: Drawer
description: 從上下邊緣滑入的抽屜面板，適合移動端風格的底部操作。
---

# Drawer

抽屜是從水平邊緣滑入的面板——等價於一個 `side` 只取 `"top" | "bottom"` 的 [Sheet](/components/sheet)。下方預覽由 pingo 引擎即時渲染，並跟隨網站主題切換明暗。

:::preview drawer-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Drawer } from "@dopejs/pingo-ui";

root.render(
  createElement(Drawer, {
    open,
    onOpenChange: (next) => setOpen(next),
    side: "bottom",
    children: createElement("text", { value: "抽屉内容" }),
  }),
);
```

浮層填滿它自己的父容器，請掛載在靠近根節點的位置。`open` 為受控 prop；點選遮罩或按 `Escape` 會透過 `onOpenChange(false)` 請求關閉。面板內的標題/按鈕區塊可複用 `DialogHeader`、`DialogTitle`、`DialogDescription` 與 `DialogFooter`。

## 示例

### 方向

`side` 支援 `"top"` 與 `"bottom"`，預設 `"bottom"`。

## Props

繼承 `DialogProps`（`open`、`onOpenChange`、`children`、`className`），另有：

| Prop | 型別 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `side` | `"top" \| "bottom"` | `"bottom"` | 滑入邊緣 |

## 無障礙

面板具備 complementary 語義；開啟時焦點移入面板，`Escape` 關閉後焦點回到觸發元素。
