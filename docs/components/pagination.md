---
title: Pagination
description: shadcn 风格的分页控件，带页码省略与边界禁用态，渲染在 pingo canvas 上。
---

# Pagination

分页控件：当前页高亮，过长的页码序列自动折叠为省略号，到达首页/末页时对应箭头禁用。下方预览由 pingo 引擎实时渲染——可以点击页码与箭头翻页，并跟随站点主题切换明暗。

:::preview pagination-basic
:::

## 用法

页码是**受控**的：`page` 从 1 开始，翻页通过 `onPageChange` 上报，由你回写。

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

### 紧凑模式

`siblingCount` 控制当前页两侧展示的页码数（不含首尾页，首尾恒显示）。设为 `0` 时只保留首尾与当前页；在首页时上一页箭头禁用。

:::preview pagination-compact
:::

页码序列的折叠规则由导出的纯函数 `paginationRange(page, pageCount, siblingCount)` 实现，可单独用于测试。

## Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `page` | `number` | — | 当前页，从 1 开始（必填）；越界会被收敛到 `[1, pageCount]` |
| `pageCount` | `number` | — | 总页数（必填）；小于 1 时不渲染任何页码 |
| `onPageChange` | `(page: number) => void` | — | 翻页回调；点击当前页或越界目标不会触发 |
| `siblingCount` | `number` | `1` | 当前页两侧各展示的页码数 |
| `previousLabel` | `string` | — | 类型中预留的上一页文案；当前版本渲染为图标，该字段尚未参与渲染 |
| `nextLabel` | `string` | — | 类型中预留的下一页文案；当前版本渲染为图标，该字段尚未参与渲染 |
| `className` | `string` | — | 追加在组件类名之后 |

## 无障碍

控件整体是 `navigation` 语义；当前页带 `current` 语义值，前后翻页按钮的无障碍名称为 "previous page" / "next page"，到达边界时禁用且不响应指针。键盘上 `ArrowLeft` / `ArrowRight` 在控件内任意焦点处翻页。更多见[无障碍指南](/guide/accessibility)。
