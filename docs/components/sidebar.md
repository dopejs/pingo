---
title: Sidebar
description: 产品导航侧栏：分组、条目与选中态，渲染在 pingo canvas 上。
---

# Sidebar

Sidebar 是应用级导航列，由分组（Section）与条目（Item）组成，内置选中态与键盘导航。下方预览由 pingo 引擎实时渲染——点击条目或聚焦后用方向键切换。

:::preview sidebar-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Sidebar, SidebarItem, SidebarSection } from "@dopejs/pingo-ui";

root.render(
  createElement(Sidebar, {
    defaultValue: "stats",
    onValueChange: (value) => navigate(value),
    children: [
      createElement(SidebarSection, {
        title: "工作区",
        children: [
          createElement(SidebarItem, { value: "home", label: "首页" }),
          createElement(SidebarItem, { value: "stats", label: "统计" }),
        ],
      }),
      createElement(SidebarSection, {
        title: "系统",
        children: createElement(SidebarItem, { value: "settings", label: "设置" }),
      }),
    ],
  }),
);
```

`Sidebar` 既支持非受控（`defaultValue`）也支持受控（`value` + `onValueChange`）两种用法。侧栏宽度由主题 token 决定（默认 240px）。

## Props

### Sidebar

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 受控：当前选中条目的 `value` |
| `defaultValue` | `string` | — | 非受控：初始选中条目的 `value` |
| `onValueChange` | `(value: string) => void` | — | 选中变化回调 |
| `children` | `PingoNode` | — | `SidebarSection` 列表（必填） |
| `className` | `string` | — | 追加在组件类名之后 |

### SidebarSection

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | — | 分组标题；省略时不渲染标题行 |
| `children` | `PingoNode` | — | `SidebarItem` 列表（必填） |
| `className` | `string` | — | 追加在组件类名之后 |

### SidebarItem

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 条目的唯一标识（必填） |
| `label` | `string` | — | 条目文本，同时用作无障碍名称（必填） |
| `icon` | `PingoNode` | — | 前置插槽，用于图标 |
| `className` | `string` | — | 追加在组件类名之后 |

## 无障碍

侧栏具备 navigation 语义；条目具备 link 语义，以 `label` 作为无障碍名称并暴露 selected/unselected 状态。上下方向键与 Home/End 在条目间移动，选中与焦点一起移动。

自定义侧栏宽度与配色见[样式指南](/guide/styling)。
