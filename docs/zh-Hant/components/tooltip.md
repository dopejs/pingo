---
title: Tooltip
description: 懸停時顯示的簡短說明文字，錨定在目標元素上方。
---

# Tooltip

Tooltip 在指標懸停時顯示一小段說明文字，預設錨定在目標上方。下方預覽由 pingo 引擎即時渲染——把指標懸停在按鈕上即可看到氣泡，並跟隨網站主題切換明暗。

:::preview tooltip-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Button, Tooltip } from "@dopejs/pingo-ui";

root.render(
  createElement(Tooltip, {
    content: "保存到云端",
    children: createElement(Button, { children: "保存", onPress: () => save() }),
  }),
);
```

Tooltip 由指標進出驅動（`pointerenter` / `pointerleave`），無受控 props；靜態渲染時只顯示觸發元素，氣泡在懸停時出現。

## Props

| Prop | 型別 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `content` | `string` | — | 氣泡文字（必填） |
| `children` | `PingoNode` | — | 觸發元素（必填） |
| `className` | `string` | — | 追加在錨點容器類名之後 |

## 無障礙

氣泡具備 tooltip 語義。Tooltip 只在懸停時出現，不響應鍵盤聚焦；關鍵資訊不要只放在 Tooltip 裡。
