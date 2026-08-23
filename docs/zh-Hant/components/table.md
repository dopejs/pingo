---
title: Table
description: 虛擬捲動的資料表格，列定義同時驅動表頭與行，渲染在 pingo canvas 上。
---

# Table

虛擬捲動表格：列定義同時驅動表頭與每一行，一萬行與一屏行的渲染成本相同。下方預覽由 pingo 引擎即時渲染——可以捲動、點選行，並跟隨網站主題切換明暗。

:::preview table-basic
:::

## 用法

`Table` 是純建構函式而非 memo 元件，直接呼叫即可回傳場景節點。在元件渲染作用域內呼叫（如下方的函式元件），其主題讀取才會訂閱網站主題切換。

```tsx
import { createElement, type PingoNode } from "@dopejs/pingo";
import { Table } from "@dopejs/pingo-ui";

type FileRow = { name: string; size: string };

function FileTable(): PingoNode {
  return Table<FileRow>({
    columns: [
      {
        key: "name",
        header: "名称",
        cell: (row) => createElement("text", { value: row.name }),
      },
      {
        key: "size",
        header: "大小",
        width: 96,
        align: "end",
        cell: (row) => createElement("text", { value: row.size }),
      },
    ],
    rowCount: files.length,
    getRow: (index) => files[index],
    onRowPress: (index) => open(files[index]),
  });
}
```

表格主體是 [VirtualList](/guide/scrolling)，需要父容器給定高度（示例中外層容器 `height: 260`）。

## 示例

### 空狀態

`rowCount` 為 `0` 時渲染 `emptyLabel`（預設「暫無資料」），不再建立虛擬列表。

:::preview table-empty
:::

## Props

### TableProps\<Row\>

| Prop | 型別 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `columns` | `readonly TableColumn<Row>[]` | — | 列定義，同時驅動表頭與行（必填） |
| `rowCount` | `number` | — | 總行數（必填）；為 `0` 時渲染空狀態 |
| `getRow` | `(index: number) => Row` | — | 按行號取行資料，僅會為可見視窗呼叫（必填） |
| `estimatedRowHeight` | `number` | `44` | 估算行高，用於虛擬捲動規劃 |
| `onRowPress` | `(index: number) => void` | — | 行點選回調；傳入後行可聚焦 |
| `emptyLabel` | `string` | `"暂无数据"` | 空狀態文案 |
| `renderHeaderCell` | `(column: TableColumn<Row>, index: number) => PingoNode` | — | 替換某一列的預設表頭單元格 |
| `className` | `string` | — | 追加在元件類名之後 |

### TableColumn\<Row\>

| 欄位 | 型別 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `key` | `string` | — | 列標識，用作節點的 key（必填） |
| `header` | `string` | — | 表頭文案（必填） |
| `width` | `number` | — | 固定寬度（邏輯畫素）；省略時按 `flex` 分配剩餘寬度 |
| `flex` | `number` | `1` | 未設 `width` 時對剩餘寬度的分配份額 |
| `align` | `"start" \| "center" \| "end"` | `"start"` | 列內容水平對齊，表頭與單元格共用 |
| `cell` | `(row: Row, index: number) => PingoNode` | — | 單元格內容建構函式（必填） |

虛擬表格無法按內容測量列寬：未渲染的行不參與測量，因此列寬只能來自列定義——這也讓表頭與行天然對齊。

## 無障礙

表格帶有 `table` 語義，表頭為 `columnheader`、每行為 `row`；傳入 `onRowPress` 後行可透過指標聚焦並觸發。更多見[無障礙指南](/guide/accessibility)。
