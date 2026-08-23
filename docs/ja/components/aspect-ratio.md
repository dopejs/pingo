---
title: Aspect Ratio
description: 固定のアスペクト比でコンテンツを制約するコンテナ。pingo canvas 上にレンダリング。
---

# Aspect Ratio

Aspect Ratio はコンテンツを固定のアスペクト比に保ちます。幅はレイアウトで決まり、高さは比率から自動計算
されます。下のプレビューは pingo エンジンによるリアルタイムレンダリングです。

:::preview aspect-ratio-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { AspectRatio } from "@dopejs/pingo-ui";

root.render(
  createElement(AspectRatio, {
    ratio: 16 / 9,
    children: coverImage,
  }),
);
```

コンポーネントの幅は親コンテナの 100% です。`ratio` は幅÷高さで、たとえば `16 / 9` はワイド画面を表します。

## Props

| Prop | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `ratio` | `number` | `1` | アスペクト比（幅 ÷ 高さ） |
| `children` | `PingoNode` | — | 制約されるコンテンツ（必須） |
| `className` | `string` | — | コンポーネントのクラス名に追加される |

## アクセシビリティ

Aspect Ratio は純粋なレイアウトコンテナで、追加のセマンティクスは持ち込みません。CSS サブセットには
`aspect-ratio` プロパティがないため、コンポーネントは実測した幅から高さを計算します。最初のフレームは
高さゼロでレンダリングされ、計測結果が届いてから高さが確定します。
