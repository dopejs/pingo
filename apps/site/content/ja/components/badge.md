---
title: Badge
description: 非インタラクティブなステータスラベル。pingo canvas 上にレンダリング。
---

# Badge

Badge は非インタラクティブなステータスラベルで、状態・カテゴリ・数量などを示します。たとえば
「管理者」「Beta」などです。下のプレビューは pingo エンジンによるリアルタイムレンダリングで、サイトの
テーマに合わせて明暗が切り替わります。

:::preview badge-variants
:::

## 使い方

```tsx
import { Badge } from "@dopejs/pingo-ui";

root.render(<Badge>Beta</Badge>);
```

## 例

### バリアント

4 つのバリアントでよくあるセマンティクスをカバーします。`default`（強調）、`secondary`（弱め）、
`destructive`（エラー/危険）、`outline`（アウトライン）。プレビューではこの順に表示しています。

```tsx
<Badge variant="secondary">読み取り専用</Badge>
```

### 他のコンポーネントとの組み合わせ

Badge はリスト行やカードの trailing 要素として、`Avatar` や `ListRow` と組み合わせてよく使われます。

```tsx
<ListRow
  title="田中太郎"
  leading={<Avatar fallback="田" size={32} />}
  trailing={<Badge>管理者</Badge>}
  onPress={() => {}}
/>
```

## Props

| Prop            | 型                                                       | デフォルト  | 説明                                               |
| --------------- | -------------------------------------------------------- | ----------- | -------------------------------------------------- |
| `children`      | `string`                                                 | —           | ラベルテキスト（必須）                             |
| `variant`       | `"default" \| "secondary" \| "destructive" \| "outline"` | `"default"` | 見た目のバリアント                                 |
| `semanticLabel` | `string`                                                 | —           | アクセシブル名。省略時はデフォルトのセマンティクス |
| `className`     | `string`                                                 | —           | コンポーネントのクラス名に追加される               |

## アクセシビリティ

Badge はポインタにもキーボードにも反応しない純粋な表示要素です。テキストだけでは意味が伝わらない場合
（数字だけの角標など）は、`semanticLabel` で完全な説明を提供してください。
