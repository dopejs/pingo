---
title: Divider
description: 水平または垂直の視覚的な区切り線。pingo canvas 上にレンダリング。
---

# Divider

区切り線はコンテンツ間に視覚的なグループ分けを提供します。下のプレビューは pingo エンジンによる
リアルタイムレンダリングで、サイトのテーマに合わせて明暗が切り替わります。

:::preview divider-horizontal
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { Divider } from "@dopejs/pingo-ui";

root.render(createElement(Divider, {}));
```

## 例

### 垂直の区切り線

`orientation: "vertical"` を渡すと垂直の区切り線になります。垂直の区切り線の高さは親コンテナの 100% に
なるため、親コンテナには確定した高さが必要です。

:::preview divider-vertical
:::

## Props

| Prop          | 型                           | デフォルト     | 説明                                 |
| ------------- | ---------------------------- | -------------- | ------------------------------------ |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | 区切り線の向き                       |
| `className`   | `string`                     | —              | コンポーネントのクラス名に追加される |

水平の区切り線は幅が親コンテナの 100%、高さ 1px です。垂直の区切り線は高さが親コンテナの 100%、
幅 1px です。

## アクセシビリティ

Divider は純粋な視覚要素で、セマンティックロールを持たないため支援技術からは無視されます。コンテンツの
グループ分けは見出しなどのセマンティック構造で表現してください。
