---
title: TSX
description: 用 TSX 寫 pingo 元件，以及在同一個儲存庫裡與 React 共存。
---

# 用 TSX 寫 pingo

## 設定

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@dopejs/pingo"
  }
}
```

`jsx` 用的是 TypeScript 的自動執行階段；`jsxImportSource` 把它指向 pingo 的
`jsx-runtime`，而不是 React 的。名稱裡的 `react-jsx` 只是轉換模式的名字，與 React 無關。

## 什麼可以當標籤

```tsx
import { createContext, memo, Text, useState, View, type PingoNode } from "@dopejs/pingo";
import { Button } from "@dopejs/pingo-ui";

const Theme = createContext("light");

function Row({ label }: { readonly label: string }): PingoNode {
  const [count, setCount] = useState(0);
  return (
    <View width={240} padding={8}>
      <text value={`${label} ${count}`} />
      <Button onPress={() => setCount(count + 1)}>加一</Button>
    </View>
  );
}

root.render(
  <Theme.Provider value="dark">
    <Row label="點擊次數" />
  </Theme.Provider>,
);
```

五種形式都可以：

| 形式              | 例子                                                  |
| ----------------- | ----------------------------------------------------- |
| 內建元素          | `<container>`、`<text>`、`<scroll>`、`<editableText>` |
| 基礎元件          | `<View>`、`<Text>`、`<Image>`、`<Input>`              |
| 自己寫的函式元件  | `<Row label="…" />`                                   |
| `memo` 包裝的元件 | `@dopejs/pingo-ui` 的全部元件                         |
| context provider  | `<Theme.Provider value={…}>`                          |

::: warning 用 hooks 的元件必須掛載，不能直接呼叫
`Row({ label })` 能通過型別檢查，但會以
`hooks may only run in a function component` 失敗——hooks 需要 reconciler 建立的
元件作用域。寫成 `<Row label="…" />` 就對了。
:::

回傳型別標 `PingoNode` 是可以的。它包含 `undefined`，`PingoNode` 與 JSX 標籤的相容性
由引擎的 `JSX.ElementType` 宣告，不需要你改寫簽章。

## 與 React 共存

一個儲存庫裡同時有 React 和 pingo 的 TSX 檔案是常見情況——例如用 React 寫外殼、用
pingo 畫高效能區域。

### 機制是檔案標頭宣告

`jsxImportSource` 的粒度是**檔案**。把 pingo 檔案的第一行寫成：

```tsx
/** @jsxImportSource @dopejs/pingo */
```

專案的 `tsconfig.json` 保持 React 設定，加了這行的檔案走 pingo 執行階段。`tsc`、
esbuild/Vite、babel 都認這一條。

**其它兩種想法都不成立**，實測：

| 做法                                                  | 結果                                                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| 目錄裡放一個改了 `jsxImportSource` 的 `tsconfig.json` | `tsc` 完全忽略它，而 Vite 會認——建置與型別檢查結論不一致                     |
| 用 `exclude` 按檔名排除                               | `exclude` 只影響根檔案選擇；React 檔案一 `import`，它就被拉回來按 React 編譯 |

要讓檔名真正驅動工具鏈，需要 composite project references（pingo 專案產出 `.d.ts`，
React 專案消費宣告而不是原始碼）。

忘了寫這一行不會靜默出錯，而是編譯期報錯：

```
error TS2322: Type 'Element' is not assignable to type 'PingoNode'.
error TS2786: 'View' cannot be used as a JSX component.
```

### 檔名後綴是約定

兩種檔案放在同一個目錄時，建議給 pingo 檔案加後綴，例如 `scene.pingo.tsx`——檔案列表
裡一眼能分辨，也方便 babel `overrides` 之類按檔名做設定。它是給人和設定看的約定，
**不能取代檔案標頭宣告**。整個目錄都是 pingo 的時候，目錄本身就是訊號，再加後綴只是雜訊。

### 邊界就是檔案邊界

一個檔案只能有一種 JSX，所以 **React 元件裡寫不了 pingo 標籤**。pingo 檔案匯出場景，
React 檔案引入它：

```tsx
/** @jsxImportSource @dopejs/pingo */
// scene.pingo.tsx
import { Text, View, type PingoNode } from "@dopejs/pingo";

export function scene(label: string): PingoNode {
  return (
    <View width={240} height={80} padding={12}>
      <Text value={label} />
    </View>
  );
}
```

### 用 `PingoContainer` 掛載

```tsx
// App.tsx —— 這個檔案的標籤是 React 的
import { PingoContainer } from "@dopejs/pingo/react";

import { scene } from "./scene.pingo";

export function App() {
  return <PingoContainer scene={scene("Hello")} style={{ height: 320, width: 480 }} />;
}
```

場景透過 `scene` 屬性而不是 children 傳入——這個檔案的標籤屬於 React，寫不出 pingo 的
children。

`PingoContainer` 自己建立 canvas，而不是讓 React 渲染 canvas 再取 ref。這一條是**必須**
的：root 會把 canvas 轉移給 OffscreenCanvas，轉移是永久的，而 React StrictMode 在開發
環境把 effect 跑兩遍——React 擁有的那個 canvas 會被交給第二個 root，然後失敗：

```
this canvas already transferred control to an OffscreenCanvas and cannot host
a second root; create a new canvas element per root
```

元件內部建立的 canvas 會隨被丟棄的那次掛載一起丟掉，所以不會遇到這件事。尺寸也不用管：
root 會跟隨 canvas 自己的盒子，用 CSS 給容器尺寸就夠了。

需要拿到 root（捲動控制、診斷回呼）時用 `onRoot`；啟動失敗用 `onStartupError`，執行期
錯誤仍然走 `options.onHostError`。

### 兩棵樹不共享狀態

React 的 state 與 context 不會流進 pingo 元件樹，反過來也一樣。它們是兩個獨立的
reconciler。跨邊界通訊就是普通的資料流：React 側算好值，作為 `scene` 傳進去；pingo 側
透過事件回呼把結果送回來。

## 本儲存庫就是例子

`apps/site` 是一個 React 應用，同時包含 73 個 pingo TSX 元件預覽。混放的目錄是
[`apps/site/src/interop`](https://github.com/dopejs/pingo/tree/main/apps/site/src/interop)，
它的測試在 `StrictMode` 下執行。
