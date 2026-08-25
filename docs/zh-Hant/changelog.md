---
title: 變更紀錄
---

# Changelog

版本口徑見 `docs/release.md`：12 個套件同版本原子發佈，npm semver 與二進位
ABI 版本獨立管理。

## 0.3.0 - 2026-08-25

- 虛擬清單的項目現在會跨清單拉伸，表格的表身列因此與表頭欄寬對齊。包裝盒的版面配置歸
  Core 所有，不進入樣式階層。
- 可捲動容器內被拉伸的子節點重新取得確定的交叉尺寸與百分比基準：捲動面板裡的盒子不再
  退回收縮包裹，虛擬項目裡的 `100%` 不再解析為 0。
- flex 項目取得 CSS 的 automatic minimum size（僅區塊軸）：一個極大的兄弟節點不再能把
  內容尺寸的項目壓到 0。CSS 子集升至 1.8.0，`min-width`/`min-height` 初始值改為 `auto`。
- 元件：Skeleton 加上脈動動畫；NavigationMenu 不再套用 Menubar 的外框並帶上 chevron；
  表格表頭不可壓縮；StatCard/TopBar/ListRow 在沒有寬度時保住自己的內容寬。
- 發布鏈：npm 發布集與產物清單改為從驗證器的套件清單衍生；可重現建置的驗證移到門檻鏈尾。
- 專案授權自 0.3.0 起由 MIT 改為 Apache-2.0；v0.2.1 及更早的已發佈
  版本仍維持 MIT。
- 滾輪傳遞曲線對齊瀏覽器原生：離散滾輪格改為動畫捲動，高精度（觸控板）差量
  維持即時 1:1；Input Stream 的 `DispatchEvent` 新增 flags 欄位，ABI 版本
  1 → 2。
- 官方網站提供簡體中文、繁體中文、西班牙語、法語、德語、俄語、希伯來語、
  阿拉伯語、日語與韓語。

## 0.1.0

首個可發佈版本。P0–M5 全部工程里程碑完成，`pnpm m5:check`（M0→M5 全鏈
自動門檻）全綠。

- 確定性 Rust/WASM Core + TypeScript Shell：單一來源 schema、版本化二進位
  Mutation/Input/DisplayList/反向流，畸形輸入原子拒絕。
- 雙時鐘繪製：SAB → postMessage → 主執行緒 Canvas2D 降級鏈，主執行緒阻塞
  200ms 時 Worker 連續呈現。
- 原生虛擬捲動（百萬列 P95/P99 次微秒級重播）與文字子系統（明確字體
  shaping、glyph atlas、系統字體 fallback）。
- canvas 原生編輯：EditContext/輸入代理雙路徑、IME composition、指標與
  鍵盤 caret 導覽、剪貼簿、undo/redo、密碼遮罩、caret scroll-into-view。
- 命中測試（增量 BVH + 樸素 oracle 屬性測試）與 capture/target/bubble
  三階段事件、non-passive 區域同步 `preventDefault` 協定。
- 無障礙：語意樹匯出、DOM 影子樹鏡像、`getByRole` 語意 E2E 選擇器、
  鍵盤聚焦轉送。
- 遷移與生產化：`@dopejs/pingo-compat` 依頁面灰度/回退、遷移掃描器、
  發佈套件與 WASM SHA-256 完整性驗證、診斷與運行手冊。
- WebGPU 隔離原型與 headless oracle 零失配差分（ADR-0006：
  Continue Experiment，預設關閉）。

明確延後：bidi 視覺導覽、widgets placeholder、WebGPU 預設啟用。
平台資格（實機效能、真實 IME、螢幕閱讀器）另行追蹤，不隨套件版本承諾。
