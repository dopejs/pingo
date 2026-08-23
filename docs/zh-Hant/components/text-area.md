---
title: Text Area
description: 多行文字輸入框，由 pingo 編輯引擎驅動，渲染在 canvas 上。
---

# Text Area

多行文字輸入，用於備註、簡介等較長內容。下方預覽由 pingo 引擎即時渲染——點選後可以真正輸入多行文字，並跟隨網站主題切換明暗。

:::preview text-area-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { TextArea } from "@dopejs/pingo-ui";

root.render(
  createElement(TextArea, {
    semanticLabel: "个人简介",
    width: 360,
    rows: 4,
    onValueChange: (value) => console.log(value),
  }),
);
```

`rows` 決定可見行數並鎖定外殼最小高度（`rows × 行高 + 上下内边距`）。與 [Input](/components/input) 一樣，`TextArea` 必須用 `createElement` 以元件形式掛載。編輯細節見[文字編輯指南](/guide/editing)。

## 示例

### 禁用

傳入 `disabled` 後欄位不再接收輸入，並應用禁用樣式。

## Props

| Prop            | 型別                                     | 預設值  | 說明                                           |
| --------------- | ---------------------------------------- | ------- | ---------------------------------------------- |
| `value`         | `string`                                 | `""`    | 非受控用法的初始值；設定 `controller` 後被忽略 |
| `onValueChange` | `(value: string) => void`                | —       | 每次編輯事務應用後回調最新值                   |
| `controller`    | `TextEditingController`                  | —       | 高階逃生艙：呼叫方持有的持久控制器             |
| `onTransaction` | `(transaction: EditTransaction) => void` | —       | 每次編輯事務的原始回調                         |
| `onSubmit`      | `() => void`                             | —       | 提交回調                                       |
| `disabled`      | `boolean`                                | `false` | 禁用態                                         |
| `readOnly`      | `boolean`                                | `false` | 唯讀態                                         |
| `rows`          | `number`                                 | —       | 可見行數，決定外殼最小高度                     |
| `className`     | `string`                                 | —       | 追加在元件類名之後                             |
| `width`         | `number`                                 | —       | 固定寬度（px）                                 |
| `semanticLabel` | `string`                                 | —       | 無障礙名稱                                     |

## 無障礙

透過 `semanticLabel` 提供欄位名稱；`disabled` 與 `readOnly` 都會讓欄位退出編輯序列。與 Input 共享已知缺口：暫無佔位文字與聚焦環樣式。
