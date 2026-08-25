---
title: Button
description: 觸發操作或事件的按鈕，渲染在 pingo canvas 上。
---

# Button

按鈕觸發一個操作。下方預覽由 pingo 引擎即時渲染——可以點選、聚焦，並跟隨網站主題切換明暗。

:::preview button-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Button } from "@dopejs/pingo-ui";

root.render(
  createElement(Button, {
    children: "保存",
    variant: "default",
    onPress: () => save(),
  }),
);
```

## 示例

### 尺寸

`size` 支援 `default`、`sm`、`lg` 與 `icon`。

### 禁用

傳入 `disabled` 後按鈕不再響應指標與鍵盤，並應用禁用樣式。

## Props

| Prop            | 型別                                                                | 預設值      | 說明               |
| --------------- | ------------------------------------------------------------------- | ----------- | ------------------ |
| `children`      | `string`                                                            | —           | 按鈕文字（必填）   |
| `variant`       | `"default" \| "secondary" \| "outline" \| "ghost" \| "destructive"` | `"default"` | 視覺變體           |
| `size`          | `"default" \| "sm" \| "lg" \| "icon"`                               | `"default"` | 尺寸               |
| `disabled`      | `boolean`                                                           | `false`     | 禁用態             |
| `onPress`       | `() => void`                                                        | —           | 指標/鍵盤觸發回調  |
| `semanticLabel` | `string`                                                            | `children`  | 無障礙名稱         |
| `className`     | `string`                                                            | —           | 追加在元件類名之後 |

## 無障礙

按鈕具備 button 語義與鍵盤觸發支援；`semanticLabel` 預設取 `children`，圖示按鈕請顯式提供。
