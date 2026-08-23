---
title: Select
description: 組み合わせ式ドロップダウンセレクター。キーボードナビゲーションに対応し、pingo canvas 上に描画されます。
---

# Select

ドロップダウンセレクターは `Select`、`SelectTrigger`、`SelectContent`、`SelectItem` を組み合わせて構成します。以下のプレビューは pingo エンジンによってリアルタイム描画されています。リストは展開済みで、方向キーでナビゲーション、Enter で選択でき、サイトのテーマに追従して明暗が切り替わります。

:::preview select-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@dopejs/pingo-ui";

root.render(
  createElement(Select, {
    value: "pingo-ui",
    onValueChange: (value) => console.log(value),
    children: [
      createElement(SelectTrigger, { placeholder: "选择一个包" }),
      createElement(SelectContent, {
        children: [
          createElement(SelectItem, { value: "pingo", children: "@dopejs/pingo" }),
          createElement(SelectItem, { value: "pingo-ui", children: "@dopejs/pingo-ui" }),
        ],
      }),
    ],
  }),
);
```

すべてのパーツは context を通じて連携し、必ず `createElement` でコンポーネントとしてマウントする必要があります。トリガーは現在選択中の `value` を表示し、未選択の場合は `placeholder` を表示します。

## 例

### デフォルトで展開

`defaultOpen` を指定するとリストが初期状態で展開されます（上記プレビュー参照）。`onOpenChange` で開閉を監視できます。

## Props

### Select

| Prop            | 型                        | デフォルト値 | 説明                                               |
| --------------- | ------------------------- | ------------ | -------------------------------------------------- |
| `value`         | `string`                  | —            | 選択値。トリガーに表示されます                     |
| `defaultOpen`   | `boolean`                 | `false`      | 初期状態で展開するかどうか                         |
| `onValueChange` | `(value: string) => void` | —            | 選択変更時のコールバック（選択後に自動で閉じます） |
| `onOpenChange`  | `(open: boolean) => void` | —            | 開閉時のコールバック                               |
| `children`      | `PingoNode`               | —            | トリガーとコンテンツ（必須）                       |
| `className`     | `string`                  | —            | コンポーネントのクラス名の後に追加                 |

### SelectTrigger

| Prop          | 型          | デフォルト値 | 説明                                                                           |
| ------------- | ----------- | ------------ | ------------------------------------------------------------------------------ |
| `children`    | `PingoNode` | —            | カスタムトリガーコンテンツ。省略時は選択値またはプレースホルダーテキストを描画 |
| `placeholder` | `string`    | —            | 未選択時のプレースホルダーテキスト                                             |
| `className`   | `string`    | —            | コンポーネントのクラス名の後に追加                                             |

### SelectContent

| Prop        | 型          | デフォルト値 | 説明                               |
| ----------- | ----------- | ------------ | ---------------------------------- |
| `children`  | `PingoNode` | —            | `SelectItem` のリスト（必須）      |
| `className` | `string`    | —            | コンポーネントのクラス名の後に追加 |

### SelectItem

| Prop        | 型       | デフォルト値 | 説明                               |
| ----------- | -------- | ------------ | ---------------------------------- |
| `value`     | `string` | —            | オプションの値（必須）             |
| `children`  | `string` | —            | オプションのテキスト（必須）       |
| `className` | `string` | —            | コンポーネントのクラス名の後に追加 |

## アクセシビリティ

トリガーは button セマンティクスを持ち、`expanded` と `collapsed` の間で切り替わります。コンテンツは menu セマンティクスを持ちます。方向キーでハイライトを移動し、`Enter`/`スペース` で選択、`Esc` で閉じます。選択後はフォーカスがトリガーに戻ります。
