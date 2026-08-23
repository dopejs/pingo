---
title: Dialog
description: 模态对话框，打断流程以获取用户输入或确认，渲染在 pingo canvas 上。
---

# Dialog

对话框在当前内容之上打开一个模态面板，并附带遮罩。下方预览由 pingo 引擎实时渲染——点击遮罩或按 `Escape` 会触发 `onOpenChange(false)`，并跟随站点主题切换明暗。

:::preview dialog-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import {
  Button,
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@dopejs/pingo-ui";

root.render(
  createElement(Dialog, {
    open,
    onOpenChange: (next) => setOpen(next),
    children: [
      createElement(DialogHeader, {
        children: [
          createElement(DialogTitle, { children: "编辑资料" }),
          createElement(DialogDescription, { children: "修改会立即同步。" }),
        ],
      }),
      createElement(DialogFooter, {
        children: createElement(Button, { children: "保存", onPress: () => save() }),
      }),
    ],
  }),
);
```

Dialog 的浮层会填满**它自己的父容器**（而不是视口），请把它挂载在靠近根节点的位置。`open` 为受控 prop：组件不持有开合状态，关闭时通过 `onOpenChange(false)` 通知调用方。

## 示例

### 组合区块

`DialogHeader` / `DialogTitle` / `DialogDescription` / `DialogFooter` 是纯布局与排版组件，按需组合；`children` 接受任意 `PingoNode`，表单、列表都可以放进面板。

## Props

### Dialog

| Prop           | 类型                      | 默认值 | 说明                   |
| -------------- | ------------------------- | ------ | ---------------------- |
| `open`         | `boolean`                 | —      | 是否打开（必填，受控） |
| `onOpenChange` | `(open: boolean) => void` | —      | 请求关闭/打开时回调    |
| `children`     | `PingoNode`               | —      | 面板内容（必填）       |
| `className`    | `string`                  | —      | 追加在浮层类名之后     |

### DialogHeader / DialogFooter

| Prop        | 类型        | 默认值 | 说明             |
| ----------- | ----------- | ------ | ---------------- |
| `children`  | `PingoNode` | —      | 区块内容（必填） |
| `className` | `string`    | —      | 追加类名         |

### DialogTitle / DialogDescription

| Prop        | 类型     | 默认值 | 说明             |
| ----------- | -------- | ------ | ---------------- |
| `children`  | `string` | —      | 文本内容（必填） |
| `className` | `string` | —      | 追加类名         |

## 无障碍

面板具备 dialog 语义；打开时焦点移入面板，`Escape` 关闭后焦点返回触发元素。面板内的可交互元素会注册进 Tab 循环。标题请使用 `DialogTitle`（heading 语义）。
