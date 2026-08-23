---
title: Drawer
description: 上下の端からスライドインするドロワーパネル。モバイルスタイルのボトムアクションに最適。
---

# Drawer

ドロワーは水平方向の端からスライドインするパネルです。`side` が `"top" | "bottom"` のみを取る
[Sheet](/ja/components/sheet) と同等です。下のプレビューは pingo エンジンによるリアルタイムレンダリングで、
サイトのテーマに合わせて明暗が切り替わります。

:::preview drawer-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { Drawer } from "@dopejs/pingo-ui";

root.render(
  createElement(Drawer, {
    open,
    onOpenChange: (next) => setOpen(next),
    side: "bottom",
    children: createElement("text", { value: "ドロワーのコンテンツ" }),
  }),
);
```

オーバーレイは自身の親コンテナいっぱいに広がるため、ルートノードに近い位置にマウントしてください。
`open` は制御 prop です。マスクのクリックまたは `Escape` で `onOpenChange(false)` によるクローズが要求
されます。パネル内のタイトル/ボタンブロックには `DialogHeader`、`DialogTitle`、`DialogDescription`、
`DialogFooter` を再利用できます。

## 例

### 方向

`side` は `"top"` と `"bottom"` をサポートし、デフォルトは `"bottom"` です。

## Props

`DialogProps`（`open`、`onOpenChange`、`children`、`className`）を継承し、さらに以下があります。

| Prop | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `side` | `"top" \| "bottom"` | `"bottom"` | スライドインする端 |

## アクセシビリティ

パネルは complementary セマンティクスを持ちます。開くとフォーカスがパネル内に移り、`Escape` で閉じると
フォーカスはトリガー要素に戻ります。
