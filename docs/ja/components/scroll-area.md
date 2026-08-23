---
title: Scroll Area
description: pingo canvas 上に描画される、描画式スクロールバー付きのスクロールコンテナ。
---

# Scroll Area

Scroll Area は、固定サイズのビューポート内で長すぎるコンテンツをスクロールし、テーマと一致するスクロールバーを描画します。下のプレビューは pingo エンジンによってリアルタイムに描画されます——リスト上でスクロールしてみてください。

:::preview scroll-area-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { ScrollArea } from "@dopejs/pingo-ui";

root.render(
  createElement(ScrollArea, {
    children: items.map((item) => createElement("text", { value: item })),
  }),
);
```

コンポーネント自身の幅と高さは親コンテナの 100% となり、サイズが確定している親コンテナが必要です。コンテンツがビューポートを超えた場合のみスクロールバーが表示されます。

## Props

| Prop | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | スクロールするコンテンツ（必須） |
| `hideScrollbar` | `boolean` | `false` | 描画されるスクロールバーを非表示にする（スクロール機能は変わらない） |
| `className` | `string` | — | コンポーネントのクラス名の後に追加する |

## アクセシビリティ

スクロール動作はエンジン Core によって提供され、ビューポートはフォーカス可能かつキーボードによるスクロールが可能な状態を維持します。スクロールバーはビューポートとコンテンツの実測ジオメトリから導出され、素早くドラッグした場合、スクロールバーのつまみが 1 フレーム遅れることがあります。

スクロール関連のエンジン動作については[スクロールガイド](/guide/scrolling)を参照してください。
