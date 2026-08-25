---
title: Pagination
description: shadcn 風格的分頁控制項，帶頁碼省略與邊界禁用態，渲染在 pingo canvas 上。
---

# Pagination

分頁控制項：當前頁高亮，過長的頁碼序列自動摺疊為省略號，到達首頁/末頁時對應箭頭禁用。下方預覽由 pingo 引擎即時渲染——可以點選頁碼與箭頭翻頁，並跟隨網站主題切換明暗。

:::preview pagination-basic
:::

## 用法

頁碼是**受控**的：`page` 從 1 開始，翻頁透過 `onPageChange` 上報，由你回寫。

```tsx
import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
import { Pagination } from "@dopejs/pingo-ui";

function PagedList(): PingoNode {
  const page = useSignal(1);
  return createElement(Pagination, {
    page: page.get(),
    pageCount: 12,
    onPageChange: (next) => page.set(next),
  });
}
```

## 示例

### 緊湊模式

`siblingCount` 控制當前頁兩側展示的頁碼數（不含首尾頁，首尾恆顯示）。設為 `0` 時只保留首尾與當前頁；在首頁時上一頁箭頭禁用。

:::preview pagination-compact
:::

頁碼序列的摺疊規則由匯出的純函式 `paginationRange(page, pageCount, siblingCount)` 實作，可單獨用於測試。

## Props

| Prop            | 型別                     | 預設值 | 說明                                                           |
| --------------- | ------------------------ | ------ | -------------------------------------------------------------- |
| `page`          | `number`                 | —      | 當前頁，從 1 開始（必填）；越界會被收斂到 `[1, pageCount]`     |
| `pageCount`     | `number`                 | —      | 總頁數（必填）；小於 1 時不渲染任何頁碼                        |
| `onPageChange`  | `(page: number) => void` | —      | 翻頁回調；點選當前頁或越界目標不會觸發                         |
| `siblingCount`  | `number`                 | `1`    | 當前頁兩側各展示的頁碼數                                       |
| `previousLabel` | `string`                 | —      | 型別中預留的上一頁文案；當前版本渲染為圖示，該欄位尚未參與渲染 |
| `nextLabel`     | `string`                 | —      | 型別中預留的下一頁文案；當前版本渲染為圖示，該欄位尚未參與渲染 |
| `className`     | `string`                 | —      | 追加在元件類名之後                                             |

## 無障礙

控制項整體是 `navigation` 語義；當前頁帶 `current` 語義值，前後翻頁按鈕的無障礙名稱為 "previous page" / "next page"，到達邊界時禁用且不響應指標。鍵盤上 `ArrowLeft` / `ArrowRight` 在控制項內任意焦點處翻頁。更多見[無障礙指南](/guide/accessibility)。
