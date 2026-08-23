---
title: SCSS / Less
description: 用 SCSS 或 Less 編寫 pingo 樣式表：建構期編譯管線、Vite 外掛、安全邊界與錯誤診斷。
---

# SCSS / Less

pingo 的 CSS subset（見[樣式指南](/guide/styling)）在執行時只接受 CSS 文字或物件。
想用變數、mixin、`@use` / import 等作者體驗，走 **建構期編譯**：SCSS/Less 在 Node 側
由 `@dopejs/pingo-style-preprocess` 編譯成 CSS，再經現有 `compileStyleSheet` 校驗，
生成預設匯出 `PingoStyleSheet` 的 JavaScript 模組。

**Sass 和 Less 不會進入瀏覽器 bundle、facade 或 Core**——執行時沒有任何預處理器，
只有原本就存在的輕量 CSS 編譯器。子集邊界也不會因此擴大：後代選擇器、`@media`、
`var()`、`calc()`、`em/rem/vw/vh` 等仍按現有診斷拒絕，建構失敗而不是靜默放行。

## 兩種匯入語義必須分開

### 普通 DOM 樣式（Vite 原生）

```ts
import "./site.scss";
import "./probe.less";
```

這條路徑是 Vite 自帶的 CSS 預處理能力，輸出 **DOM CSS**，由 Vite 注入或抽取。
它只適用於文件站、Storybook 外殼這類 DOM 頁面，**不會產生 `PingoStyleSheet`**，
也不要把它用於 canvas 內的樣式。

### pingo 樣式表（`?pingo-style`）

```ts
import { createHostedCanvasRoot } from "@dopejs/pingo";
import buttonSheet from "./button.scss?pingo-style";
import themeSheet from "./theme.less?pingo-style";

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [buttonSheet, themeSheet],
});
```

`?pingo-style` 是顯式的型別邊界：建構期先預處理再按 CSS subset 校驗，生成的 ESM
模組預設匯出 `PingoStyleSheet`，**不會向 DOM 注入任何 CSS**。

## Vite 外掛

安裝 Node-only 工具套件（需要 Node >= 22.12，Vite ^8）：

```sh
pnpm add -D @dopejs/pingo-style-preprocess
```

在 `vite.config.ts` 註冊：

```ts
import { pingoStylePreprocess } from "@dopejs/pingo-style-preprocess/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    pingoStylePreprocess({
      // 可选：额外的 Sass load paths / Less paths
      scssLoadPaths: ["styles"],
      lessPaths: ["styles"],
      // 可选：依赖必须落在这些目录内（默认只有 entry 所在目录与 load paths）
      allowRoots: ["src", "styles"],
    }),
  ],
});
```

型別宣告由套件的 `./client` 入口提供，在 `tsconfig.json` 裡引用一次即可：

```json
{
  "compilerOptions": {
    "types": ["@dopejs/pingo-style-preprocess/client"]
  }
}
```

外掛的行為約定：

- 只匹配精確 query flag `pingo-style` 加 `.scss` / `.less` 副檔名；其餘檔案不受影響。
- 透過 virtual module 隔離 Vite 原生 CSS pipeline，不會重複預處理或注入 DOM CSS。
- entry 與全部 partial/import 都進入 watch graph——**改 token 或 mixin 會觸發
  HMR 與生產重建構**，不需要手動清快取。
- 任一 error 級診斷讓建構失敗關閉；warning 帶源位置輸出。HMR 編譯失敗時保留上一個
  已提交模組並在 dev server 報錯。
- 生成的模組在初始化時校驗 `CSS_SUBSET_VERSION`：如果執行時 facade 與建構期校驗
  使用的 subset 版本不一致，模組載入即拋錯，不會讓兩套語義混跑。
- dev、production、SSR 三種環境生成語義一致的樣式表。

## Node 編譯 API

非 Vite 的建構系統（CLI、codegen）可以直接用 Node API：

```ts
import {
  compileLessString,
  compilePingoStyleFile,
  compileScssString,
  createStyleSheetFromLess,
  createStyleSheetFromScss,
} from "@dopejs/pingo-style-preprocess";
```

- `compileScssString(source, options)`：同步，因此**只處理無 import 的原始碼**；
  有 import 時回傳 `file-api-required` 診斷。
- `compileLessString(source, options)`：非同步（Less 的 `render` 是 Promise）；只有提供
  絕對路徑的 `sourceName` 後才解析相對 import。
- `compilePingoStyleFile(filename, options)`：非同步檔案 API，Vite 外掛走的就是它，
  相對解析基準明確，相依圖完整。
- `compile*` 系列對作者輸入錯誤**不拋異常**，回傳 `styleSheet: null` 與穩定排序的
  diagnostics；`createStyleSheetFromScss` / `createStyleSheetFromLess` 是拋異常的
  便捷封裝，作者錯誤統一拋 `StylePreprocessError` 並保留全部 diagnostics。

回傳的 `StylePreprocessResult` 包含 `cssText`、`styleSheet`、`diagnostics` 與
`dependencies`（完整相依檔案列表，可用於自建 watch）。

## Source map 與錯誤診斷

每個診斷都帶階段標記：

| `stage`       | 來源                                            |
| ------------- | ----------------------------------------------- |
| `"scss"`      | Sass 編譯異常（語法錯誤、未定義變數等）         |
| `"less"`      | Less 編譯 rejection                             |
| `"pingo-css"` | 產物超出 CSS subset 的 `compileStyleSheet` 診斷 |

兩個編譯器都開啟 source map，pingo CSS 診斷的生成位置會**盡力對映回原始
SCSS/Less 檔案與行列**（`sourceLocation`）；無法對映時保留生成位置
（`generatedLocation`）與 entry 名，不會偽造原始位置。診斷按生成位置與 code
穩定排序，CI 輸出與 snapshot 可復現。

## 安全邊界

預處理器在建構期執行作者程式碼，因此預設收緊：

- **Sass**：不開放 custom importer、custom function 或 Node package importer；
  只接受 `file:` 相依。
- **Less**：固定 `javascriptEnabled: false`，不傳 plugins，預掃描拒絕 `@plugin`；
  不允許 HTTP(S) 或協議相對匯入。
- **共同限制**：相依 canonicalize 後必須位於 allow roots（entry 所在目錄 + 顯式
  load paths）內；symlink 逃逸、非檔案相依、遠端相依一律拒絕。編譯後 CSS 先過
  1,048,576 code-unit 上限再進 subset 校驗；entry、相依數量與相依總位元組都有顯式
  預算，超限產生穩定建構錯誤。
- 編譯器版本由 lockfile 固定，fixture 的 CSS、diagnostics 與相依列表做
  reproducibility snapshot；升級 Sass/Less 需要顯式審查輸出差異。

這些限制只約束 `?pingo-style` 工具鏈；普通 DOM 的 `.scss` / `.less` 仍遵循 Vite
自己的配置。

## 顏色函式

預處理器常輸出顏色函式，subset 為此支援 `rgb()` / `rgba()` / `hsl()` / `hsla()`
（legacy 逗號與現代 space/slash 兩種形式），統一歸一到 8-bit RGBA。超出這個集合的
輸出——`color(display-p3 ...)`、CSS 自訂屬性、`calc()`——繼續建構失敗。
