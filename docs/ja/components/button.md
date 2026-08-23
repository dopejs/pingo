---
title: Button
description: 操作やイベントをトリガーするボタン。pingo canvas 上にレンダリング。
---

# Button

ボタンは操作をトリガーします。下のプレビューは pingo エンジンによるリアルタイムレンダリングです。
クリックやフォーカスができ、サイトのテーマに合わせて明暗が切り替わります。

:::preview button-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { Button } from "@dopejs/pingo-ui";

root.render(
  createElement(Button, {
    children: "保存",
    variant: "default",
    onPress: () => save(),
  }),
);
```

## 例

### サイズ

`size` は `default`、`sm`、`lg`、`icon` をサポートしています。

### 無効化

`disabled` を渡すと、ボタンはポインタにもキーボードにも反応しなくなり、無効化スタイルが適用されます。

## Props

| Prop | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `children` | `string` | — | ボタンのテキスト（必須） |
| `variant` | `"default" \| "secondary" \| "outline" \| "ghost" \| "destructive"` | `"default"` | 見た目のバリアント |
| `size` | `"default" \| "sm" \| "lg" \| "icon"` | `"default"` | サイズ |
| `disabled` | `boolean` | `false` | 無効状態 |
| `onPress` | `() => void` | — | ポインタ/キーボードによるアクティブ化のコールバック |
| `semanticLabel` | `string` | `children` | アクセシブル名 |
| `className` | `string` | — | コンポーネントのクラス名に追加される |

## アクセシビリティ

ボタンは button セマンティクスとキーボードアクティブ化をサポートしています。`semanticLabel` はデフォルトで
`children` が使われます。アイコンボタンでは明示的に指定してください。
