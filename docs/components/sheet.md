---
title: Sheet
description: 从任意屏幕边缘滑入的面板，适合筛选、详情等次级内容。
---

# Sheet

Sheet 从容器边缘滑入一个面板，常用于筛选条件、详情侧栏等不打断主流程的次级内容。下方预览由 pingo 引擎实时渲染，并跟随站点主题切换明暗。

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

浮层填满它自己的父容器，请挂载在靠近根节点的位置。`open` 为受控 prop；点击遮罩或按 `Escape` 会通过 `onOpenChange(false)` 请求关闭。面板内的标题/按钮区块可复用 `DialogHeader`、`DialogTitle`、`DialogDescription` 与 `DialogFooter`。

## 示例

### 方向

`side` 支持 `"left"`、`"right"`、`"top"`、`"bottom"`，默认 `"right"`。只需要上下边缘时请使用语义更明确的 [Drawer](/components/drawer)。

## Props

继承 `DialogProps`（`open`、`onOpenChange`、`children`、`className`），另有：

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `side` | `"left" \| "right" \| "top" \| "bottom"` | `"right"` | 滑入边缘 |

## 无障碍

面板具备 complementary 语义；打开时焦点移入面板，`Escape` 关闭后焦点返回触发元素。
