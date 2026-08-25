---
title: コンポーネント
description: shadcn 流のメンタルモデルを持つ pingo ネイティブ UI コンポーネントライブラリ。すべて canvas 上にリアルタイムレンダリング。
---

# コンポーネント

`@dopejs/pingo-ui` は shadcn/ui に揃えたコンポーネントライブラリです。API とスキンのセマンティクスは
そのままに、レンダリング先が DOM ではなく pingo canvas エンジンになっています。下の各コンポーネント
ページには**リアルタイムレンダリング**のプレビューが含まれています。プレビュー自体がエンジンが描画する
canvas で、インタラクティブに操作でき、テーマ切り替えにも追従します。

## 使い方

```ts
import { createHostedCanvasRoot } from "@dopejs/pingo";
import { Button, createPingoUiStyleSheet } from "@dopejs/pingo-ui";

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [createPingoUiStyleSheet()],
});
root.render(createElement(Button, { children: "保存" }));
```

ユーザー独自のスタイルシートは pingo-ui のスタイルシートの**後**に登録してください。同じ優先度の
ルールは登録順に上書きされます。テーマやブランドのカスタマイズについては[スタイリングガイド](/ja/guide/styling)と
[SCSS と Less](/ja/guide/scss-less)を参照してください。

左の目次からコンポーネントを選んで始めてください。
