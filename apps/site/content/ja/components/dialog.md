---
title: Dialog
description: モーダルダイアログ。フローを中断してユーザーの入力や確認を求める。pingo canvas 上にレンダリング。
---

# Dialog

ダイアログは現在のコンテンツの上にモーダルパネルを開き、マスクを伴います。下のプレビューは pingo エンジン
によるリアルタイムレンダリングです。マスクをクリックするか `Escape` を押すと `onOpenChange(false)` が
発火し、サイトのテーマに合わせて明暗が切り替わります。

:::preview dialog-basic
:::

## 使い方

```tsx
import {
  Button,
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@dopejs/pingo-ui";

root.render(
  <Dialog open={open} onOpenChange={(next) => setOpen(next)}>
    <DialogHeader>
      <DialogTitle>プロフィールを編集</DialogTitle>
      <DialogDescription>変更は即座に同期されます。</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button onPress={() => save()}>保存</Button>
    </DialogFooter>
  </Dialog>,
);
```

Dialog のオーバーレイは（ビューポートではなく）**自身の親コンテナ**いっぱいに広がるため、ルートノードに
近い位置にマウントしてください。`open` は制御 prop です。コンポーネントは開閉状態を保持せず、閉じる際は
`onOpenChange(false)` で呼び出し側に通知します。

## 例

### ブロックの組み合わせ

`DialogHeader` / `DialogTitle` / `DialogDescription` / `DialogFooter` は純粋なレイアウトとタイポグラフィの
コンポーネントで、必要に応じて組み合わせます。`children` は任意の `PingoNode` を受け取るため、フォームや
リストもパネルに入れられます。

## Props

### Dialog

| Prop           | 型                        | デフォルト | 説明                                  |
| -------------- | ------------------------- | ---------- | ------------------------------------- |
| `open`         | `boolean`                 | —          | 開いているかどうか（必須、制御）      |
| `onOpenChange` | `(open: boolean) => void` | —          | クローズ/オープン要求時のコールバック |
| `children`     | `PingoNode`               | —          | パネルのコンテンツ（必須）            |
| `className`    | `string`                  | —          | オーバーレイのクラス名に追加される    |

### DialogHeader / DialogFooter

| Prop        | 型          | デフォルト | 説明                         |
| ----------- | ----------- | ---------- | ---------------------------- |
| `children`  | `PingoNode` | —          | ブロックのコンテンツ（必須） |
| `className` | `string`    | —          | 追加するクラス名             |

### DialogTitle / DialogDescription

| Prop        | 型       | デフォルト | 説明                       |
| ----------- | -------- | ---------- | -------------------------- |
| `children`  | `string` | —          | テキストコンテンツ（必須） |
| `className` | `string` | —          | 追加するクラス名           |

## アクセシビリティ

パネルは dialog セマンティクスを持ちます。開くとフォーカスがパネル内に移り、`Escape` で閉じるとフォーカスは
トリガー要素に戻ります。パネル内のインタラクティブ要素は Tab ループに登録されます。タイトルには
`DialogTitle`（heading セマンティクス）を使ってください。
