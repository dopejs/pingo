---
title: Slider
description: 數值滑桿，支援拖曳與鍵盤微調，渲染在 pingo canvas 上。
---

# Slider

滑桿用於在一個區間內選擇數值。下方預覽由 pingo 引擎即時渲染——可以拖曳滑塊或用方向鍵微調，並跟隨網站主題切換明暗。

:::preview slider-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Slider } from "@dopejs/pingo-ui";

root.render(
  createElement(Slider, {
    defaultValue: 40,
    min: 0,
    max: 100,
    step: 1,
    semanticLabel: "音量",
    onValueChange: (value) => console.log(value),
  }),
);
```

`Slider` 內部透過 hooks 持有拖曳狀態，必須用 `createElement` 以元件形式掛載。傳入 `value` 即進入受控模式；否則用 `defaultValue` 讓元件自持狀態。

## 示例

### 區間與步進

`min` / `max` 限定取值區間（預設 0–100），`step` 決定鍵盤微調的粒度（預設 1）。

### 禁用

傳入 `disabled` 後滑桿不再響應拖曳與鍵盤。

## Props

| Prop | 型別 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `value` | `number` | — | 受控當前值 |
| `defaultValue` | `number` | `min` | 非受控初始值 |
| `onValueChange` | `(value: number) => void` | — | 值變化回調 |
| `min` | `number` | `0` | 最小值 |
| `max` | `number` | `100` | 最大值 |
| `step` | `number` | `1` | 鍵盤步進 |
| `disabled` | `boolean` | `false` | 禁用態 |
| `semanticLabel` | `string` | — | 無障礙名稱 |
| `className` | `string` | — | 追加在元件類名之後 |

## 無障礙

元件帶 `slider` 語義角色，語義值為當前數值的字串形式。`←`/`↓` 減一個 `step`，`→`/`↑` 加一個 `step`，`Home`/`End` 跳到區間兩端；數值始終被鉗制在 `[min, max]` 內。
