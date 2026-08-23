---
title: Sidebar
description: 產品導航側欄：分組、條目與選中態，渲染在 pingo canvas 上。
---

# Sidebar

Sidebar 是應用級導航列，由分組（Section）與條目（Item）組成，內建選中態與鍵盤導航。下方預覽由 pingo 引擎即時渲染——點選條目或聚焦後用方向鍵切換。

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

`Sidebar` 既支援非受控（`defaultValue`）也支援受控（`value` + `onValueChange`）兩種用法。側欄寬度由主題 token 決定（預設 240px）。

## Props

### Sidebar

| Prop | 型別 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 受控：當前選中條目的 `value` |
| `defaultValue` | `string` | — | 非受控：初始選中條目的 `value` |
| `onValueChange` | `(value: string) => void` | — | 選中變化回調 |
| `children` | `PingoNode` | — | `SidebarSection` 列表（必填） |
| `className` | `string` | — | 追加在元件類名之後 |

### SidebarSection

| Prop | 型別 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `title` | `string` | — | 分組標題；省略時不渲染標題行 |
| `children` | `PingoNode` | — | `SidebarItem` 列表（必填） |
| `className` | `string` | — | 追加在元件類名之後 |

### SidebarItem

| Prop | 型別 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 條目的唯一標識（必填） |
| `label` | `string` | — | 條目文字，同時用作無障礙名稱（必填） |
| `icon` | `PingoNode` | — | 前置插槽，用於圖示 |
| `className` | `string` | — | 追加在元件類名之後 |

## 無障礙

側欄具備 navigation 語義；條目具備 link 語義，以 `label` 作為無障礙名稱並暴露 selected/unselected 狀態。上下方向鍵與 Home/End 在條目間移動，選中與焦點一起移動。

自訂側欄寬度與配色見[樣式指南](/guide/styling)。
