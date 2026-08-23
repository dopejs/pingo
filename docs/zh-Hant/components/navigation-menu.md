---
title: Navigation Menu
description: 網站導航風格的選單欄，行為與 Menubar 一致、語義為導航。
---

# Navigation Menu

Navigation Menu 是導航語義版的 [Menubar](/components/menubar)：同樣的觸發器行與展開面板，但對外暴露 navigation 語義，適合網站主導航。下方預覽由 pingo 引擎即時渲染，並跟隨網站主題切換明暗。

:::preview navigation-menu-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { MenubarMenu, NavigationMenu } from "@dopejs/pingo-ui";

root.render(
  createElement(NavigationMenu, {
    onValueChange: (value) => {},
    children: [
      createElement(MenubarMenu, {
        value: "products",
        label: "产品",
        children: createElement("text", { value: "渲染引擎" }),
      }),
      createElement(MenubarMenu, {
        value: "docs",
        label: "文档",
        children: createElement("text", { value: "快速开始" }),
      }),
    ],
  }),
);
```

條目複用 `MenubarMenu`。開合預設非受控，傳入 `value` 即切換為受控模式。互動行為（鍵盤導航、開啟位共享）與 Menubar 完全一致。

## Props

`NavigationMenu` 接受 `MenubarProps` 中除 `navigation` 外的全部 props：

| Prop | 型別 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 受控：當前開啟選單的值 |
| `onValueChange` | `(value: string \| undefined) => void` | — | 開啟選單變化回調（關閉時為 `undefined`） |
| `children` | `PingoNode` | — | 若干 `MenubarMenu`（必填） |
| `className` | `string` | — | 追加類名 |

條目 props 見 [Menubar](/components/menubar#menubarmenu)。

## 無障礙

容器具備 navigation 語義，標籤具備 menuitem 語義並暴露 expanded/collapsed 狀態；左右方向鍵在條目間移動，`Escape` 關閉並聚焦當前標籤。
