---
title: Typography
description: 標題、內文與引用的排版元件，渲染在 pingo canvas 上。
---

# Typography

一組排版元件：標題 `H1`–`H4`、內文 `P`，以及 `Lead`、`Large`、`Small`、`Muted`、
`Blockquote`、`InlineCode`。下方預覽由 pingo 引擎即時渲染，並跟隨站點主題切換明暗。

:::preview typography-scale
:::

## 用法

```tsx
import { H1, Lead, P } from "@dopejs/pingo-ui";

root.render(
  <View style={{ flexDirection: "column" }}>
    <H1>渲染引擎</H1>
    <Lead>在 canvas 上寫 TSX，不產生 DOM。</Lead>
    <P>內文段落。</P>
  </View>,
);
```

::: warning 它們不是包裹容器
shadcn 的 typography 是給真實 `h1`/`p` 加樣式，靠 CSS 級聯把字級傳給整棵子樹。
pingo 的文字度量**逐節點解析，沒有繼承**——把 `H1` 套在一段文字外面不會讓它變大。
每個元件都是一個文字節點，`children` 只接受字串。
:::

## 範例

### 標題與內文

`H1`–`H4` 對應 shadcn 的四級標題字級；`P` 是 16px/24px 的內文。上方預覽依序展示。

### 引用與行內程式碼

`Blockquote` 是一個帶左側規則線的盒子，`InlineCode` 是一個帶背景的行內片段——兩者都由
「盒子負責邊框與內距、文字子節點負責字級字重」兩層組成，原因見上方提示。

:::preview typography-blocks
:::

### 標題層級與視覺檔位分開

`H1` 預設對外回報為 level 1。當一頁因為大綱需要以 level 2 開始、但視覺上要用 `H1` 的
字級時，用 `level` 覆寫：

```tsx
<H1 level={2}>視覺是 H1，大綱是二級</H1>
```

## Props

### 標題（`H1` / `H2` / `H3` / `H4`）

| Prop        | 型別                         | 預設值       | 說明                   |
| ----------- | ---------------------------- | ------------ | ---------------------- |
| `children`  | `string`                     | —            | 標題文字（必填）       |
| `level`     | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | 元件自身檔位 | 覆寫對外回報的標題層級 |
| `className` | `string`                     | —            | 追加在元件類名之後     |

### 其餘元件

`P`、`Lead`、`Large`、`Small`、`Muted`、`Blockquote`、`InlineCode` 只接受
`children: string` 與 `className`。

| 元件         | 字級 / 行高 | 用途               |
| ------------ | ----------- | ------------------ |
| `P`          | 16 / 24     | 內文段落           |
| `Lead`       | 20 / 28     | 引導段，弱化色     |
| `Large`      | 18 / 28     | 強調一檔的內文     |
| `Small`      | 14 / 20     | 次要文字           |
| `Muted`      | 14 / 20     | 弱化說明文字       |
| `Blockquote` | 16 / 24     | 引用，帶左側規則線 |
| `InlineCode` | 14 / 20     | 行內程式碼，帶背景 |

## 無障礙

`H1`–`H4` 帶 `heading` 語意並匯出 `aria-level`。**沒有層級的 heading 會被大多數螢幕
閱讀器念成二級**，H1 與 H4 因此聽起來相同——所以層級是這組元件的一部分，而不是選配。

其餘元件是純文字，不帶角色：內文不應該讓螢幕閱讀器逐段停頓。需要它們承擔語意時，把它們
放進帶 `semanticRole` 的容器裡，而不是給段落本身加角色。
