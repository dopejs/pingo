---
title: Hover Card
description: ホバー時に展開するリッチコンテンツカード。オープンとクローズの遅延付き。
---

# Hover Card

Hover Card はトリガーにホバー（またはフォーカス）したときにリッチコンテンツのカードを展開します。
Tooltip より多くの情報を載せられ、たとえばユーザープロフィールのプレビューに使えます。下のプレビューは
pingo エンジンによるリアルタイムレンダリング（制御された `open` で常時展開して表示）で、サイトのテーマに
合わせて明暗が切り替わります。

:::preview hover-card-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { HoverCard } from "@dopejs/pingo-ui";

root.render(
  createElement(HoverCard, {
    openDelayMs: 300,
    closeDelayMs: 200,
    children: createElement("text", { value: "@pingo" }),
    content: createElement("text", {
      value: "Canvas レンダリングエンジンと UI コンポーネントライブラリ。",
    }),
  }),
);
```

カードは開いた後、カード自身の上にホバーしていても閉じないため、`closeDelayMs` はポインタがトリガーと
カードの間の隙間を横切る時間を与えます。`open` を渡すと制御モードに切り替わり、`onOpenChange` と組み合わせて
状態を自分で管理できます。

## Props

| Prop           | 型                        | デフォルト | 説明                                   |
| -------------- | ------------------------- | ---------- | -------------------------------------- |
| `children`     | `PingoNode`               | —          | トリガー要素（必須）                   |
| `content`      | `PingoNode`               | —          | カードのコンテンツ（必須）             |
| `open`         | `boolean`                 | —          | 制御された開閉状態                     |
| `onOpenChange` | `(open: boolean) => void` | —          | 開閉変化時のコールバック               |
| `openDelayMs`  | `number`                  | `300`      | オープンの遅延（ミリ秒）               |
| `closeDelayMs` | `number`                  | `200`      | クローズの遅延（ミリ秒）               |
| `className`    | `string`                  | —          | アンカーコンテナのクラス名に追加される |

## アクセシビリティ

トリガーはフォーカス時にもカードを開き、フォーカスが外れると閉じます。キーボードユーザーがコンテンツを
見失うことはありません。
