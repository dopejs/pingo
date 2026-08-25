---
title: 編集可能要素：Input と TextArea
description: エンジンネイティブの編集可能テキストプリミティブ——制御された revision トランザクション契約、EditContext 入力ブリッジ、パスワードと読み取り専用。
---

# 編集可能要素：Input と TextArea

`Input` と `TextArea`（`@dopejs/pingo` では `UnstyledTextArea` としてエクスポート。下記参照）はエンジンネイティブの
編集可能テキストプリミティブです。caret、選択範囲、IME composition、クリップボード、undo/redo はすべて Core が実装しており、
**canvas の上に HTML 入力コントロールを重ねる必要はありません**。以下のプレビューは実際に入力可能です——クリックしてフォーカスし、
中国語入力、ドラッグ選択、Ctrl+Z をお試しください。

:::preview elements-input
:::

## 使い方

制御された書き方：`value` + 単調増加する `revision` を用い、`onTransaction` で Core から送られるトランザクションを確認します。

```tsx
import { createElement, Input, type EditTransaction } from "@dopejs/pingo";

let value = "注文メモ";
let revision = 1n;

function applyDelta(current: string, transaction: EditTransaction): string {
  const delta = transaction.delta;
  return delta === undefined
    ? current
    : current.slice(0, delta.range.start) + delta.text + current.slice(delta.range.end);
}

createElement(Input, {
  value,
  revision,
  semanticLabel: "注文メモ",
  onTransaction: (transaction) => {
    value = applyDelta(value, transaction);
    revision = transaction.revision;
  },
});
```

純粋なローカル状態では `value` / `revision` を渡さず、`TextEditingController`
（hooks の場合は `useTextEditingController`）を使用できます。`controller` と `value`/`revision` は相互排他です。

## revision トランザクション契約

状態の所有権は明確です。**Shell がビジネスデータを所有し、Core がアクティブな編集セッションの一時的状態を所有します。**

1. 入力が Core に到達し、`base_revision` が現在のセッションと一致することを検証します。
2. 検証を通過すると**即座に適用して再描画します**——キー入力ごとに完全なレンダリングパイプラインを通す必要はありません。
3. Core はバージョン付きの `EditTransaction` を逆方向に発行します。
4. Shell は確認（自身の `value` / `revision` を更新）するか、ビジネス検証が失敗した場合は新しい
   `revision` を持つ補正値を送信します。古い revision が新しい Core 入力を上書きすることは決してありません。同じ revision の
   確認は undo スタックを消去しません。

`EditTransaction` のフィールド：

| フィールド     | 型                                                          | 説明                                                                                                                                    |
| -------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `nodeId`       | `number`                                                    | トランザクションを生成した編集ノード                                                                                                    |
| `baseRevision` | `bigint`                                                    | トランザクションの基になる revision                                                                                                     |
| `revision`     | `bigint`                                                    | トランザクション後の新しい revision                                                                                                     |
| `delta`        | `{ range: { start, end }, text }`                           | テキスト差分。オフセットは UTF-16 で、EditContext/InputEvent に合わせています。純粋な選択トランザクションにはこのフィールドはありません |
| `selection`    | `{ anchor, focus, anchorAffinity, focusAffinity }`          | トランザクション後の選択範囲                                                                                                            |
| `composition`  | `{ start, end }`                                            | 進行中の IME 組み合わせ区間                                                                                                             |
| `kind`         | `"edit" \| "composition" \| "external" \| "undo" \| "redo"` | トランザクションの種別                                                                                                                  |

## 入力ブリッジ：EditContext とフォールバックプロキシ

メインスレッドは優先順位に従って OS のテキスト入力サービスに接続します。

1. **EditContext** —— canvas にバインドし、テキスト/選択範囲/composition を受信し、入力メソッドに control、
   selection、文字境界を報告します。これにより候補ウィンドウが caret のすぐ横に配置されます。
2. **エンジン管理の入力プロキシ** —— EditContext が利用できない場合、ホストは**1 つの**グローバルな非表示
   `textarea` を維持し、`beforeinput`、composition、ソフトキーボード、クリップボードを統一的に処理します。

これはプラットフォームのフォールバック実装であり、EmbedDOM コンポーネントモデルではありません。Scene 内に各編集ノードと一対一で対応する
DOM は存在しません。両方の経路は同じ編集動作契約テストを通過します。

## 複数行：TextArea プリミティブ

`TextArea` プリミティブは `Input` と同じ `editableText` サブシステムを共有し、唯一の違いは `multiline`
不変量がコンポーネントによって固定されていることです。Enter は改行を挿入し `onSubmit` を発火させません。上下矢印キーで行をまたいで移動する際は期待列
（desired-x）を維持します。

:::preview elements-textarea
:::

## Props（Input / UnstyledTextArea）

両者は `EditableTextProps` を共有します（`multiline` は公開されず、コンポーネントが固定します）。

| Prop            | 型                             | デフォルト値 | 説明                                                                                     |
| --------------- | ------------------------------ | ------------ | ---------------------------------------------------------------------------------------- |
| `value`         | `string`                       | —            | 制御されたテキスト                                                                       |
| `revision`      | `number \| bigint`             | —            | 制御された値の信頼できる revision。古い値が新しい Core 入力を上書きすることはありません  |
| `controller`    | `TextEditingController`        | —            | 安定したローカル controller。`value`/`revision` と相互排他                               |
| `readOnly`      | `boolean`                      | `false`      | 読み取り専用                                                                             |
| `password`      | `boolean`                      | `false`      | パスワードモード（下記参照）                                                             |
| `maxGraphemes`  | `number`                       | —            | grapheme の上限                                                                          |
| `inputMode`     | `EditableInputMode`            | `"text"`     | ソフトキーボードのヒント：`decimal` `email` `none` `numeric` `search` `tel` `text` `url` |
| `onTransaction` | `(t: EditTransaction) => void` | —            | Core 編集トランザクションのコールバック                                                  |
| `onSubmit`      | `() => void`                   | —            | 単一行での Enter 送信。複数行の Enter は改行のために予約されています                     |

テキストの外観は `TextProps` を継承します：`color`、`fontSize`、`fontWeight`、`lineHeight`、`fontFamily`、
`font`。サイズ、`padding`、`backgroundColor`、境界線（`style` チャネル）などは
[CommonProps](/api) から取得します。

## アクセシビリティとプライバシー

- 編集ノードは `textbox` セマンティクスを標準で備えています。`semanticLabel` で名前を提供してください（目に見える label がない場合は特に重要です）。
- パスワード内容は Core 内でのみマスクされた字形で描画されます。平文が DisplayList、録画再生、devtools、
  アクセシビリティ値に入ることはなく、パスワード対象はクリップボードにも書き込まれません。

より深い設計（テキスト位置モデル、bidi 境界、契約テストマトリックス）については[テキストと編集](/guide/editing)を参照してください。
