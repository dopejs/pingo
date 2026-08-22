---
title: Table
description: 虚拟滚动的数据表格，列定义同时驱动表头与行，渲染在 pingo canvas 上。
---

# Table

虚拟滚动表格：列定义同时驱动表头与每一行，一万行与一屏行的渲染成本相同。下方预览由 pingo 引擎实时渲染——可以滚动、点击行，并跟随站点主题切换明暗。

:::preview table-basic
:::

## 用法

`Table` 是纯构建函数而非 memo 组件，直接调用即可返回场景节点。在组件渲染作用域内调用（如下方的函数组件），其主题读取才会订阅站点主题切换。

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

表格主体是 [VirtualList](/guide/scrolling)，需要父容器给定高度（示例中外层容器 `height: 260`）。

## 示例

### 空状态

`rowCount` 为 `0` 时渲染 `emptyLabel`（默认「暂无数据」），不再创建虚拟列表。

:::preview table-empty
:::

## Props

### TableProps\<Row\>

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `columns` | `readonly TableColumn<Row>[]` | — | 列定义，同时驱动表头与行（必填） |
| `rowCount` | `number` | — | 总行数（必填）；为 `0` 时渲染空状态 |
| `getRow` | `(index: number) => Row` | — | 按行号取行数据，仅会为可见窗口调用（必填） |
| `estimatedRowHeight` | `number` | `44` | 估算行高，用于虚拟滚动规划 |
| `onRowPress` | `(index: number) => void` | — | 行点击回调；传入后行可聚焦 |
| `emptyLabel` | `string` | `"暂无数据"` | 空状态文案 |
| `renderHeaderCell` | `(column: TableColumn<Row>, index: number) => PingoNode` | — | 替换某一列的默认表头单元格 |
| `className` | `string` | — | 追加在组件类名之后 |

### TableColumn\<Row\>

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `key` | `string` | — | 列标识，用作节点的 key（必填） |
| `header` | `string` | — | 表头文案（必填） |
| `width` | `number` | — | 固定宽度（逻辑像素）；省略时按 `flex` 分配剩余宽度 |
| `flex` | `number` | `1` | 未设 `width` 时对剩余宽度的分配份额 |
| `align` | `"start" \| "center" \| "end"` | `"start"` | 列内容水平对齐，表头与单元格共用 |
| `cell` | `(row: Row, index: number) => PingoNode` | — | 单元格内容构建函数（必填） |

虚拟表格无法按内容测量列宽：未渲染的行不参与测量，因此列宽只能来自列定义——这也让表头与行天然对齐。

## 无障碍

表格带有 `table` 语义，表头为 `columnheader`、每行为 `row`；传入 `onRowPress` 后行可通过指针聚焦并激活。更多见[无障碍指南](/guide/accessibility)。
