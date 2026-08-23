---
title: Command
description: 検索フィルタ付きコマンドパレット。キーボード選択と Enter 確定をサポート。
---

# Command

Command は検索ボックス付きのコマンドパレットです。入力で項目を即時フィルタリングし、矢印キーでカーソルを
移動し、Enter で確定します。下のプレビューは pingo エンジンによるリアルタイムレンダリングです。検索
ボックスに直接入力するとフィルタリングでき、サイトのテーマに合わせて明暗が切り替わります。

:::preview command-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { Command } from "@dopejs/pingo-ui";

root.render(
  createElement(Command, {
    items: [
      { value: "open", label: "ファイルを開く" },
      { value: "save", label: "ファイルを保存" },
    ],
    onSelect: (value) => run(value),
    onDismiss: () => closePalette(),
  }),
);
```

フィルタリングは大文字小文字を区別しないラベルの部分文字列マッチで、あえてファジーマッチにはしていません。
ソート戦略はプロダクトの判断であり、コンポーネントが呼び出し側の代わりに決めることはしません。
`onDismiss` はナビゲーションキーにマッチしなかった `Escape` に反応するため、パネルを Dialog で包んで
「⌘K」体験を作るのに適しています。

## Props

| Prop | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `items` | `readonly CommandItem[]` | — | コマンド項目（必須） |
| `onSelect` | `(value: string) => void` | — | 項目選択時のコールバック（クリックまたは Enter） |
| `onDismiss` | `() => void` | — | `Escape` のコールバック |
| `placeholder` | `string` | `"検索"` | 検索ボックスのアクセシブル名 |
| `emptyLabel` | `string` | `"結果なし"` | フィルタ結果が空のときのヒントテキスト |
| `className` | `string` | — | 追加するクラス名 |

### CommandItem

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `value` | `string` | 項目の値（必須） |
| `label` | `string` | 表示およびマッチング用のテキスト（必須） |

## アクセシビリティ

コンテナは search セマンティクスを、項目は option セマンティクスを持ち、selected 状態を公開します。
上下の矢印キーでカーソルを移動し、`Enter` で確定、`Escape` で `onDismiss` が発火します。
