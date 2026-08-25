---
title: Widgets：スタイルなしエンジン部品
description: "@dopejs/pingo-widgets は TextField、TextArea、Pressable、Button などのスタイルなしエンジン級部品と、@dopejs/pingo-ui との境界を提供します。"
---

# Widgets：スタイルなしエンジン部品

`@dopejs/pingo-widgets` はエンジンの上の第一層の組み合わせです。これは
[編集可能プリミティブ](/guide/elements-editing)とフォーカス、ネイティブイベントを組み立てて利用可能な部品にし、**最小限**の
装飾（ボーダー、エラー状態）を付与します。特定のデザインシステムは前提としません。業務コードはこの内部パッケージに直接依存しません。すべてのエクスポートは
`@dopejs/pingo` を通じて再エクスポートされます。以下のプレビューはリアルタイムで描画され、直接入力できます。

:::preview widgets-textfield
:::

## エクスポートと命名

| エクスポート | 説明                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------- |
| `TextField`  | 単一行入力：ボーダー + エラー状態の装飾。内部では `editableText` プリミティブのみを組み合わせます |
| `TextArea`   | 複数行バリアント。Enter で改行し、submit はホストフォームに委ねます                               |
| `Pressable`  | フォーカス可能なアクティベーション面：View + フォーカス + ネイティブ click/tap                    |
| `Button`     | `Pressable` + `Text` によるテキストボタンの簡便な組み合わせ                                       |

命名に関する注意：`@dopejs/pingo` の `TextArea` は装飾付きのこのウィジェットを指します。複数行**プリミティブ**は
`UnstyledTextArea` としてエクスポートされます（同様に `TextAreaProps` にはエイリアス `UnstyledTextAreaProps` があります）。

## TextField と TextArea

デフォルトの装飾は 1px のボーダー、8px の内側余白です。`error` 文字列を渡すとエラー色のボーダーに切り替わり、フィールドの下方に
`alert` ロールのエラー説明を描画します。制御契約（`value` + `revision` + `onTransaction`）は
[編集可能要素](/guide/elements-editing)と完全に同じです。ウィジェットが新しい入力経路を持ち込むことはありません。

```tsx
import { createElement, TextField } from "@dopejs/pingo";

createElement(TextField, {
  value,
  revision,
  semanticLabel: "宛先",
  width: 320,
  error: value === "" ? "宛先は必須です" : undefined,
  onTransaction: (t) => apply(t),
});
```

### Props（TextField）

| Prop              | 型                             | デフォルト値             | 説明                                                                      |
| ----------------- | ------------------------------ | ------------------------ | ------------------------------------------------------------------------- |
| `value`           | `string`                       | `""`                     | 制御対象テキスト                                                          |
| `revision`        | `number \| bigint`             | `0n`                     | 制御対象値の正規 revision                                                 |
| `controller`      | `TextEditingController`        | —                        | ローカル controller。`value`/`revision` とは排他的です                    |
| `readOnly`        | `boolean`                      | —                        | 読み取り専用                                                              |
| `password`        | `boolean`                      | —                        | パスワードモード（平文は DisplayList とアクセシビリティ値に含まれません） |
| `maxGraphemes`    | `number`                       | —                        | grapheme の上限                                                           |
| `inputMode`       | `EditableInputMode`            | —                        | ソフトキーボードのレイアウトヒント                                        |
| `width`           | `number`                       | `240`                    | ボーダーを含む全体幅                                                      |
| `height`          | `number`                       | `lineHeight × rows + 16` | ボーダーを含む全体高さ                                                    |
| `fontSize`        | `number`                       | `14`                     | フォントサイズ                                                            |
| `lineHeight`      | `number`                       | `round(fontSize × 1.5)`  | 行の高さ                                                                  |
| `color`           | `Color`                        | `#1f2329ff`              | テキスト色                                                                |
| `backgroundColor` | `Color`                        | `#ffffffff`              | フィールドの背景色                                                        |
| `borderColor`     | `Color`                        | `#c0c4ccff`              | ボーダー色                                                                |
| `errorColor`      | `Color`                        | `#d03050ff`              | エラー状態のボーダーと説明の色                                            |
| `error`           | `string`                       | —                        | 空でなければエラー状態：エラー色のボーダー + 下方のエラー説明             |
| `onTransaction`   | `(t: EditTransaction) => void` | —                        | Core 編集トランザクションのコールバック                                   |
| `onSubmit`        | `() => void`                   | —                        | 単一行 Enter での送信                                                     |
| `semanticLabel`   | `string`                       | —                        | アクセシビリティ名（ロールは常に `textbox`）                              |

`TextArea` はこれに加えて `rows`（デフォルト `3`）を持ち、デフォルト高さの計算に使われます。

## Pressable と Button

`Pressable` は新しい Scene ノード種別を導入しません。これは `button` セマンティクスを持ち、押下時に自動的にフォーカスを取得し、
ネイティブ click/tap を `onPress` にマッピングする `View` です。スタイルはすべて `style` と `children` で決まり、
`disabled` の場合は透明度を下げてイベントを除去します。

| Prop               | 型           | デフォルト値                  | 説明                                               |
| ------------------ | ------------ | ----------------------------- | -------------------------------------------------- |
| `children`         | `PingoNode`  | —                             | コンテンツ（Button では `string \| number`、必須） |
| `disabled`         | `boolean`    | `false`                       | 無効状態                                           |
| `onPress`          | `() => void` | —                             | アクティベーションのコールバック                   |
| `className`        | `string`     | —                             | クラス名（スタイルシートへ接続）                   |
| `style`            | `PingoStyle` | —                             | インラインスタイル                                 |
| `width` / `height` | `number`     | —                             | サイズ                                             |
| `semanticLabel`    | `string`     | `Button` は `children` を利用 | アクセシビリティ名                                 |

`Button` は追加で `color` と `fontSize` を受け付けます（内部テキストへ渡されます）。

## @dopejs/pingo-ui との境界

2 つの層は異なる問いに答えます。

- **widgets** —— 振る舞いの正しさ：編集トランザクション、フォーカス、セマンティックロール、最小限の装飾。デザイン上の意見を一切含まず、
  色とフォントサイズはすべて上書き可能です。
- **@dopejs/pingo-ui** —— デザインシステム：shadcn の発想による完全なコンポーネント（バリアント、サイズ、テーマ、スタイルシート）。
  内部で widgets、`@dopejs/pingo-editing`、ランタイム hooks を組み合わせ、エンジンへの変更はゼロです。

選定のアドバイス：既製のデザインシステムがほしい場合は直接用 [pingo-ui コンポーネント](/components)、独自のデザイン言語を持ちつつ
編集トランザクションの詳細には触れたくない場合は widgets を土台に、完全にカスタム（ゲーム HUD など）の場合は直接
[基礎要素](/guide/elements)のプリミティブを使用します。

## アクセシビリティ

`TextField` / `TextArea` は `textbox` ロールを標準で持ち、`error` の説明は `alert` ロールです。
`Pressable` / `Button` は `button` ロールで、`disabled` は `semanticValue` を通じて公開されます。
名前はすべて `semanticLabel` に依存します。可視ラベルがない場合でも省略しないでください。詳細は[アクセシビリティ](/guide/accessibility)を参照してください。
