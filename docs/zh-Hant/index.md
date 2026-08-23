---
layout: home

hero:
  name: Pingo
  text: canvas 渲染引擎
  tagline: Rust/WASM 核心 + TypeScript 外殼 + 可插拔後端。為高效能互動、原生虛擬捲動與 canvas 內文字編輯而設計，附帶基礎元件、CSS 樣式與 shadcn 對齊的 UI 元件庫。
  image:
    light: /pingo-mark.svg
    dark: /pingo-mark-dark.svg
    alt: Pingo
  actions:
    - theme: brand
      text: 快速開始
      link: /guide/getting-started
    - theme: alt
      text: Playground
      link: /playground
    - theme: alt
      text: GitHub
      link: https://github.com/dopejs/pingo

features:
  - title: 雙時鐘，主執行緒卡死也不掉幀
    details: UI 時鐘與渲染時鐘相互獨立。捲動、動畫、版面與合成在 Worker 內閉環推進；主執行緒被阻塞 200ms 時畫面仍然連續。
  - title: 原生虛擬捲動
    details: 前綴和樹、方向預測預熱與佔位補建都在 Core 內。百萬行固定 fixture 的 20,000 幀重放 P95/P99 為亞微秒級，捲動穩態完全不回調 Shell。
  - title: canvas 原生編輯
    details: caret、選區、拖選、雙擊選詞、IME composition、候選窗定位、剪貼簿與撤銷重做全部由引擎實作。業務不再為輸入能力建立 HTML 控制項。
  - title: 無障礙是架構的一部分
    details: Core 匯出語義樹，宿主鏡像成 canvas 旁的 DOM 影子樹。螢幕閱讀器可用，E2E 能按 role/label 選中元素，而不是比對畫素。
  - title: 確定性與差分測試
    details: 版本化二進位流、可注入時鐘與隨機源、錄製回放，以及增量與全量、最佳化與樸素、wasm 與 native 的差分 oracle。
  - title: 自動降級，永遠有退路
    details: SharedArrayBuffer → postMessage → 主執行緒 Canvas2D 按能力自動選擇，功能等價。遷移層支援按頁面灰度與一鍵回退。
  - title: 基礎元件開箱即用
    details: View/Text/Image、Input/TextArea、SVG/Path 等引擎級元素直接對應 Scene 節點，文字 shaping、caret 幾何與編輯能力來自 Core，不需要 DOM 控制項拼湊。
  - title: CSS 與 SCSS/Less 支援
    details: Shell 側解析的版本化 CSS subset：類選擇器、互動狀態、繼承與計算樣式都有明確邊界；SCSS/Less 在建構期編譯校驗，預處理器不進入瀏覽器 bundle。
  - title: shadcn 對齊的 UI 元件庫
    details: "@dopejs/pingo-ui 的元件 API 與外觀語義對齊 shadcn/ui——Button、Dialog、Table、Calendar 等全部渲染到 canvas，支援明暗主題與樣式表覆蓋。"
---

## 30 秒上手

```sh
pnpm add @dopejs/pingo
```

```ts
import { createElement, createHostedCanvasRoot } from "@dopejs/pingo";

const root = await createHostedCanvasRoot(document.querySelector("canvas")!);

root.render(
  createElement("virtualList", {
    width: 480,
    height: 640,
    itemCount: 1_000_000,
    estimatedItemHeight: 32,
    renderItem: (index) => createElement("text", { value: `第 ${index} 行` }),
  }),
);
```

一百萬行不會在 Shell 側物化，捲動過程也不回調元件樹——視窗計算與補建都發生在 Core 內。

## 它不做什麼

Pingo 是渲染引擎，不是瀏覽器。**不做** SSR/HTML 首屏、通用 CSS 相容（盒模型、層疊、選擇器）、
小程式或原生適配層，也不做業務級富文字語義（協同、公式、Markdown 命令）。

引擎**確實擁有** caret、選區、IME、剪貼簿、撤銷重做與可編輯文字原語——這些不會被推回業務層用
DOM 控制項拼湊。

## 當前狀態

P0–M8 全部工程里程碑完成；M9“生產資格、增量合成與釋出硬化”已經完成規劃，尚未開始
實作，詳見 [M9 計劃](/m9-production-plan)。當前倉庫變更仍在 Unreleased，不表示已經發布
新的 npm 版本。

真機效能、真實輸入法、螢幕閱讀器與媒體功耗矩陣屬於平臺資格採集，單獨追蹤；
bidi 視覺導航與 WebGPU 後端預設啟用仍是[已記錄的延後項](/plan)。
