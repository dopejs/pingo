---
title: 基礎元素：View、Text 與 Image
description: View 容器與 flex 版面、Text 文字渲染、Image 點陣圖與 PingoFont 顯式字型。
---

# 基礎元素：View、Text 與 Image

pingo 的主機元素直接對應 Scene 節點，不存在 CSS 層疊或選擇器匹配的開銷（樣式能力見
[樣式](/guide/styling)）。本頁覆蓋三個最基礎的元素：通用盒子 `View`、文字 `Text` 與點陣圖
`Image`。下方預覽由 pingo 引擎即時渲染，並跟隨網站主題切換明暗。

:::preview elements-layout
:::

## View 與版面

`View` 是通用分組盒子（對應 `container` 主機元素），不引入新的 Scene 節點種類：

- `width` / `height` / `minWidth` / `maxWidth` / `padding` / `backgroundColor` / `opacity` /
  `transform` 是直接 props，`padding` 接受數值或 `[上, 右, 下, 左]` 四元組。
- `flexDirection`、`justifyContent`、`alignItems`、邊框與圓角走 `style` 內聯通道
  （型別化的 CSS 子集，見 [樣式](/guide/styling)）。
- 子項間距用固定尺寸的容器顯式表達，預覽中的 `row` / `column` 助手就是這麼實作的。

## 用法

```tsx
import { createElement, Text, View } from "@dopejs/pingo";

root.render(
  createElement(View, {
    width: 420,
    padding: 16,
    backgroundColor: "#ffffffff",
    style: { flexDirection: "column", borderRadius: 10 },
    children: [
      createElement(Text, { value: "标题", fontSize: 24, lineHeight: 32, fontWeight: 700 }),
      createElement(View, { height: 8 }),
      createElement(Text, { value: "正文", fontSize: 14, lineHeight: 22 }),
    ],
  }),
);
```

## Text：文字執行

文字的 shaping、換行與測量全部由 Core 完成——中英文混排、emoji、組合字元都不需要
Shell 參與。內容用 `value` 或字串 `children` 給出。

:::preview elements-text
:::

### Props（Text）

| Prop         | 型別               | 預設值      | 說明                                 |
| ------------ | ------------------ | ----------- | ------------------------------------ |
| `value`      | `string`           | —           | 文字內容（與 `children` 二選一）     |
| `children`   | `string \| number` | —           | 文字內容                             |
| `color`      | `Color`            | `#000000ff` | 文字顏色，可繼承                     |
| `fontSize`   | `number`           | —           | 字號（邏輯畫素）                     |
| `lineHeight` | `number`           | —           | 行高（邏輯畫素）                     |
| `fontWeight` | `number`           | —           | 字重                                 |
| `fontFamily` | `string`           | —           | CSS 字型族                           |
| `font`       | `PingoFont`        | —           | 顯式不可變字型；不支援的輸入整段回退 |

`Text` 同時繼承全部 [CommonProps](/api)（尺寸、padding、事件、`semanticRole` /
`semanticLabel` 等）。

## Image：點陣圖

`Image` 的 `source` 是一張 `PingoImage`——Shell 側持有的**不可變 RGBA8 點陣圖**，在提交
邊界同步內聯為 Scene 資源。用 `createImage` 建立，它會複製並校驗畫素：

```ts
import { createImage, Image } from "@dopejs/pingo";

const icon = createImage(pixels, 96, 96, { label: "应用图标" });
createElement(Image, { source: icon, width: 48, height: 48 });
```

不傳 `width` / `height` 時節點取影象的畫素尺寸；傳入則縮放進節點盒。`label` 即無障礙
名稱，留空表示裝飾性影象。

:::preview elements-image
:::

畫素而不是編碼位元組是刻意的取捨：資源事務在提交邊界同步生效，而任何編碼格式都需要
非同步解碼。列表縮圖這類小圖適合這條路徑；大圖應當走帶非同步 staging 的編碼路徑。

## 字型：PingoFont 與 loadFont

`Text` / 可編輯元素的 `font` prop 接受一個顯式的不可變 SFNT 字型（TTF/OTF/TTC），由
Core 確定性 shaping。`createFont` 接收已解碼的 SFNT 位元組；`loadFont` 額外處理網路載入
與 WOFF/WOFF2 解碼：

```ts
import { loadFont } from "@dopejs/pingo";

const inter = await loadFont("/fonts/Inter-Regular.woff2", {
  fallbackFamily: "sans-serif",
});
createElement(Text, { value: "Hello", font: inter, fontSize: 16 });
```

`PingoFontOptions`：`faceIndex`（TTC 集合中的字面索引，預設 `0`）與
`fallbackFamily`（顯式字型路徑整體回退時使用的 CSS 族，預設 `"sans-serif"`）。
載入失敗拋出帶穩定 `code` 的 `PingoFontLoadError`（如 `fetch-failed`、`decode-failed`、
`unsupported-format`）。

## 無障礙

`semanticRole` 與 `semanticLabel` 是所有元素共有的 props：標題、按鈕、區域都應在元素上
標註語義，`Image` 的名稱來自 `createImage` 的 `label`。語義快照會鏡像成 canvas 旁的 DOM
影子樹，詳見[無障礙](/guide/accessibility)。
