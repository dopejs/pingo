---
title: Toggle Group
description: 一組兩態切換按鈕，單選或多選，支援方向鍵導航，渲染在 pingo canvas 上。
---

# Toggle Group

切換按鈕組把若干 [Toggle](/components/toggle) 組合成一個單選或多選集合。下方預覽由 pingo 引擎即時渲染——可以點按切換、用方向鍵在項間移動，並跟隨網站主題切換明暗。

:::preview toggle-group-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { ToggleGroup, ToggleGroupItem } from "@dopejs/pingo-ui";

root.render(
  createElement(ToggleGroup, {
    type: "single",
    defaultValue: ["center"],
    onValueChange: (value) => console.log(value),
    children: [
      createElement(ToggleGroupItem, { value: "left", children: "左对齐" }),
      createElement(ToggleGroupItem, { value: "center", children: "居中" }),
      createElement(ToggleGroupItem, { value: "right", children: "右对齐" }),
    ],
  }),
);
```

`ToggleGroup` 透過 context 向 `ToggleGroupItem` 發佈選中集合，兩者都必須用 `createElement` 以元件形式掛載。`type: "single"` 時新選擇會清掉上一個；`"multiple"` 時逐項累加。

## 示例

### 多選

`type="multiple"` 允許同時按下多項，如文字格式工具欄。

:::preview toggle-group-multiple
:::

## Props

### ToggleGroup

| Prop            | 型別                                 | 預設值     | 說明                             |
| --------------- | ------------------------------------ | ---------- | -------------------------------- |
| `type`          | `"single" \| "multiple"`             | `"single"` | 單選清掉上一個選擇；多選逐項累加 |
| `value`         | `readonly string[]`                  | —          | 受控選中值集合                   |
| `defaultValue`  | `readonly string[]`                  | `[]`       | 非受控初始選中集合               |
| `onValueChange` | `(value: readonly string[]) => void` | —          | 選中集合變化回調                 |
| `children`      | `PingoNode`                          | —          | `ToggleGroupItem` 列表（必填）   |
| `className`     | `string`                             | —          | 追加在元件類名之後               |

### ToggleGroupItem

| Prop        | 型別      | 預設值  | 說明               |
| ----------- | --------- | ------- | ------------------ |
| `value`     | `string`  | —       | 項值（必填）       |
| `children`  | `string`  | —       | 項文字（必填）     |
| `disabled`  | `boolean` | `false` | 禁用單項           |
| `className` | `string`  | —       | 追加在元件類名之後 |

## 無障礙

組容器帶 `group` 語義，各項繼承 Toggle 的 button 語義與 `on` / `off` 語義值。鍵盤處理集中在組上：`←`/`→` 把焦點移到相鄰項，`Enter`/`空格` 切換當前項——項的增刪不影響這套導航。
