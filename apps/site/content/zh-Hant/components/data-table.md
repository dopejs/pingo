---
title: Data Table
description: 帶可排序表頭的虛擬捲動表格，排序以回調形式上報，渲染在 pingo canvas 上。
---

# Data Table

在 [Table](/components/table) 之上增加可排序表頭。排序是**上報而非執行**：元件透過 `onSortChange` 告知新的排序狀態，由你重排 `getRow` 的資料來源——對虛擬表格而言行資料往往在服務端或 store 裡，元件不會為了排序而物化全部行。下方預覽由 pingo 引擎即時渲染：點選「成員」「提交」「最近活躍」表頭可在升序 → 降序 → 取消之間迴圈，並跟隨網站主題切換明暗。

:::preview data-table-sortable
:::

## 用法

```tsx
import { useSignal, type PingoNode } from "@dopejs/pingo";
import { DataTable, type SortState } from "@dopejs/pingo-ui";

function MemberTable(): PingoNode {
  const sort = useSignal<SortState | undefined>(undefined);
  const current = sort.get();
  const rows = sortMembers(members, current); // 自行重排数据源
  return DataTable<Member>({
    columns: [
      {
        key: "name",
        header: "成员",
        sortable: true,
        cell: (row) => <text value={row.name} />,
      },
      {
        key: "commits",
        header: "提交",
        width: 80,
        align: "end",
        sortable: true,
        cell: (row) => <text value={String(row.commits)} />,
      },
    ],
    sort: current,
    onSortChange: (next) => sort.set(next),
    rowCount: rows.length,
    getRow: (index) => rows[index],
  });
}
```

點選已排序的列按 升序 → 降序 → 取消 迴圈（`nextSort` 的規則）；第三態存在的原因是：誤觸排序的使用者需要一條回到資料原始順序的路。與 Table 相同，表格主體是虛擬列表，父容器需要給定高度。

## Props

### DataTableProps\<Row\>

繼承 `TableProps<Row>` 的全部欄位（`columns` 換為可排序版本）：

| Prop                 | 型別                                     | 預設值       | 說明                                                         |
| -------------------- | ---------------------------------------- | ------------ | ------------------------------------------------------------ |
| `columns`            | `readonly DataTableColumn<Row>[]`        | —            | 列定義（必填），比 `TableColumn` 多一個 `sortable`           |
| `sort`               | `SortState`                              | —            | 當前排序狀態；省略表示未排序                                 |
| `onSortChange`       | `(sort: SortState \| undefined) => void` | —            | 排序變化回調；`undefined` 表示取消排序。未傳入時表頭不可點選 |
| `rowCount`           | `number`                                 | —            | 總行數（必填）                                               |
| `getRow`             | `(index: number) => Row`                 | —            | 按行號取行資料（必填）                                       |
| `estimatedRowHeight` | `number`                                 | `44`         | 估算行高                                                     |
| `onRowPress`         | `(index: number) => void`                | —            | 行點選回調                                                   |
| `emptyLabel`         | `string`                                 | `"暂无数据"` | 空狀態文案                                                   |
| `renderHeaderCell`   | `(column, index) => PingoNode`           | —            | 型別上存在，但元件內部用它實作可排序表頭，傳入會被覆蓋       |
| `className`          | `string`                                 | —            | 追加在元件類名之後                                           |

### DataTableColumn\<Row\>

`TableColumn<Row>` 的擴充套件，新增：

| 欄位       | 型別      | 預設值  | 說明               |
| ---------- | --------- | ------- | ------------------ |
| `sortable` | `boolean` | `false` | 表頭是否可點選排序 |

### SortState

| 欄位        | 型別                          | 說明           |
| ----------- | ----------------------------- | -------------- |
| `key`       | `string`                      | 排序列的 `key` |
| `direction` | `"ascending" \| "descending"` | 排序方向       |

當前排序列的表頭會帶上 `▲` / `▼` 指示符。

## 無障礙

表頭單元格具備 `columnheader` 語義；可排序列的排序狀態（`ascending` / `descending` / `none`）透過語義值暴露給輔助技術，點選前會先聚焦表頭。更多見[無障礙指南](/guide/accessibility)。
