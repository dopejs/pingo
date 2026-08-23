---
title: Radio Group
description: 單選選項組，支援方向鍵導航，渲染在 pingo canvas 上。
---

# Radio Group

單選組用於從一組互斥選項中選一項。下方預覽由 pingo 引擎即時渲染——可以點選選項或用方向鍵移動選擇，並跟隨網站主題切換明暗。

:::preview radio-group-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { RadioGroup, RadioGroupItem } from "@dopejs/pingo-ui";

root.render(
  createElement(RadioGroup, {
    defaultValue: "b",
    onValueChange: (value) => console.log(value),
    children: [
      createElement(RadioGroupItem, { value: "a", label: "选项 A" }),
      createElement(RadioGroupItem, { value: "b", label: "选项 B" }),
      createElement(RadioGroupItem, { value: "c", label: "选项 C" }),
    ],
  }),
);
```

`RadioGroup` 透過 context 向 `RadioGroupItem` 發佈當前值，因此兩者都必須用 `createElement` 以元件形式掛載。傳入 `value` 即進入受控模式；否則用 `defaultValue` 讓元件自持狀態。

## 示例

### 禁用

在 `RadioGroup` 上傳入 `disabled` 會禁用整組，單項語義值變為 `disabled`。

## Props

### RadioGroup

| Prop | 型別 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 受控選中值 |
| `defaultValue` | `string` | — | 非受控初始選中值 |
| `onValueChange` | `(value: string) => void` | — | 選中變化回調 |
| `disabled` | `boolean` | `false` | 禁用整組 |
| `children` | `PingoNode` | — | `RadioGroupItem` 列表（必填） |
| `className` | `string` | — | 追加在元件類名之後 |

### RadioGroupItem

| Prop | 型別 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 選項值（必填） |
| `label` | `string` | — | 選項文字 |
| `className` | `string` | — | 追加在元件類名之後 |

## 無障礙

組容器帶 `radiogroup` 語義，單項帶 `radio` 語義並在 `checked` / `unchecked` / `disabled` 間切換。遵循 WAI-ARIA：單選組無論版面方向如何，兩組方向鍵都可移動選擇並同步焦點。
