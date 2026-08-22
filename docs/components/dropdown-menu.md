---
title: Dropdown Menu
description: 点击触发器展开的动作菜单，支持键盘导航。
---

# Dropdown Menu

Dropdown Menu 在触发器下方展开一组动作项。下方预览由 pingo 引擎实时渲染——点击触发器即可开合，并跟随站点主题切换明暗。

:::preview dropdown-menu-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@dopejs/pingo-ui";

root.render(
  createElement(DropdownMenu, {
    onValueChange: (value) => run(value),
    children: [
      createElement(DropdownMenuTrigger, {
        children: createElement(Button, { children: "打开菜单", onPress: () => {} }),
      }),
      createElement(DropdownMenuContent, {
        children: [
          createElement(DropdownMenuItem, { value: "profile", children: "个人资料" }),
          createElement(DropdownMenuItem, { value: "settings", children: "设置" }),
        ],
      }),
    ],
  }),
);
```

Trigger 与 Content 通过 context 读取根组件状态，必须作为同一个 `DropdownMenu` 的子节点。选择一项后触发 `onValueChange` 并自动关闭菜单。开合默认非受控（`defaultOpen`），组件不提供受控 `open` prop——需要完全受控的列表选择请使用 Select（两者共享同一实现）。

## Props

### DropdownMenu

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 当前选中值（高亮对应项） |
| `defaultOpen` | `boolean` | `false` | 初始开合 |
| `onValueChange` | `(value: string) => void` | — | 选择菜单项回调 |
| `onOpenChange` | `(open: boolean) => void` | — | 开合变化回调 |
| `children` | `PingoNode` | — | Trigger 与 Content（必填） |
| `className` | `string` | — | 追加在锚点容器类名之后 |

### DropdownMenuTrigger

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | 触发元素；缺省时渲染当前值/占位文本 |
| `placeholder` | `string` | — | 无选中值时的占位文本 |
| `className` | `string` | — | 追加类名 |

### DropdownMenuContent

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | 菜单项（必填） |
| `className` | `string` | — | 追加类名 |

### DropdownMenuItem

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 菜单项值（必填） |
| `children` | `string` | — | 显示文案（必填） |
| `className` | `string` | — | 追加类名 |

## 无障碍

菜单具备 menu 语义、菜单项具备 menuitem 语义；打开后方向键上下移动，`Enter`/`Space` 选择，`Escape` 关闭并把焦点交还触发器。
