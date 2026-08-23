---
title: Alert
description: 重要なお知らせを表示するコールアウトブロック。pingo canvas 上にレンダリング。
---

# Alert

Alert は、ユーザーの注意を引く必要があるがフローを中断しない情報をページ内に表示するために使います。
下のプレビューは pingo エンジンによるリアルタイムレンダリングで、サイトのテーマに合わせて明暗が切り替わります。

:::preview alert-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { Alert } from "@dopejs/pingo-ui";

root.render(
  createElement(Alert, {
    title: "お知らせ",
    children: "設定は自動的に保存されました。",
  }),
);
```

## 例

### 破壊的な警告

`variant="destructive"` はエラーや失敗の場面で使います。枠線とタイトルが破壊的な配色になり、説明文は
可読性を保つため通常の前景色のままです。

```tsx
createElement(Alert, {
  title: "同期に失敗しました",
  variant: "destructive",
  children: "ネットワーク接続を確認してから再試行してください。",
});
```

## Props

| Prop | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `title` | `string` | — | タイトル（必須） |
| `children` | `string` | — | 説明の本文（必須） |
| `variant` | `"default" \| "destructive"` | `"default"` | 見た目のバリアント |
| `className` | `string` | — | コンポーネントのクラス名に追加される |

## アクセシビリティ

Alert は純粋な静的テキストブロックで、フォーカスを奪いません。簡潔な `title` で結論をまとめ、詳細は説明文に
書いてください。ユーザーの確認や対処が必要な場面では `AlertDialog` を使ってください。
