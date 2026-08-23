---
title: 樣式
description: pingo 的 CSS subset：類選擇器、層疊與優先順序、繼承邊界，以及 pingo-ui 的主題與覆蓋約定。
---

# 樣式

pingo 的樣式是一個**版本化的 CSS subset**（當前 1.6.0）：CSS 文字在 Shell 側解析與計算，
Core 只消費規範化後的型別化值——CSS 文字和選擇器匹配永遠不會進入 Core。
完整的屬性支援表見 [CSS subset 支援](/style-support)，本頁講用法與邊界。

## 建立與註冊樣式表

用 `createStyleSheet` 編譯 CSS 文字（輸入非法時拋 `StyleSheetCompileError`），
在建立 root 時註冊：

```ts
import { createElement, createHostedCanvasRoot, createStyleSheet } from "@dopejs/pingo";

const sheet = createStyleSheet(
  `
  .card {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 16px;
  }
  `,
  { sourceName: "app.css" },
);

const root = await createHostedCanvasRoot(canvas, { styleSheets: [sheet] });

root.render(
  createElement("container", {
    className: "card",
    width: 320,
    children: createElement("text", { value: "你好", fontSize: 14 }),
  }),
);
```

不想處理異常時可以用 `compileStyleSheet`：它對作者輸入不拋異常，回傳穩定的
diagnostics。樣式表也可以寫成型別安全的物件形式（`PingoStyleSheetObject`），鍵是
帶不帶前導點都可以的類選擇器，值是 `PingoStyle`：

```ts
const sheet = createStyleSheet({
  card: { backgroundColor: "#ffffffff", borderRadius: 8, padding: 16 },
  "card:hover": { backgroundColor: "#f5f5f5ff" },
});
```

元素透過 `className` prop 掛類（ASCII 空白分隔的多個類名），透過 `style` prop
寫內聯宣告（`PingoStyle`，由 Shell 解析後再進 Core）。

## 選擇器與層疊

子集只支援**同一節點上的類選擇器**，以及四個互動狀態偽類：

- 單類 `.card`；複合類 `.pui-card.pui-dark`（節點同時具備全部類才命中）。
- 狀態 `:hover`、`:active`、`:focus`、`:focus-visible`，可與類複合，如 `.btn:hover`。

不支援：元素選擇器、後代/子代等組合器、`@media` / `@supports` / `@keyframes`、
`var()` / `calc()`。長度單位只有 `px` 與 `%`（`em` / `rem` / `vw` / `vh` 會被拒絕）；
顏色寫 hex 或 `rgb()` / `rgba()` / `hsl()` / `hsla()`（兩種新老語法都接受），
顏色關鍵字（如 `red`）不受支援。

層疊規則與 CSS 同構但更簡單：

1. **優先順序（specificity）= 類數 + 狀態數**。`.pui-card.pui-dark`（2）勝過 `.card`（1）。
2. **同優先順序按 source order**：後註冊的樣式表、同表內靠後的規則生效。
3. **內聯 `style` prop 勝過一切樣式表規則**；元素上的直接 props（如 `width`、
   `backgroundColor`）優先順序最高，勝過 `style`。

注意第 2 條的推論：覆蓋生效的依據是**樣式表的註冊順序**，與類名在 `className`
字串裡的先後無關。

## 繼承與計算樣式邊界

只有少量屬性繼承：`color`、`visibility`、`font-family` / `font-size` / `font-weight` /
`font-style`、`line-height`、`text-align`、`white-space`、`overflow-wrap`、
`pointer-events`、`cursor`。其餘屬性（包括全部版面屬性）每個節點都從初始值開始，
不寫就是沒有——不存在"從父級繼承寬度"這類行為。

每個屬性在單源 schema 裡宣告自己的失效域（版面/繪製/命中/語義）。改 `opacity`
不會觸發重排，改 `width` 會；這與[架構](/guide/architecture)裡的失效模型是同一套機制。

### 互動狀態宣告的屬性受限

狀態規則（如 `.btn:hover`）裡只允許寫繪製類屬性：`background-color`、`color`、
`opacity`、各邊 `border-*-color`、`border-radius`、`box-shadow`、`visibility`、
`transform` / `transform-origin`、`pointer-events`、`cursor`。在狀態規則裡寫版面屬性
會在編譯期被拒絕——狀態切換不能觸發版面變化。

## 與 CSS 的主要偏差

子集有意不做完整 CSS 相容，關鍵偏差（完整清單見 [CSS subset 支援](/style-support)）：

- `position: absolute` 的包含區塊是**父節點**而不是最近的 positioned 祖先；
  沒有 `position: relative`，視覺偏移用 `transform`。
- 沒有 `flex-wrap`：flex 容器單行，主軸溢位裁剪或捲動。
- flex item 沒有 automatic minimum size，可被壓縮到 0（等價於瀏覽器裡寫 `min-width: 0`）；
  `min-width: auto` / `min-height: auto` 直接編譯失敗。
- 主軸尺寸不確定時百分比解析為 `0` 而不是 CSS 的 `auto`。
- `box-shadow` 只支援外陰影、每節點最多 4 層，`inset` 被拒絕。
- `z-index` 只在兄弟之間穩定重排，沒有 stacking context。

## pingo-ui 的主題與覆蓋約定

`@dopejs/pingo-ui` 元件庫的外觀就是一張用上述機制編譯的樣式表：

```ts
import { createHostedCanvasRoot, createStyleSheet } from "@dopejs/pingo";
import { createPingoUiStyleSheet } from "@dopejs/pingo-ui";

const myOverrides = createStyleSheet(`
  .pui-button { border-radius: 4px; }
`);

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [createPingoUiStyleSheet(), myOverrides], // 顺序不能反
});
```

- **`createPingoUiStyleSheet()` 為每個 root 建立一份獨立的不可變 sheet**。
- **使用者 sheet 必須註冊在 pingo-ui sheet 之後**：同優先順序按 source order 覆蓋，
  寫在後面的生效。元件的 `className` prop 追加在元件自身類名之後
  （如 `pui-input pui-input--disabled mine`），但能否覆蓋只取決於上面的註冊順序。
- 想提高覆蓋的優先順序，用複合類提高 specificity（如 `.pui-button.mine`），而不是
  相依書寫位置。

### 明暗主題

```ts
import { setTheme, useTheme } from "@dopejs/pingo-ui";

setTheme("dark"); // 所有订阅组件自动重渲染
useTheme();       // 在组件 render 内读取并订阅
```

主題是模組級 signal：元件 render 中 `useTheme()` 自動訂閱，`setTheme` 觸發全部
訂閱元件重渲染。深色透過 compound class 實作——dark 主題下元件掛 `pui-dark`
標記類，外觀裡的 `.pui-x.pui-dark` 複合規則命中（如 `.pui-card.pui-dark`）。

**品牌訂製是建構期行為**：新建 preset 用
`@use "@dopejs/pingo-ui/styles/tokens" with ($primary: ...)` 覆蓋 token，再經
`@dopejs/pingo-style-preprocess` 的 Vite 外掛重新編譯元件外觀——改品牌色 = 重新
建構，執行時不可換。token 值的顏色同樣只能寫 hex 或
`rgb()` / `rgba()` / `hsl()` / `hsla()`。SCSS/Less 管線見
[SCSS / Less 指南](/guide/scss-less)。
