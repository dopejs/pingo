---
title: 可編輯元素：Input 與 TextArea
description: 引擎原生可編輯文字原語——受控 revision 事務契約、EditContext 輸入橋、密碼與唯讀。
---

# 可編輯元素：Input 與 TextArea

`Input` 與 `TextArea`（在 `@dopejs/pingo` 中以 `UnstyledTextArea` 匯出，見下）是引擎原生
的可編輯文字原語：caret、選區、IME composition、剪貼簿與撤銷重做都由 Core 實作，
**不需要在 canvas 上蓋任何 HTML 輸入控制項**。下方預覽是真實可輸入的——點選聚焦，試試
中文輸入法、拖選與 Ctrl+Z。

:::preview elements-input
:::

## 用法

受控寫法：`value` + 單調遞增的 `revision`，在 `onTransaction` 裡確認 Core 發來的事務：

```tsx
import { createElement, Input, type EditTransaction } from "@dopejs/pingo";

let value = "订单备注";
let revision = 1n;

function applyDelta(current: string, transaction: EditTransaction): string {
  const delta = transaction.delta;
  return delta === undefined
    ? current
    : current.slice(0, delta.range.start) + delta.text + current.slice(delta.range.end);
}

createElement(Input, {
  value,
  revision,
  semanticLabel: "订单备注",
  onTransaction: (transaction) => {
    value = applyDelta(value, transaction);
    revision = transaction.revision;
  },
});
```

純本地狀態也可以不傳 `value` / `revision`，改用 `TextEditingController`
（hooks 場景用 `useTextEditingController`）；`controller` 與 `value`/`revision` 互斥。

## revision 事務契約

狀態所有權是明確的：**Shell 擁有業務資料，Core 擁有活動編輯會話的瞬時狀態。**

1. 輸入到達 Core，校驗 `base_revision` 匹配當前會話；
2. 透過後**立即應用並重繪**——每次按鍵不需要走一遍完整的渲染管線；
3. Core 反向發出版本化的 `EditTransaction`；
4. Shell 確認（更新自己的 `value` / `revision`），或在業務校驗失敗時傳送帶新
   `revision` 的校正值。過期 revision 永遠不會覆蓋更新的 Core 輸入；相同 revision 的
   確認不清空撤銷棧。

`EditTransaction` 的欄位：

| 欄位 | 型別 | 說明 |
| --- | --- | --- |
| `nodeId` | `number` | 產生事務的編輯節點 |
| `baseRevision` | `bigint` | 事務基於的 revision |
| `revision` | `bigint` | 事務後的新 revision |
| `delta` | `{ range: { start, end }, text }` | 文字差異；偏移為 UTF-16，對齊 EditContext/InputEvent。純選區事務無此欄位 |
| `selection` | `{ anchor, focus, anchorAffinity, focusAffinity }` | 事務後的選區 |
| `composition` | `{ start, end }` | 進行中的 IME 組合區間 |
| `kind` | `"edit" \| "composition" \| "external" \| "undo" \| "redo"` | 事務類別 |

## 輸入橋：EditContext 與降級代理

主執行緒按優先順序連線作業系統的文字輸入服務：

1. **EditContext** —— 繫結 canvas，接收文字/選區/composition，並向輸入法回報 control、
   selection 與字元邊界，候選窗因此能貼在 caret 旁。
2. **引擎託管的輸入代理** —— EditContext 不可用時，宿主維護**一個**全域隱藏的
   `textarea` 統一處理 `beforeinput`、composition、軟鍵盤與剪貼簿。

這是平臺降級實作，不是 EmbedDOM 元件模型：Scene 裡不存在與每個編輯節點一一對應的
DOM。兩條路徑過同一套編輯行為契約測試。

## 多行：TextArea 原語

`TextArea` 原語與 `Input` 共享同一個 `editableText` 子系統，唯一差別是 `multiline`
不變數由元件固定。Enter 插入換行而不觸發 `onSubmit`；上下方向鍵跨行移動時保持期望列
（desired-x）。

:::preview elements-textarea
:::

## Props（Input / UnstyledTextArea）

二者共享 `EditableTextProps`（`multiline` 不對外，由元件固定）：

| Prop | 型別 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 受控文字 |
| `revision` | `number \| bigint` | — | 受控值的權威 revision；過期值不會覆蓋更新的 Core 輸入 |
| `controller` | `TextEditingController` | — | 穩定的本地 controller；與 `value`/`revision` 互斥 |
| `readOnly` | `boolean` | `false` | 唯讀 |
| `password` | `boolean` | `false` | 密碼模式（見下） |
| `maxGraphemes` | `number` | — | grapheme 上限 |
| `inputMode` | `EditableInputMode` | `"text"` | 軟鍵盤提示：`decimal` `email` `none` `numeric` `search` `tel` `text` `url` |
| `onTransaction` | `(t: EditTransaction) => void` | — | Core 編輯事務回調 |
| `onSubmit` | `() => void` | — | 單行 Enter 提交；多行的 Enter 留給換行 |

文字外觀繼承 `TextProps`：`color`、`fontSize`、`fontWeight`、`lineHeight`、`fontFamily`、
`font`；尺寸、`padding`、`backgroundColor`、邊框（`style` 通道）等來自
[CommonProps](/api)。

## 無障礙與隱私

- 編輯節點自帶 `textbox` 語義；用 `semanticLabel` 提供名稱（沒有可見 label 時尤其重要）。
- 密碼內容只在 Core 內以遮罩字形繪製：明文不進入 DisplayList、錄製回放、devtools 或
  無障礙值，密碼目標也不寫剪貼簿。

更深入的設計（文字位置模型、bidi 邊界、契約測試矩陣）見[文字與編輯](/guide/editing)。
