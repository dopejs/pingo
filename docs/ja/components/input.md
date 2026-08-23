---
title: Input
description: 単一行テキスト入力ボックス。pingo 編集エンジンで駆動され canvas 上にレンダリング。
---

# Input

単一行のテキスト入力です。下のプレビューは pingo エンジンによるリアルタイムレンダリングです。クリックすると
実際に入力・選択・削除ができ、サイトのテーマに合わせて明暗が切り替わります。

:::preview input-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { Input } from "@dopejs/pingo-ui";

root.render(
  createElement(Input, {
    semanticLabel: "メールアドレス",
    width: 320,
    onValueChange: (value) => console.log(value),
  }),
);
```

`Input` は内部で hooks を使って安定した `TextEditingController` を保持するため、必ず
`createElement(Input, props)` でコンポーネントとしてマウントする必要があり、直接関数として呼び出すことは
できません。編集の詳細は[テキスト編集ガイド](/ja/guide/editing)を参照してください。

## 例

### プレフィックス/サフィックスとパスワード

`prefix`/`suffix` スロットにはアイコンや単位を配置できます。`password` はマスク入力を有効にし、
`disabled` はフィールド全体をロックします。

:::preview input-adornments
:::

### 制御された使い方

独自の `controller` を渡すと制御モードになります。この場合 `value` は無視され、呼び出し側がコントローラーを
保持し、レンダリングをまたいで同じインスタンスを維持します。

## Props

| Prop | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `value` | `string` | `""` | 非制御の使い方での初期値。`controller` 設定後は無視される |
| `onValueChange` | `(value: string) => void` | — | 編集トランザクションが適用されるたびに最新の値で呼ばれる |
| `controller` | `TextEditingController` | — | 高度なエスケープハッチ：呼び出し側が保持する永続コントローラー |
| `onTransaction` | `(transaction: EditTransaction) => void` | — | 各編集トランザクションの生コールバック |
| `onSubmit` | `() => void` | — | 送信（Enter）時のコールバック |
| `disabled` | `boolean` | `false` | 無効状態 |
| `readOnly` | `boolean` | `false` | 読み取り専用状態 |
| `password` | `boolean` | `false` | マスク入力 |
| `inputMode` | `"decimal" \| "email" \| "none" \| "numeric" \| "search" \| "tel" \| "text" \| "url"` | `"text"` | ソフトキーボードレイアウトのヒント |
| `className` | `string` | — | コンポーネントのクラス名に追加される |
| `width` | `number` | — | 固定幅（px） |
| `semanticLabel` | `string` | — | アクセシブル名 |
| `prefix` | `PingoNode` | — | 前置の装飾。アイコンや通貨記号など |
| `suffix` | `PingoNode` | — | 後置の装飾。単位やクリアボタンなど |

## アクセシビリティ

`semanticLabel` でフィールド名を提供してください。`disabled` と `readOnly` はどちらもフィールドを編集
シーケンスから外します。現在の既知のギャップ：プレースホルダーテキスト（placeholder）とフォーカスリングの
スタイルはまだありません。
