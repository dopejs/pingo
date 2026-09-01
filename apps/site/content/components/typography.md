---
title: Typography
description: 标题、正文与引用的排版组件，渲染在 pingo canvas 上。
---

# Typography

一组排版组件：标题 `H1`–`H4`、正文 `P`，以及 `Lead`、`Large`、`Small`、`Muted`、
`Blockquote`、`InlineCode`。下方预览由 pingo 引擎实时渲染，并跟随站点主题切换明暗。

:::preview typography-scale
:::

## 用法

```tsx
import { H1, Lead, P } from "@dopejs/pingo-ui";

root.render(
  <View style={{ flexDirection: "column" }}>
    <H1>渲染引擎</H1>
    <Lead>在 canvas 上写 TSX，不生成 DOM。</Lead>
    <P>正文段落。</P>
  </View>,
);
```

::: warning 它们不是包裹容器
shadcn 的 typography 是给真实 `h1`/`p` 加样式，靠 CSS 级联把字号传给整棵子树。
pingo 的文本度量**逐节点解析，没有继承**——把 `H1` 套在一段文字外面不会让它变大。
每个组件都是一个文本节点，`children` 只接受字符串。
:::

## 示例

### 标题与正文

`H1`–`H4` 对应 shadcn 的四级标题字号；`P` 是 16px/24px 的正文。上方预览按顺序展示。

### 引用与行内代码

`Blockquote` 是一个带左侧规则线的盒子，`InlineCode` 是一个带背景的行内片段——两者都由
「盒子负责边框与内边距、文本子节点负责字号字重」两层组成，原因见上方提示。

:::preview typography-blocks
:::

### 标题层级与视觉档位分开

`H1` 默认对外报告为 level 1。当一页因为大纲需要以 level 2 开始、但视觉上要用 `H1` 的
字号时，用 `level` 覆盖：

```tsx
<H1 level={2}>视觉是 H1，大纲是二级</H1>
```

## Props

### 标题（`H1` / `H2` / `H3` / `H4`）

| Prop        | 类型                         | 默认值       | 说明                   |
| ----------- | ---------------------------- | ------------ | ---------------------- |
| `children`  | `string`                     | —            | 标题文本（必填）       |
| `level`     | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | 组件自身档位 | 覆盖对外报告的标题层级 |
| `className` | `string`                     | —            | 追加在组件类名之后     |

### 其余组件

`P`、`Lead`、`Large`、`Small`、`Muted`、`Blockquote`、`InlineCode` 只接受
`children: string` 与 `className`。

| 组件         | 字号 / 行高 | 用途                 |
| ------------ | ----------- | -------------------- |
| `P`          | 16 / 24     | 正文段落             |
| `Lead`       | 20 / 28     | 引导段，弱化色       |
| `Large`      | 18 / 28     | 强调一档的正文       |
| `Small`      | 14 / 20     | 次要文本             |
| `Muted`      | 14 / 20     | 弱化说明文本         |
| `Blockquote` | 16 / 24     | 引用，带左侧规则线   |
| `InlineCode` | 14 / 20     | 行内代码片段，带背景 |

## 无障碍

`H1`–`H4` 带 `heading` 语义并导出 `aria-level`。**没有层级的 heading 会被大多数读屏
软件念成二级**，H1 与 H4 因此听起来相同——所以层级是这组组件的一部分，而不是可选项。

其余组件是纯文本，不带角色：正文不应该让读屏软件逐段停顿。需要它们承担语义时，把它们
放进带 `semanticRole` 的容器里，而不是给段落本身加角色。
