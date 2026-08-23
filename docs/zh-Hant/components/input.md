---
title: Input
description: 單行文字輸入框，由 pingo 編輯引擎驅動，渲染在 canvas 上。
---

# Input

單行文字輸入。下方預覽由 pingo 引擎即時渲染——點選後可以真正輸入、選中、刪除，並跟隨網站主題切換明暗。

:::preview input-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Input } from "@dopejs/pingo-ui";

root.render(
  createElement(Input, {
    semanticLabel: "邮箱",
    width: 320,
    onValueChange: (value) => console.log(value),
  }),
);
```

`Input` 內部透過 hooks 維護一個穩定的 `TextEditingController`，因此必須用 `createElement(Input, props)` 以元件形式掛載，不能直接當函式呼叫。編輯細節見[文字編輯指南](/guide/editing)。

## 示例

### 前後綴與密碼

`prefix`/`suffix` 插槽可以放圖示或單位；`password` 開啟掩碼輸入；`disabled` 鎖定整個欄位。

:::preview input-adornments
:::

### 受控用法

傳入自己的 `controller` 即進入受控模式，此時 `value` 只作為初始值被忽略，由呼叫方持有控制器並跨渲染保持同一實例。

## Props

| Prop | 型別 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `value` | `string` | `""` | 非受控用法的初始值；設定 `controller` 後被忽略 |
| `onValueChange` | `(value: string) => void` | — | 每次編輯事務應用後回調最新值 |
| `controller` | `TextEditingController` | — | 高階逃生艙：呼叫方持有的持久控制器 |
| `onTransaction` | `(transaction: EditTransaction) => void` | — | 每次編輯事務的原始回調 |
| `onSubmit` | `() => void` | — | 提交（回車）回調 |
| `disabled` | `boolean` | `false` | 禁用態 |
| `readOnly` | `boolean` | `false` | 唯讀態 |
| `password` | `boolean` | `false` | 掩碼輸入 |
| `inputMode` | `"decimal" \| "email" \| "none" \| "numeric" \| "search" \| "tel" \| "text" \| "url"` | `"text"` | 軟鍵盤版面提示 |
| `className` | `string` | — | 追加在元件類名之後 |
| `width` | `number` | — | 固定寬度（px） |
| `semanticLabel` | `string` | — | 無障礙名稱 |
| `prefix` | `PingoNode` | — | 前置裝飾，如圖示或貨幣符號 |
| `suffix` | `PingoNode` | — | 後置裝飾，如單位或清除按鈕 |

## 無障礙

透過 `semanticLabel` 提供欄位名稱；`disabled` 與 `readOnly` 都會讓欄位退出編輯序列。當前已知缺口：暫無佔位文字（placeholder）與聚焦環樣式。
