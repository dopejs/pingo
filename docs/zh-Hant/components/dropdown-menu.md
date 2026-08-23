---
title: Dropdown Menu
description: 點選觸發器展開的動作選單，支援鍵盤導航。
---

# Dropdown Menu

Dropdown Menu 在觸發器下方展開一組動作項。下方預覽由 pingo 引擎即時渲染——點選觸發器即可開合，並跟隨網站主題切換明暗。

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

Trigger 與 Content 透過 context 讀取根元件狀態，必須作為同一個 `DropdownMenu` 的子節點。選擇一項後觸發 `onValueChange` 並自動關閉選單。開合預設非受控（`defaultOpen`），元件不提供受控 `open` prop——需要完全受控的列表選擇請使用 Select（兩者共享同一實作）。

## Props

### DropdownMenu

| Prop | 型別 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 當前選中值（高亮對應項） |
| `defaultOpen` | `boolean` | `false` | 初始開合 |
| `onValueChange` | `(value: string) => void` | — | 選擇選單項回調 |
| `onOpenChange` | `(open: boolean) => void` | — | 開合變化回調 |
| `children` | `PingoNode` | — | Trigger 與 Content（必填） |
| `className` | `string` | — | 追加在錨點容器類名之後 |

### DropdownMenuTrigger

| Prop | 型別 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | 觸發元素；預設時渲染當前值/佔位文字 |
| `placeholder` | `string` | — | 無選中值時的佔位文字 |
| `className` | `string` | — | 追加類名 |

### DropdownMenuContent

| Prop | 型別 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | 選單項（必填） |
| `className` | `string` | — | 追加類名 |

### DropdownMenuItem

| Prop | 型別 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 選單項值（必填） |
| `children` | `string` | — | 顯示文案（必填） |
| `className` | `string` | — | 追加類名 |

## 無障礙

選單具備 menu 語義、選單項具備 menuitem 語義；開啟後方向鍵上下移動，`Enter`/`Space` 選擇，`Escape` 關閉並把焦點交還觸發器。
