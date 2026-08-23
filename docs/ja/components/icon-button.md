---
title: Icon Button
description: アイコンのみを載せるボタン。アクセシブル名が必須。pingo canvas 上にレンダリング。
---

# Icon Button

アイコンボタンは、テキストラベルのないコンパクトな操作に使います。下のプレビューは pingo エンジンによる
リアルタイムレンダリングです。クリックやフォーカスができ、サイトのテーマに合わせて明暗が切り替わります。

:::preview icon-button-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { IconButton } from "@dopejs/pingo-ui";

root.render(
  createElement(IconButton, {
    icon: createElement("text", { value: "★" }),
    semanticLabel: "お気に入り",
    variant: "outline",
    onPress: () => toggleFavorite(),
  }),
);
```

`icon` はそのまま渡されるスロットで、任意の `PingoNode` を受け取ります。アイコンフォント、SVG、テキスト
グリフのいずれでも構いません。表示テキストがないため、`semanticLabel` は必須です。

## 例

### バリアント

`variant` は [Button](/ja/components/button) と完全に揃っています。`default`、`secondary`、`outline`、
`ghost`、`destructive`。

### 既知の制限

`size` は `default`、`sm`、`lg` をサポートしていますが、現在のスキンには icon バリアント向けの `sm`/`lg`
の複合ルールがなく、アイコンサイズがサイズ修飾を上書きするため、`sm`/`lg` には現時点で視覚効果がありません。

## Props

| Prop | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `icon` | `PingoNode` | — | アイコンスロット。そのまま渡される（必須） |
| `semanticLabel` | `string` | — | アクセシブル名（必須） |
| `variant` | `"default" \| "secondary" \| "outline" \| "ghost" \| "destructive"` | `"default"` | 見た目のバリアント |
| `size` | `"default" \| "sm" \| "lg"` | `"default"` | サイズ（`sm`/`lg` は現時点で無効。上記参照） |
| `disabled` | `boolean` | `false` | 無効状態 |
| `onPress` | `() => void` | — | ポインタ/キーボードによるアクティブ化のコールバック |
| `className` | `string` | — | コンポーネントのクラス名に追加される |

## アクセシビリティ

アイコンボタンには表示テキストがなく、スクリーンリーダーは `semanticLabel` にしか頼れないため、この prop は
必須です。ボタンは button セマンティクスとキーボードアクティブ化をサポートしています。
