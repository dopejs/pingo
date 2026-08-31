---
title: Label
description: フォームのラベルテキスト。入力コントロールと組み合わせて使用。pingo canvas 上にレンダリング。
---

# Label

ラベルはフォームコントロールに表示名を提供するために使います。下のプレビューは pingo エンジンによる
リアルタイムレンダリングで、サイトのテーマに合わせて明暗が切り替わります。

:::preview label-basic
:::

## 使い方

```tsx
import { Input, Label } from "@dopejs/pingo-ui";

root.render(
  <container style={{ flexDirection: "column" }}>
    <Label>メールアドレス</Label>
    <container height={8} />
    <Input semanticLabel="メールアドレス" width={320} />
  </container>,
);
```

pingo には `gap` プロパティがないため、ラベルとコントロールの間隔は固定サイズのコンテナで実現します。

## 例

### セマンティック名

pingo にはコントロールの関連付けがまだ存在しないため、ラベルとコントロールの関連は規約で行います。
コントロールにラベルと一致する `semanticLabel` を渡し、スクリーンリーダーが同じ名前を読み上げられるように
します。

## Props

| Prop            | 型       | デフォルト | 説明                                                 |
| --------------- | -------- | ---------- | ---------------------------------------------------- |
| `children`      | `string` | —          | ラベルテキスト（必須）                               |
| `className`     | `string` | —          | コンポーネントのクラス名に追加される                 |
| `semanticLabel` | `string` | —          | アクセシブル名を上書き。省略時はラベルテキストを使用 |

## アクセシビリティ

pingo にはまだ label–control の関連付けメカニズムがなく、Label はスタイル付きのテキストにすぎません。
対応するコントロールには必ず `semanticLabel` を設定し、アクセシブル名が視覚的な近接関係に依存しないように
してください。
