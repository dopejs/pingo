---
title: Context Menu
description: 右键触发的上下文菜单，菜单出现在指针按下处。
---

# Context Menu

Context Menu 在目标区域上右键（`contextmenu` 事件）时，于指针位置打开菜单。下方预览由 pingo 引擎实时渲染——在文本区域上右键即可打开菜单，并跟随站点主题切换明暗。

:::preview context-menu-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { ContextMenu } from "@dopejs/pingo-ui";

root.render(
  createElement(ContextMenu, {
    items: [
      { value: "copy", label: "复制" },
      { value: "paste", label: "粘贴", disabled: true },
      { value: "delete", label: "删除" },
    ],
    onSelect: (value) => run(value),
    children: createElement("text", { value: "在此右键" }),
  }),
);
```

菜单定位在指针按下处而非触发器角落；`Escape` 或选择一项后关闭。禁用项不参与键盘导航，也不响应点击。静态渲染时只显示触发区域，菜单在右键时出现。

## Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | 触发区域内容（必填） |
| `items` | `readonly ContextMenuEntry[]` | — | 菜单项（必填） |
| `onSelect` | `(value: string) => void` | — | 选择菜单项回调 |
| `onOpenChange` | `(open: boolean) => void` | — | 开合变化回调 |
| `className` | `string` | — | 追加类名 |

### ContextMenuEntry

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 菜单项值（必填） |
| `label` | `string` | — | 显示文案（必填） |
| `disabled` | `boolean` | `false` | 禁用态 |

## 无障碍

菜单具备 menu 语义，菜单项具备 menuitem 语义；打开后方向键上下移动，`Escape` 关闭。
