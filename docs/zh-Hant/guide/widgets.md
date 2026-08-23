---
title: Widgets：無樣式引擎構件
description: "@dopejs/pingo-widgets 提供 TextField、TextArea、Pressable、Button 等無樣式引擎級構件，以及與 @dopejs/pingo-ui 的邊界。"
---

# Widgets：無樣式引擎構件

`@dopejs/pingo-widgets` 是引擎之上的第一層組合：它把
[可編輯原語](/guide/elements-editing)與焦點、原生事件裝配成可用構件，附帶**最小**
裝飾（邊框、錯誤態），不假設任何設計系統。業務不直接相依這個內部套件——全部匯出都經
`@dopejs/pingo` 再匯出。下方預覽即時渲染、可直接輸入。

:::preview widgets-textfield
:::

## 匯出與命名

| 匯出        | 說明                                                        |
| ----------- | ----------------------------------------------------------- |
| `TextField` | 單行輸入：邊框 + 錯誤態裝飾，內部只組合 `editableText` 原語 |
| `TextArea`  | 多行變體；Enter 換行，submit 留給宿主表單                   |
| `Pressable` | 可聚焦的觸發表面：View + 焦點 + 原生 click/tap              |
| `Button`    | `Pressable` + `Text` 的文字按鈕便捷組合                     |

命名注意：`@dopejs/pingo` 裡的 `TextArea` 指這個帶裝飾的 widget；多行**原語**以
`UnstyledTextArea` 匯出（`TextAreaProps` 同理有別名 `UnstyledTextAreaProps`）。

## TextField 與 TextArea

預設裝飾是 1px 邊框、8px 內邊距；傳入 `error` 字串時切換為錯誤色邊框，並在欄位下方
渲染一條 `alert` 角色的錯誤說明。受控契約（`value` + `revision` + `onTransaction`）與
[可編輯元素](/guide/elements-editing)完全相同——widget 不引入新的輸入路徑。

```tsx
import { createElement, TextField } from "@dopejs/pingo";

createElement(TextField, {
  value,
  revision,
  semanticLabel: "收件人",
  width: 320,
  error: value === "" ? "收件人不能为空" : undefined,
  onTransaction: (t) => apply(t),
});
```

### Props（TextField）

| Prop              | 型別                           | 預設值                   | 說明                                        |
| ----------------- | ------------------------------ | ------------------------ | ------------------------------------------- |
| `value`           | `string`                       | `""`                     | 受控文字                                    |
| `revision`        | `number \| bigint`             | `0n`                     | 受控值的權威 revision                       |
| `controller`      | `TextEditingController`        | —                        | 本地 controller；與 `value`/`revision` 互斥 |
| `readOnly`        | `boolean`                      | —                        | 唯讀                                        |
| `password`        | `boolean`                      | —                        | 密碼模式（明文不進 DisplayList 與無障礙值） |
| `maxGraphemes`    | `number`                       | —                        | grapheme 上限                               |
| `inputMode`       | `EditableInputMode`            | —                        | 軟鍵盤版面提示                              |
| `width`           | `number`                       | `240`                    | 含邊框的整體寬度                            |
| `height`          | `number`                       | `lineHeight × rows + 16` | 含邊框的整體高度                            |
| `fontSize`        | `number`                       | `14`                     | 字號                                        |
| `lineHeight`      | `number`                       | `round(fontSize × 1.5)`  | 行高                                        |
| `color`           | `Color`                        | `#1f2329ff`              | 文字顏色                                    |
| `backgroundColor` | `Color`                        | `#ffffffff`              | 欄位底色                                    |
| `borderColor`     | `Color`                        | `#c0c4ccff`              | 邊框顏色                                    |
| `errorColor`      | `Color`                        | `#d03050ff`              | 錯誤態邊框與說明顏色                        |
| `error`           | `string`                       | —                        | 非空即錯誤態：錯誤色邊框 + 下方錯誤說明     |
| `onTransaction`   | `(t: EditTransaction) => void` | —                        | Core 編輯事務回調                           |
| `onSubmit`        | `() => void`                   | —                        | 單行 Enter 提交                             |
| `semanticLabel`   | `string`                       | —                        | 無障礙名稱（角色恆為 `textbox`）            |

`TextArea` 在此基礎上多一個 `rows`（預設 `3`），用於計算預設高度。

## Pressable 與 Button

`Pressable` 不引入新的 Scene 節點種類：它就是一個帶 `button` 語義、按下時自動取焦點、
把原生 click/tap 對映成 `onPress` 的 `View`。樣式完全由 `style` 與 `children` 決定，
`disabled` 時降透明度並摘除事件。

| Prop               | 型別         | 預設值                 | 說明                                       |
| ------------------ | ------------ | ---------------------- | ------------------------------------------ |
| `children`         | `PingoNode`  | —                      | 內容（Button 為 `string \| number`，必填） |
| `disabled`         | `boolean`    | `false`                | 禁用態                                     |
| `onPress`          | `() => void` | —                      | 觸發回調                                   |
| `className`        | `string`     | —                      | 類名（接樣式表）                           |
| `style`            | `PingoStyle` | —                      | 內聯樣式                                   |
| `width` / `height` | `number`     | —                      | 尺寸                                       |
| `semanticLabel`    | `string`     | `Button` 取 `children` | 無障礙名稱                                 |

`Button` 額外接受 `color` 與 `fontSize`（傳給內部文字）。

## 與 @dopejs/pingo-ui 的邊界

兩層回答不同的問題：

- **widgets** —— 行為正確性：編輯事務、焦點、語義角色、最小裝飾。不含任何設計意見，
  顏色字號全部可覆寫。
- **@dopejs/pingo-ui** —— 設計系統：shadcn 心智的完整元件（變體、尺寸、主題、樣式表），
  內部組合 widgets、`@dopejs/pingo-editing` 與執行時 hooks，對引擎零改動。

選型建議：要現成的設計系統，直接用 [pingo-ui 元件](/components)；自帶設計語言但不想
碰編輯事務細節，用 widgets 做地基；完全自訂（如遊戲 HUD），直接用
[基礎元素](/guide/elements)原語。

## 無障礙

`TextField` / `TextArea` 自帶 `textbox` 角色，`error` 說明為 `alert` 角色；
`Pressable` / `Button` 為 `button` 角色，`disabled` 透過 `semanticValue` 暴露。
名稱都靠 `semanticLabel`——沒有可見 label 時不要省略。詳見[無障礙](/guide/accessibility)。
