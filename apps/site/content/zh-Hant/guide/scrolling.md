# 捲動與虛擬化

## 捲動來自 overflow

任何 View 只要在某個軸上把 `overflow-x` / `overflow-y` 宣告為 `auto`、`scroll` 或
`hidden`，它就是那個軸上的捲動容器。不需要換成別的元素：

```ts
View({
  style: { height: 480, overflowY: "auto" },
  children: rows,
});
```

手勢、滾輪、捲動鏈與捲軸都由這一條宣告推導：命中路徑向上找最近的捲動祖先，捲軸由
Core 用它已經持有的捲動狀態繪製，所以捲動幀不進入 Shell。`hidden` 與 CSS 一致——不給
使用者捲軸，程式化捲動仍然有效。

**捲動不等於虛擬化。** overflow 只讓盒子捲動，它不會去猜你要不要把資料視窗化；下面的
`virtual` 是一份顯式契約，絕不從 overflow 或已經具現化的子節點推斷出來。

## 為什麼虛擬化放在引擎裡

DOM 虛擬列表的長尾問題來自：捲動事件要回到主執行緒 → 觸發 setState → diff → 重排。
主執行緒一忙，幀就掉。

pingo 把視窗計算放進 Core：捲動穩態**完全不呼叫 Shell**。Shell 只負責依 Core 規劃的
預熱視窗具現化可見區間；資料沒準備好時先畫佔位，後續幀補建。

## 給 View 一份資料視窗

虛擬化是 View 上的一個屬性，不是另一種元件——同一個捲動的盒子既可以裝普通子節點，也可以裝一百萬列：

```ts
View({
  style: { width: 480, height: 640, overflowY: "auto" },
  virtual: {
    axis: "y",
    itemCount: 1_000_000,
    estimatedItemSize: 32,
    getItemKey: (index: number) => `order-${index}`,
    renderItem: (index: number) =>
      View({
        style: { height: 32 },
        children: Text({ value: `第 ${index} 列` }),
      }),
  },
});
```

`estimatedItemSize` 只是初始估計。真實尺寸量測出來後，Core 透過前綴和樹（Fenwick）
校正錨點位置，捲軸不會跳動。

`axis` 是單軸的：一個視窗負責 `x` 或 `y`，不會同時負責兩個。

`VirtualList` 元件仍然可用，它是縱向列表的簡寫，落到同一套 Core 契約上；需要橫向、需要
`getItemKey`，或想讓同一個盒子既捲動普通內容又開視窗時，用 View 上的 `virtual`。

## 可調項

| `virtual` 欄位           | 作用                                   |
| ------------------------ | -------------------------------------- |
| `axis`                   | 窗口所在的單軸，`x` 或 `y`（預設 `y`） |
| `itemCount`              | 邏輯項目總數                           |
| `estimatedItemSize`      | 初始尺寸估計，量測後由 Core 校正       |
| `getItemKey`             | 穩定的項目識別，用於跨視窗複用         |
| `renderItem`             | 具現化單項，只對預熱視窗內的索引呼叫   |
| `baseOverscanViewports`  | 對稱預熱範圍（視窗倍數）               |
| `velocityHorizonSeconds` | 速度投影時長，用於方向預測             |
| `maximumAheadViewports`  | 單方向預熱上限                         |

方向預測會在快速 fling 時優先預熱運動方向，而不是對稱浪費兩側預算。

## 程式化捲動

`scrollX` / `scrollY` 是 View 自己的屬性，與是否虛擬化無關，值變化時才發出一次
`ScrollTo`：

```ts
View({ style: { height: 480, overflowY: "auto" }, scrollY: 500_000 * 32, children: rows });
```

或用 root 上的直接操縱 API（用於自訂手勢）：

```ts
root.beginScroll(handle);
root.scrollBy(handle, 0, deltaY, elapsedMs);
root.endScroll(handle); // 交給 Core 估算 fling 速度
```

`handle` 來自元素的 `ref` 回呼（`NodeHandle`）。

## 滾輪與觸控板

滾輪的**位移**與瀏覽器原生一致，但傳遞曲線依輸入來源分流：高精度差量（觸控板）即時 1:1 套用，
慣性仍由作業系統的事件流提供；離散滾輪格則累加到動畫目標並以指數緩出逼近，就像瀏覽器那樣，
且硬夾到內容邊界不產生 overscroll。

## 巢狀與編輯

滾輪捲動最近的捲動祖先——也就是最近一個宣告了 overflow 的 View。指標拖曳落在可編輯
文字上時，文字選取優先於捲動拖曳；這個優先序由命中路徑深度決定，不需要業務介入。

## 效能口徑

固定 fixture（百萬列、20,000 幀）的自動 benchmark 是合併門檻的一部分。
目前 P95/P99 為次微秒級重播，30 分鐘連續捲動無不可控記憶體成長。

實機 P95/P99 與輸入延遲屬於平台資格採集，不作為工程出口條件——這條界線是刻意的，
避免用無法重現的裝置資料阻塞工程進度，也避免用工程資料冒充裝置承諾。

在 [Playground 的捲動示範](/zh-Hant/playground#/scroll)裡可以看到即時幀指標。
