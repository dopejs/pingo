---
title: Pagination
description: shadcn スタイルのページネーションコントロール。ページ番号の省略と境界での無効化付き。pingo canvas 上にレンダリング。
---

# Pagination

ページネーションコントロール。現在のページがハイライトされ、長すぎるページ番号シーケンスは自動的に省略記号に
折りたたまれ、最初/最後のページに達すると対応する矢印が無効になります。下のプレビューは pingo エンジンによる
リアルタイムレンダリングです。ページ番号や矢印をクリックしてページを移動でき、サイトのテーマに合わせて
明暗が切り替わります。

:::preview pagination-basic
:::

## 使い方

ページ番号は**制御**です。`page` は 1 始まりで、ページ移動は `onPageChange` で通知されるので、自分で
書き戻してください。

```tsx
import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
import { Pagination } from "@dopejs/pingo-ui";

function PagedList(): PingoNode {
  const page = useSignal(1);
  return createElement(Pagination, {
    page: page.get(),
    pageCount: 12,
    onPageChange: (next) => page.set(next),
  });
}
```

## 例

### コンパクトモード

`siblingCount` は現在のページの両側に表示するページ番号の数を制御します（最初と最後のページは含まず、
常に表示されます）。`0` に設定すると最初・最後・現在のページだけが残ります。最初のページでは前ページの
矢印が無効になります。

:::preview pagination-compact
:::

ページ番号シーケンスの折りたたみルールは、エクスポートされた純粋関数
`paginationRange(page, pageCount, siblingCount)` で実装されており、単体でテストに利用できます。

## Props

| Prop | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `page` | `number` | — | 現在のページ。1 始まり（必須）。範囲外は `[1, pageCount]` に丸められる |
| `pageCount` | `number` | — | 総ページ数（必須）。1 未満の場合はページ番号を一切レンダリングしない |
| `onPageChange` | `(page: number) => void` | — | ページ移動時のコールバック。現在のページや範囲外のターゲットをクリックしても発火しない |
| `siblingCount` | `number` | `1` | 現在のページの両側に表示するページ番号の数 |
| `previousLabel` | `string` | — | 型に予約された前ページのテキスト。現在のバージョンはアイコンでレンダリングされ、このフィールドはまだ描画に使われない |
| `nextLabel` | `string` | — | 型に予約された次ページのテキスト。現在のバージョンはアイコンでレンダリングされ、このフィールドはまだ描画に使われない |
| `className` | `string` | — | コンポーネントのクラス名に追加される |

## アクセシビリティ

コントロール全体は `navigation` セマンティクスを持ちます。現在のページには `current` セマンティック値が
付き、前後のページ移動ボタンのアクセシブル名は "previous page" / "next page" です。境界に達すると無効化され
ポインタに反応しなくなります。キーボードでは `ArrowLeft` / `ArrowRight` でコントロール内のどこにフォーカスが
あってもページを移動できます。詳しくは[アクセシビリティガイド](/ja/guide/accessibility)を参照してください。
