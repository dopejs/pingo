---
title: Breadcrumb
description: shadcn 風格的麵包屑導航，末項為當前頁不可點選，渲染在 pingo canvas 上。
---

# Breadcrumb

麵包屑導航：除末項外每一項都是可點選的連結，末項表示當前頁——不渲染為連結，也不會向輔助技術提供"跳轉到當前位置"的操作。下方預覽由 pingo 引擎即時渲染——可以點選前序項目、用鍵盤觸發，並跟隨網站主題切換明暗。

:::preview breadcrumb-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Breadcrumb } from "@dopejs/pingo-ui";

root.render(
  createElement(Breadcrumb, {
    items: [
      { label: "首页", onNavigate: () => navigate("/") },
      { label: "组件", onNavigate: () => navigate("/components") },
      { label: "Breadcrumb" }, // 末项是当前页，无需 onNavigate
    ],
  }),
);
```

## 示例

### 自訂分隔符

`separator` 預設是 `/`，可以換成任意文字符號（在圖示集落地前分隔符是文字字形）：

:::preview breadcrumb-separator
:::

## Props

### BreadcrumbProps

| Prop        | 型別                        | 預設值 | 說明                               |
| ----------- | --------------------------- | ------ | ---------------------------------- |
| `items`     | `readonly BreadcrumbItem[]` | —      | 麵包屑項目，末項視為當前頁（必填） |
| `separator` | `string`                    | `"/"`  | 項目之間的分隔符                   |
| `className` | `string`                    | —      | 追加在元件類名之後                 |

### BreadcrumbItem

| 欄位         | 型別         | 預設值 | 說明                                                                       |
| ------------ | ------------ | ------ | -------------------------------------------------------------------------- |
| `label`      | `string`     | —      | 項目文案（必填）                                                           |
| `onNavigate` | `() => void` | —      | 點選回調；未提供時該項目不附帶任何觸發行為（末項本就視為當前頁，無需提供） |

## 無障礙

麵包屑整體是 `navigation` 語義、名稱為 "breadcrumb"；可點選項為 link 語義，支援 `Enter` / `Space` 鍵盤觸發，點選前會先聚焦。當前頁渲染為純文字並帶 `current` 語義值，螢幕閱讀器不會把它當作可跳轉的連結。更多見[無障礙指南](/guide/accessibility)。
