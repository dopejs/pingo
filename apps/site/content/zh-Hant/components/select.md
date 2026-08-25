---
title: Select
description: 組合式下拉選擇器，支援鍵盤導航，渲染在 pingo canvas 上。
---

# Select

下拉選擇器由 `Select`、`SelectTrigger`、`SelectContent`、`SelectItem` 組合而成。下方預覽由 pingo 引擎即時渲染——列表已展開，可以用方向鍵導航、回車選中，並跟隨網站主題切換明暗。

:::preview select-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@dopejs/pingo-ui";

root.render(
  createElement(Select, {
    value: "pingo-ui",
    onValueChange: (value) => console.log(value),
    children: [
      createElement(SelectTrigger, { placeholder: "选择一个包" }),
      createElement(SelectContent, {
        children: [
          createElement(SelectItem, { value: "pingo", children: "@dopejs/pingo" }),
          createElement(SelectItem, { value: "pingo-ui", children: "@dopejs/pingo-ui" }),
        ],
      }),
    ],
  }),
);
```

所有部分透過 context 協作，都必須用 `createElement` 以元件形式掛載。觸發器顯示當前選中的 `value`；未選中時顯示 `placeholder`。

## 示例

### 預設展開

`defaultOpen` 讓列表初始展開（如上方預覽）；`onOpenChange` 監聽開合。

## Props

### Select

| Prop            | 型別                      | 預設值  | 說明                           |
| --------------- | ------------------------- | ------- | ------------------------------ |
| `value`         | `string`                  | —       | 選中值，顯示在觸發器上         |
| `defaultOpen`   | `boolean`                 | `false` | 初始展開                       |
| `onValueChange` | `(value: string) => void` | —       | 選中變化回調（選中後自動收起） |
| `onOpenChange`  | `(open: boolean) => void` | —       | 開合回調                       |
| `children`      | `PingoNode`               | —       | 觸發器與內容（必填）           |
| `className`     | `string`                  | —       | 追加在元件類名之後             |

### SelectTrigger

| Prop          | 型別        | 預設值 | 說明                                     |
| ------------- | ----------- | ------ | ---------------------------------------- |
| `children`    | `PingoNode` | —      | 自訂觸發器內容；預設渲染選中值或佔位文字 |
| `placeholder` | `string`    | —      | 未選中時的佔位文字                       |
| `className`   | `string`    | —      | 追加在元件類名之後                       |

### SelectContent

| Prop        | 型別        | 預設值 | 說明                      |
| ----------- | ----------- | ------ | ------------------------- |
| `children`  | `PingoNode` | —      | `SelectItem` 列表（必填） |
| `className` | `string`    | —      | 追加在元件類名之後        |

### SelectItem

| Prop        | 型別     | 預設值 | 說明               |
| ----------- | -------- | ------ | ------------------ |
| `value`     | `string` | —      | 選項值（必填）     |
| `children`  | `string` | —      | 選項文字（必填）   |
| `className` | `string` | —      | 追加在元件類名之後 |

## 無障礙

觸發器帶 button 語義並在 `expanded` / `collapsed` 間切換；內容帶 menu 語義。方向鍵移動高亮，`Enter`/`空格` 選中，`Esc` 關閉；選中後焦點回到觸發器。
