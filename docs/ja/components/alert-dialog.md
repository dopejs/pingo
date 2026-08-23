---
title: Alert Dialog
description: 破壊的操作向けの確認ダイアログ。キャンセル/確認ボタンのペアを内蔵。
---

# Alert Dialog

確認ダイアログは「キャンセル / 確認」ボタンのペアを内蔵した Dialog で、不可逆な操作の前の再確認に使います。
下のプレビューは pingo エンジンによるリアルタイムレンダリングで、サイトのテーマに合わせて明暗が切り替わります。

:::preview alert-dialog-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { AlertDialog } from "@dopejs/pingo-ui";

root.render(
  createElement(AlertDialog, {
    open,
    onOpenChange: (next) => setOpen(next),
    title: "終了してよろしいですか？",
    description: "保存されていない変更は失われます。",
    onCancel: () => {},
    onAction: () => quit(),
    children: null,
  }),
);
```

Dialog と同様に、オーバーレイは自身の親コンテナいっぱいに広がるため、ルートノードに近い位置にマウントして
ください。`children` は `DialogProps` から継承されており必須のままですが、コンポーネント内蔵の
タイトル/説明/ボタン構造で上書きされるため、`null` を渡せば問題ありません。キャンセル・確認のどちらの
ボタンをクリックしても、まず対応するコールバックが呼ばれ、その後 `onOpenChange(false)` でクローズが
要求されます。マスクのクリックでも同様に閉じます。

## 例

### 破壊的操作

`destructive` を指定すると、確認ボタンが危険色でレンダリングされます。

:::preview alert-dialog-destructive
:::

## Props

`DialogProps`（`open`、`onOpenChange`、`children`、`className`）を継承し、さらに以下があります。

| Prop          | 型           | デフォルト     | 説明                                         |
| ------------- | ------------ | -------------- | -------------------------------------------- |
| `title`       | `string`     | —              | タイトル（必須）                             |
| `description` | `string`     | —              | 補足説明                                     |
| `cancelLabel` | `string`     | `"キャンセル"` | キャンセルボタンのラベル                     |
| `actionLabel` | `string`     | `"OK"`         | 確認ボタンのラベル                           |
| `onCancel`    | `() => void` | —              | キャンセル時のコールバック（その後クローズ） |
| `onAction`    | `() => void` | —              | 確認時のコールバック（その後クローズ）       |
| `destructive` | `boolean`    | `false`        | 確認ボタンに危険色を使う                     |

## アクセシビリティ

dialog セマンティクスを備えています。キャンセルと確認の両ボタンは Tab ループに登録されているため、
キーボードユーザーがダイアログ内に閉じ込められることはありません。
