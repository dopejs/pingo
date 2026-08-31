---
title: Toggle
description: 兩態切換按鈕，用於加粗、斜體等即時開關，渲染在 pingo canvas 上。
---

# Toggle

兩態切換按鈕，按下一次保持開啟，再按一次關閉。下方預覽由 pingo 引擎即時渲染——可以點按切換狀態，並跟隨網站主題切換明暗。

:::preview toggle-basic
:::

## 用法

```tsx
import { Toggle } from "@dopejs/pingo-ui";

root.render(
  <Toggle defaultPressed onPressedChange={(pressed) => console.log(pressed)}>
    加粗
  </Toggle>,
);
```

`Toggle` 內部透過 hooks 持有狀態，必須用 JSX 以元件形式掛載。傳入 `pressed` 即進入受控模式；否則用 `defaultPressed` 讓元件自持狀態。

## 示例

### 禁用

傳入 `disabled` 後按鈕不再響應指標與鍵盤，也不再接收 Enter/空格 觸發。

## Props

| Prop              | 型別                         | 預設值  | 說明               |
| ----------------- | ---------------------------- | ------- | ------------------ |
| `children`        | `string`                     | —       | 按鈕文字（必填）   |
| `pressed`         | `boolean`                    | —       | 受控按下狀態       |
| `defaultPressed`  | `boolean`                    | `false` | 非受控初始按下狀態 |
| `onPressedChange` | `(pressed: boolean) => void` | —       | 狀態切換回調       |
| `disabled`        | `boolean`                    | `false` | 禁用態             |
| `className`       | `string`                     | —       | 追加在元件類名之後 |

## 無障礙

元件帶 button 語義，語義值隨狀態在 `on` / `off` 間切換。指標按下時自動聚焦，`Enter` 與 `空格` 均可觸發。
