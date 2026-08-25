---
title: Data Table
description: 带可排序表头的虚拟滚动表格，排序以回调形式上报，渲染在 pingo canvas 上。
---

# Data Table

在 [Table](/components/table) 之上增加可排序表头。排序是**上报而非执行**：组件通过 `onSortChange` 告知新的排序状态，由你重排 `getRow` 的数据源——对虚拟表格而言行数据往往在服务端或 store 里，组件不会为了排序而物化全部行。下方预览由 pingo 引擎实时渲染：点击「成员」「提交」「最近活跃」表头可在升序 → 降序 → 取消之间循环，并跟随站点主题切换明暗。

:::preview data-table-sortable
:::

## 用法

```tsx
import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
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
        cell: (row) => createElement("text", { value: row.name }),
      },
      {
        key: "commits",
        header: "提交",
        width: 80,
        align: "end",
        sortable: true,
        cell: (row) => createElement("text", { value: String(row.commits) }),
      },
    ],
    sort: current,
    onSortChange: (next) => sort.set(next),
    rowCount: rows.length,
    getRow: (index) => rows[index],
  });
}
```

点击已排序的列按 升序 → 降序 → 取消 循环（`nextSort` 的规则）；第三态存在的原因是：误触排序的用户需要一条回到数据原始顺序的路。与 Table 相同，表格主体是虚拟列表，父容器需要给定高度。

## Props

### DataTableProps\<Row\>

继承 `TableProps<Row>` 的全部字段（`columns` 换为可排序版本）：

| Prop                 | 类型                                     | 默认值       | 说明                                                         |
| -------------------- | ---------------------------------------- | ------------ | ------------------------------------------------------------ |
| `columns`            | `readonly DataTableColumn<Row>[]`        | —            | 列定义（必填），比 `TableColumn` 多一个 `sortable`           |
| `sort`               | `SortState`                              | —            | 当前排序状态；省略表示未排序                                 |
| `onSortChange`       | `(sort: SortState \| undefined) => void` | —            | 排序变化回调；`undefined` 表示取消排序。未传入时表头不可点击 |
| `rowCount`           | `number`                                 | —            | 总行数（必填）                                               |
| `getRow`             | `(index: number) => Row`                 | —            | 按行号取行数据（必填）                                       |
| `estimatedRowHeight` | `number`                                 | `44`         | 估算行高                                                     |
| `onRowPress`         | `(index: number) => void`                | —            | 行点击回调                                                   |
| `emptyLabel`         | `string`                                 | `"暂无数据"` | 空状态文案                                                   |
| `renderHeaderCell`   | `(column, index) => PingoNode`           | —            | 类型上存在，但组件内部用它实现可排序表头，传入会被覆盖       |
| `className`          | `string`                                 | —            | 追加在组件类名之后                                           |

### DataTableColumn\<Row\>

`TableColumn<Row>` 的扩展，新增：

| 字段       | 类型      | 默认值  | 说明               |
| ---------- | --------- | ------- | ------------------ |
| `sortable` | `boolean` | `false` | 表头是否可点击排序 |

### SortState

| 字段        | 类型                          | 说明           |
| ----------- | ----------------------------- | -------------- |
| `key`       | `string`                      | 排序列的 `key` |
| `direction` | `"ascending" \| "descending"` | 排序方向       |

当前排序列的表头会带上 `▲` / `▼` 指示符。

## 无障碍

表头单元格具备 `columnheader` 语义；可排序列的排序状态（`ascending` / `descending` / `none`）通过语义值暴露给辅助技术，点击前会先聚焦表头。更多见[无障碍指南](/guide/accessibility)。
