---
title: Drawer
description: 从上下边缘滑入的抽屉面板，适合移动端风格的底部操作。
---

# Drawer

抽屉是从水平边缘滑入的面板——等价于一个 `side` 只取 `"top" | "bottom"` 的 [Sheet](/components/sheet)。下方预览由 pingo 引擎实时渲染，并跟随站点主题切换明暗。

:::preview drawer-basic
:::

## 用法

```tsx
import { Drawer } from "@dopejs/pingo-ui";

root.render(
  <Drawer open={open} onOpenChange={(next) => setOpen(next)} side="bottom">
    <text value="抽屉内容" />
  </Drawer>,
);
```

浮层填满它自己的父容器，请挂载在靠近根节点的位置。`open` 为受控 prop；点击遮罩或按 `Escape` 会通过 `onOpenChange(false)` 请求关闭。面板内的标题/按钮区块可复用 `DialogHeader`、`DialogTitle`、`DialogDescription` 与 `DialogFooter`。

## 示例

### 方向

`side` 支持 `"top"` 与 `"bottom"`，默认 `"bottom"`。

## Props

继承 `DialogProps`（`open`、`onOpenChange`、`children`、`className`），另有：

| Prop   | 类型                | 默认值     | 说明     |
| ------ | ------------------- | ---------- | -------- |
| `side` | `"top" \| "bottom"` | `"bottom"` | 滑入边缘 |

## 无障碍

面板具备 complementary 语义；打开时焦点移入面板，`Escape` 关闭后焦点返回触发元素。
