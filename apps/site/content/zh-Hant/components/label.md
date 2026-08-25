---
title: Label
description: 表單標籤文字，配合輸入控制項使用，渲染在 pingo canvas 上。
---

# Label

標籤用於為表單控制項提供可見名稱。下方預覽由 pingo 引擎即時渲染，並跟隨網站主題切換明暗。

:::preview label-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Input, Label } from "@dopejs/pingo-ui";

root.render(
  createElement("container", {
    style: { flexDirection: "column" },
    children: [
      createElement(Label, { children: "邮箱" }),
      createElement("container", { height: 8 }),
      createElement(Input, { semanticLabel: "邮箱", width: 320 }),
    ],
  }),
);
```

pingo 沒有 `gap` 屬性，標籤與控制項之間的間距用一個固定尺寸的容器實作。

## 示例

### 語義名稱

控制項關聯在 pingo 中尚不存在，因此標籤與控制項的關聯靠約定：給控制項傳入與標籤一致的 `semanticLabel`，讓螢幕閱讀器能讀出同樣的名稱。

## Props

| Prop            | 型別     | 預設值 | 說明                             |
| --------------- | -------- | ------ | -------------------------------- |
| `children`      | `string` | —      | 標籤文字（必填）                 |
| `className`     | `string` | —      | 追加在元件類名之後               |
| `semanticLabel` | `string` | —      | 覆蓋無障礙名稱；預設使用標籤文字 |

## 無障礙

pingo 尚無 label–control 關聯機制，Label 只是帶樣式的文字。請始終在對應控制項上設定 `semanticLabel`，保證無障礙名稱不相依視覺鄰近關係。
