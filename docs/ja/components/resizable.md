---
title: Resizable
description: ドラッグ可能なハンドルで比率を調整する2ペイン構成のレイアウトで、pingo キャンバス上に描画されます。
---

# Resizable

Resizable はコンテナを2つのパネルに分割し、中央のドラッグハンドルで比率を調整できます。キーボードによる微調整にも対応しています。下のプレビューは pingo エンジンによってリアルタイムに描画されます。ハンドルをドラッグしてお試しください。

:::preview resizable-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { Resizable } from "@dopejs/pingo-ui";

root.render(
  createElement(Resizable, {
    defaultSplit: 0.4,
    first: sidebar,
    second: content,
  }),
);
```

コンポーネント自身の幅と高さは親コンテナの 100% となり、サイズが確定した親コンテナが必要です。非制御コンポーネント（`defaultSplit`）と制御コンポーネント（`split` + `onSplitChange`）の両方の使い方に対応しています。

## 例

### 垂直方向

`direction: "column"` を渡すと上下分割に切り替わり、ハンドルは横向きになります。

:::preview resizable-vertical
:::

## Props

| Prop | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `first` | `PingoNode` | — | 1つ目のパネルの内容（必須） |
| `second` | `PingoNode` | — | 2つ目のパネルの内容（必須） |
| `split` | `number` | — | 制御：1つ目のパネルの割合。`[0, 1]` |
| `defaultSplit` | `number` | `0.5` | 非制御：初期の割合 |
| `onSplitChange` | `(split: number) => void` | — | 割合変更時のコールバック |
| `direction` | `"row" \| "column"` | `"row"` | 分割の方向 |
| `minSplit` | `number` | `0.1` | 最小の割合（下限のクランプ） |
| `maxSplit` | `number` | `0.9` | 最大の割合（上限のクランプ） |
| `disabled` | `boolean` | `false` | ハンドル操作を無効化 |
| `className` | `string` | — | コンポーネントのクラス名の後に追加 |

## アクセシビリティ

ハンドルは separator のセマンティクスを持ち、現在の割合（パーセント）を支援技術に公開します。ハンドルにフォーカスすると、方向キーで 2% 刻みの微調整が可能です。水平レイアウトでは左右キー、垂直レイアウトでは上下キーを使用します。
