---
title: Sheet
description: 任意の画面端からスライドインするパネル。絞り込みや詳細などの二次的なコンテンツに適しています。
---

# Sheet

Sheet はコンテナの端からパネルをスライドインさせます。絞り込み条件や詳細サイドバーなど、メインフローを妨げない二次的なコンテンツによく使用されます。以下のプレビューは pingo エンジンによってリアルタイムに描画され、サイトのテーマに追従して明暗が切り替わります。

:::preview sheet-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { Sheet } from "@dopejs/pingo-ui";

root.render(
  createElement(Sheet, {
    open,
    onOpenChange: (next) => setOpen(next),
    side: "right",
    children: createElement("text", { value: "パネル内容" }),
  }),
);
```

オーバーレイは自身の親コンテナ全体を満たすため、ルートに近い位置にマウントしてください。`open` は制御された prop です。マスクのクリックや `Escape` キーの押下により、`onOpenChange(false)` を通じて閉じる要求が行われます。パネル内のタイトル/ボタン領域には、`DialogHeader`、`DialogTitle`、`DialogDescription`、`DialogFooter` を再利用できます。

## 例

### 方向

`side` は `"left"`、`"right"`、`"top"`、`"bottom"` をサポートし、デフォルトは `"right"` です。上下の端のみが必要な場合は、より明確なセマンティクスを持つ [Drawer](/components/drawer) を使用してください。

## Props

`DialogProps`（`open`、`onOpenChange`、`children`、`className`）を継承し、さらに以下があります。

| Prop | 型 | デフォルト値 | 説明 |
| --- | --- | --- | --- |
| `side` | `"left" \| "right" \| "top" \| "bottom"` | `"right"` | スライドインする端 |

## アクセシビリティ

パネルは complementary セマンティクスを持ちます。開くとフォーカスがパネル内に移動し、`Escape` キーで閉じた後はフォーカスがトリガー要素に戻ります。
