---
title: Icon Button
description: 只承載圖示的按鈕，必須提供無障礙名稱，渲染在 pingo canvas 上。
---

# Icon Button

圖示按鈕用於沒有文字標籤的緊湊操作。下方預覽由 pingo 引擎即時渲染——可以點選、聚焦，並跟隨網站主題切換明暗。

:::preview icon-button-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { IconButton } from "@dopejs/pingo-ui";

root.render(
  createElement(IconButton, {
    icon: createElement("text", { value: "★" }),
    semanticLabel: "收藏",
    variant: "outline",
    onPress: () => toggleFavorite(),
  }),
);
```

`icon` 是一個透傳的插槽，接受任意 `PingoNode`——圖示字型、SVG 或文字字形都可以。因為沒有可見文字，`semanticLabel` 是必填的。

## 示例

### 變體

`variant` 與 [Button](/components/button) 完全對齊：`default`、`secondary`、`outline`、`ghost`、`destructive`。

### 已知限制

`size` 支援 `default`、`sm`、`lg`，但當前外觀沒有為 icon 變體編寫 `sm`/`lg` 的複合規則，圖示尺寸會覆蓋尺寸修飾，`sm`/`lg` 暫無視覺效果。

## Props

| Prop            | 型別                                                                | 預設值      | 說明                             |
| --------------- | ------------------------------------------------------------------- | ----------- | -------------------------------- |
| `icon`          | `PingoNode`                                                         | —           | 圖示插槽，原樣透傳（必填）       |
| `semanticLabel` | `string`                                                            | —           | 無障礙名稱（必填）               |
| `variant`       | `"default" \| "secondary" \| "outline" \| "ghost" \| "destructive"` | `"default"` | 視覺變體                         |
| `size`          | `"default" \| "sm" \| "lg"`                                         | `"default"` | 尺寸（`sm`/`lg` 暫無效，見上文） |
| `disabled`      | `boolean`                                                           | `false`     | 禁用態                           |
| `onPress`       | `() => void`                                                        | —           | 指標/鍵盤觸發回調                |
| `className`     | `string`                                                            | —           | 追加在元件類名之後               |

## 無障礙

圖示按鈕沒有可見文字，螢幕閱讀器只能相依 `semanticLabel`，因此該 prop 為必填。按鈕具備 button 語義與鍵盤觸發支援。
