---
title: Toggle Group
description: 二状態を切り替えるボタンのグループ。単一選択または複数選択に対応し、方向キーによるナビゲーションをサポート。pingo canvas 上に描画されます。
---

# Toggle Group

トグルボタングループは、複数の [Toggle](/components/toggle) を単一選択または複数選択の集合にまとめます。以下のプレビューは pingo エンジンによってリアルタイムに描画されます。クリックによる切り替え、方向キーによる項目間の移動が可能で、サイトのテーマに合わせて明暗が切り替わります。

:::preview toggle-group-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { ToggleGroup, ToggleGroupItem } from "@dopejs/pingo-ui";

root.render(
  createElement(ToggleGroup, {
    type: "single",
    defaultValue: ["center"],
    onValueChange: (value) => console.log(value),
    children: [
      createElement(ToggleGroupItem, { value: "left", children: "左揃え" }),
      createElement(ToggleGroupItem, { value: "center", children: "中央揃え" }),
      createElement(ToggleGroupItem, { value: "right", children: "右揃え" }),
    ],
  }),
);
```

`ToggleGroup` は context を通じて `ToggleGroupItem` に選択集合を配信します。どちらも `createElement` でコンポーネントとしてマウントする必要があります。`type: "single"` の場合、新しい選択によって前の選択は解除されます。`"multiple"` の場合は項目ごとに追加選択されます。

## 例

### 複数選択

`type="multiple"` は、テキスト書式ツールバーのように、複数の項目を同時に選択することを可能にします。

:::preview toggle-group-multiple
:::

## Props

### ToggleGroup

| Prop | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `type` | `"single" \| "multiple"` | `"single"` | 単一選択では前の選択を解除。複数選択では項目ごとに追加 |
| `value` | `readonly string[]` | — | 制御された選択値の集合 |
| `defaultValue` | `readonly string[]` | `[]` | 非制御の初期選択集合 |
| `onValueChange` | `(value: readonly string[]) => void` | — | 選択集合の変更時コールバック |
| `children` | `PingoNode` | — | `ToggleGroupItem` のリスト（必須） |
| `className` | `string` | — | コンポーネントのクラス名の後に追加 |

### ToggleGroupItem

| Prop | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 項目の値（必須） |
| `children` | `string` | — | 項目のテキスト（必須） |
| `disabled` | `boolean` | `false` | 単一項目を無効化 |
| `className` | `string` | — | コンポーネントのクラス名の後に追加 |

## アクセシビリティ

グループコンテナは `group` セマンティクスを持ち、各項目は Toggle の button セマンティクスと `on` / `off` のセマンティクス値を継承します。キーボード処理はグループに集約されます。`←`/`→` でフォーカスを隣接項目へ移動し、`Enter`/`スペース` で現在の項目を切り替えます。項目の追加・削除はこのナビゲーションに影響しません。
