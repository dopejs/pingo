---
title: Text Area
description: 複数行テキスト入力欄。pingo 編集エンジンによって駆動され、canvas 上に描画されます。
---

# Text Area

複数行テキスト入力。備考や自己紹介など、長めの内容に使用します。以下のプレビューは pingo エンジンによってリアルタイム描画されます。クリックすると実際に複数行のテキストを入力でき、サイトのテーマに合わせて明暗が切り替わります。

:::preview text-area-basic
:::

## 使い方

```tsx
import { TextArea } from "@dopejs/pingo-ui";

root.render(
  <TextArea
    semanticLabel="個人プロフィール"
    width={360}
    rows={4}
    onValueChange={(value) => console.log(value)}
  />,
);
```

`rows` は表示行数を決定し、外枠の最小高さを固定します（`rows × 行の高さ + 上下の内側余白`）。[Input](/components/input) と同様に、`TextArea` は JSX を使ってコンポーネントとしてマウントする必要があります。編集の詳細は[テキスト編集ガイド](/guide/editing)を参照してください。

## 例

### 無効化

`disabled` を渡すと、入力欄は入力を受け付けなくなり、無効化スタイルが適用されます。

## Props

| Prop            | 型                                       | デフォルト値 | 説明                                                               |
| --------------- | ---------------------------------------- | ------------ | ------------------------------------------------------------------ |
| `value`         | `string`                                 | `""`         | 非制御用法の初期値。`controller` を設定した場合は無視されます      |
| `onValueChange` | `(value: string) => void`                | —            | 編集トランザクションが適用されるたびに最新値をコールバックします   |
| `controller`    | `TextEditingController`                  | —            | 高度なエスケープハッチ。呼び出し側が保持する永続的なコントローラー |
| `onTransaction` | `(transaction: EditTransaction) => void` | —            | 各編集トランザクションの生のコールバック                           |
| `onSubmit`      | `() => void`                             | —            | 送信コールバック                                                   |
| `disabled`      | `boolean`                                | `false`      | 無効状態                                                           |
| `readOnly`      | `boolean`                                | `false`      | 読み取り専用状態                                                   |
| `rows`          | `number`                                 | —            | 表示行数。外枠の最小高さを決定します                               |
| `className`     | `string`                                 | —            | コンポーネントのクラス名の後に追加されます                         |
| `width`         | `number`                                 | —            | 固定幅（px）                                                       |
| `semanticLabel` | `string`                                 | —            | アクセシビリティ名                                                 |

## アクセシビリティ

`semanticLabel` で入力欄の名前を提供します。`disabled` と `readOnly` はどちらも、入力欄を編集シーケンスから除外します。Input と既知の課題を共有しています。現時点ではプレースホルダーテキストとフォーカスリングのスタイルがありません。
