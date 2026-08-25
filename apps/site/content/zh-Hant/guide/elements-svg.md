---
title: 向量圖形：Path 與 SVG
description: Path 向量輪廓與 SVG 文件子集——d 語法、viewBox 縮放、描邊與 currentColor 圖示。
---

# 向量圖形：Path 與 SVG

pingo 的向量圖形是引擎繪製的一等能力：路徑作為不可變資源存在 Core 側，同一個圖示畫
50 次也只有一份幾何。兩個入口：`Path` 直接接受一段 SVG path 資料；`Svg` 接受
`createSvg` / `loadSvg` 解析出的整個文件。下方預覽由引擎即時渲染，圖示顏色跟隨網站主題。

:::preview elements-svg-icon
:::

## Path：單條輪廓

```tsx
import { createElement, Path, View } from "@dopejs/pingo";

createElement(View, {
  style: { color: "#3157dfff" }, // 轮廓画在节点的 color 里，像文字一样继承
  children: createElement(Path, {
    d: "M20 6 9 17l-5-5",
    viewBox: [0, 0, 24, 24],
    width: 24,
    height: 24,
    strokeWidth: 2,
  }),
});
```

- `d` 支援完整 SVG path 語法（`M L H V C S Q T A Z` 及小寫相對形式）；圓弧 `A` 在解析時
  轉成三次貝塞爾，Core 不需要單獨的曲線型別。
- `viewBox` 是作者空間的盒子，繪製時縮放進節點盒——同一資源在 16px 與 48px 的節點裡
  都直接可用，不需要呼叫方換算。
- 不傳 `strokeWidth` 時填充輪廓；傳入非零值則按該寬度描邊（round cap/join）。
- `geometryTransform` 在編碼前烘焙進幾何點（SVG 文件裡 group 變換移動的是圖形而不是
  它所在的盒子），與節點的視覺 `transform` 是兩回事。

:::preview elements-path
:::

## Svg：文件子集

`createSvg(markup)` 用手寫解析器而不是 `DOMParser`——引擎要在瀏覽器、Worker 與 headless
差分測試裡產出完全一致的幾何，而 `DOMParser` 在 Worker 裡不存在。子集就是圖示集實際
包含的內容：

- 形狀元素：`path` `circle` `ellipse` `rect` `line` `polyline` `polygon`；
- 結構元素：`svg` `g` `title` `desc` `defs` `metadata`；
- 屬性：`fill` `stroke` `stroke-width` `fill-rule` `transform`
  （`translate`/`scale`/`rotate`/`matrix`，skew 不在子集內）。

子集之外的元素**按名拒絕**並拋出 `PingoSvgError`——呼叫方會明確知道丟了什麼，而不是
面對一個空白盒子。命名 CSS 顏色同樣被拒絕：半張顏色表會讓一部分文件正常、另一部分
悄悄變黑。十六進位制顏色、`none`、`transparent` 與 `currentColor` 都在子集內；
`currentColor` 解析為"繼承節點顏色"，因此圖示可以像文字一樣跟隨主題換色（預覽中的
做法）。

`Svg` 元件把文件展開成**每個形狀一個 path 節點**，形狀之間用絕對定位疊加；既填充又
描邊的形狀會變成兩個節點——填充與描邊是兩種 paint，不是一個節點的兩半。

```ts
import { createSvg, loadSvg, Svg } from "@dopejs/pingo";

const icon = createSvg(`<svg viewBox="0 0 24 24" stroke="currentColor" …>…</svg>`);
createElement(Svg, { source: icon, width: 24, height: 24, style: { color: "#3157df" } });

const remote = await loadSvg("/assets/logo.svg");
```

需要程式化訪問時，`PingoSvg.shapes` 給出每個形狀的 `d`、`transform`、填充/描邊與
`fillRule`；`shapeData(name, attributes)` 可以把單個形狀元素轉成等價的 path 資料。

## Props（Path）

| Prop                | 型別                                                        | 預設值      | 說明                                        |
| ------------------- | ----------------------------------------------------------- | ----------- | ------------------------------------------- |
| `d`                 | `string`                                                    | —           | SVG path 資料（必填，僅路徑語法，不是文件） |
| `viewBox`           | `readonly [number, number, number, number]`                 | —           | 作者空間盒子，縮放進節點盒                  |
| `strokeWidth`       | `number`                                                    | —           | 非零時描邊而不填充                          |
| `fillRule`          | `"nonzero" \| "evenodd"`                                    | `"nonzero"` | 填充規則                                    |
| `geometryTransform` | `readonly [number, number, number, number, number, number]` | 單位矩陣    | 編碼前烘焙進幾何的變換                      |

## Props（Svg）

| Prop     | 型別       | 預設值 | 說明                                         |
| -------- | ---------- | ------ | -------------------------------------------- |
| `source` | `PingoSvg` | —      | `createSvg` / `loadSvg` 解析出的文件（必填） |

兩者都繼承 [CommonProps](/api)（`width`/`height`、事件、語義 props 等）。

## 無障礙

向量圖形本身沒有語義。裝飾性圖示不需要標註；可點選的圖示按鈕請給它
`semanticRole: "button"` 與 `semanticLabel`，詳見[無障礙](/guide/accessibility)。
