---
title: Menubar
description: 桌面風格的應用選單欄，多個選單共享一個開啟位。
---

# Menubar

Menubar 是一排共享同一個開啟位的選單，類似桌面應用的選單欄。下方預覽由 pingo 引擎即時渲染——點選「檔案」「編輯」等標籤即可開合對應選單，並跟隨網站主題切換明暗。

:::preview menubar-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Menubar, MenubarMenu } from "@dopejs/pingo-ui";

root.render(
  createElement(Menubar, {
    onValueChange: (value) => {},
    children: [
      createElement(MenubarMenu, {
        value: "file",
        label: "文件",
        children: createElement("text", { value: "新建" }),
      }),
      createElement(MenubarMenu, {
        value: "edit",
        label: "编辑",
        children: createElement("text", { value: "撤销" }),
      }),
    ],
  }),
);
```

`MenubarMenu` 透過 context 讀取選單欄狀態，必須作為 `Menubar` 的子節點；其 `children` 是開啟時顯示的面板內容。開合預設非受控，傳入 `value` 即切換為受控模式（值為當前開啟選單的 `value`）。

## 示例

### 受控開啟

傳入 `value` 固定開啟的選單，常用於初始引導或外部狀態同步。

:::preview menubar-open
:::

## Props

### Menubar

| Prop            | 型別                                   | 預設值  | 說明                                                                   |
| --------------- | -------------------------------------- | ------- | ---------------------------------------------------------------------- |
| `value`         | `string`                               | —       | 受控：當前開啟選單的值                                                 |
| `onValueChange` | `(value: string \| undefined) => void` | —       | 開啟選單變化回調（關閉時為 `undefined`）                               |
| `children`      | `PingoNode`                            | —       | 若干 `MenubarMenu`（必填）                                             |
| `className`     | `string`                               | —       | 追加類名                                                               |
| `navigation`    | `boolean`                              | `false` | 使用導航語義（[NavigationMenu](/components/navigation-menu) 內部使用） |

### MenubarMenu

| Prop        | 型別        | 預設值 | 說明                     |
| ----------- | ----------- | ------ | ------------------------ |
| `value`     | `string`    | —      | 選單標識（必填）         |
| `label`     | `string`    | —      | 欄上顯示的標籤（必填）   |
| `children`  | `PingoNode` | —      | 開啟時的面板內容（必填） |
| `className` | `string`    | —      | 追加類名                 |

## 無障礙

選單欄具備 menubar 語義，標籤具備 menuitem 語義並暴露 expanded/collapsed 狀態；左右方向鍵在選單間移動，選單開啟時同樣切換，`Escape` 關閉並聚焦當前標籤。
