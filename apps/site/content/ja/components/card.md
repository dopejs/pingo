---
title: Card
description: 組み合わせ式のカードコンテナ：Header、Title、Description、Content、Footer。pingo canvas 上にレンダリング。
---

# Card

カードは関連するコンテンツを、枠線と影のあるコンテナにまとめます。6 つの組み合わせ可能なスロットで構成
されます。下のプレビューは pingo エンジンによるリアルタイムレンダリングで、サイトのテーマに合わせて
明暗が切り替わります。

:::preview card-basic
:::

## 使い方

```tsx
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@dopejs/pingo-ui";

root.render(
  <Card>
    <CardHeader>
      <CardTitle>アカウント設定</CardTitle>
      <CardDescription>アカウントの設定と通知を管理します。</CardDescription>
    </CardHeader>
    <CardContent>
      <text value="カードの本文コンテンツ。" />
    </CardContent>
    <CardFooter>
      <Button onPress={() => {}}>保存</Button>
    </CardFooter>
  </Card>,
);
```

すべてのスロットはオプションです。必要な部分だけを組み合わせてください。スロットのコンテンツはラップせず
そのまま渡されます。

## Props

`Card`、`CardHeader`、`CardContent`、`CardFooter` はコンテナ型の props を受け取ります。

| Prop        | 型          | デフォルト | 説明                                 |
| ----------- | ----------- | ---------- | ------------------------------------ |
| `children`  | `PingoNode` | —          | スロットのコンテンツ（必須）         |
| `className` | `string`    | —          | コンポーネントのクラス名に追加される |

`CardTitle`、`CardDescription` はテキスト型の props を受け取ります。

| Prop        | 型       | デフォルト | 説明                                 |
| ----------- | -------- | ---------- | ------------------------------------ |
| `children`  | `string` | —          | テキストコンテンツ（必須）           |
| `className` | `string` | —          | コンポーネントのクラス名に追加される |

## アクセシビリティ

Card は純粋な視覚コンテナで、追加のセマンティクスは持ち込みません。カードの可読名と構造は、内部に配置した
タイトルやボタンなどのコンポーネントが担います。タイトルと本文の色はカードの前景色を継承し、明暗どちらの
テーマでもコントラストが保たれます。
