---
title: StatCard
description: 指標カード分子コンポーネント。数値、前月比変化、トレンド着色を表示し、pingo キャンバス上に再描画します。
---

# StatCard

StatCard は pingo 特有の製品分子です。ラベル、数値、前月比 delta、説明文で構成される指標タイルです。`trend` は delta の着色のみに影響します。`flat` はニュートラルグレーを維持します。横ばいの指標に良し悪しはないためです。以下のプレビューは pingo エンジンによってリアルタイムに再描画され、サイトのテーマ切り替えに追従して明暗が変化します。

:::preview statcard-basic
:::

shadcn の基本部品との組み合わせ関係:StatCard は自己完結型の表示分子であり、内部では Text/View プリミティブのみを使用し、スロットは予約しません。ダッシュボードレイアウトでは、通常 `flexDirection: "row"` の container で複数の StatCard を一行に並べるか、Card や Divider と組み合わせてレポートブロックを構成します。数値のフォーマット(桁区切り、通貨記号)は呼び出し側が行い、`value`/`delta` はどちらも純粋な文字列です。

## 使い方

```tsx
import { StatCard } from "@dopejs/pingo-ui";

root.render(
  <StatCard label="今月の売上" value="¥128,400" delta="+12.5%" trend="up" description="前月比" />,
);
```

## 例

### トレンド着色

`trend` に `"up"` / `"down"` / `"flat"` を指定すると、delta がそれぞれ上昇・下降・ニュートラルの色に染まります。`trend` を渡さない場合は `flat` として扱われます。

### delta なし

`delta` を省略すると数値が単独で 1 行を占め、`trend` は効力を失います。`description` も同様に省略できます。

```tsx
<StatCard label="オンラインデバイス" value="1,024" />
```

## Props

| Prop          | 型                         | デフォルト値 | 説明                                                 |
| ------------- | -------------------------- | ------------ | ---------------------------------------------------- |
| `label`       | `string`                   | —            | 指標名(必須)                                         |
| `value`       | `string`                   | —            | 指標数値。フォーマットは呼び出し側が担当します(必須) |
| `delta`       | `string`                   | —            | 前月比変化。例: `+12.5%`                             |
| `trend`       | `"up" \| "down" \| "flat"` | `"flat"`     | delta の着色方向。他の部分には影響しません           |
| `description` | `string`                   | —            | 下部の説明文。例: 比較期間                           |
| `className`   | `string`                   | —            | コンポーネントのクラス名の後に追加されます           |

## アクセシビリティ

StatCard は `group` セマンティックロールを持ち、アクセシブルネームには `label` が使われます。ラベル、数値、delta はグループ内のテキストとして支援技術によって順に読み上げられます。トレンドを色だけで表現する場合は、`delta` テキスト自体が方向情報(`+`/`-` の接頭辞など)を持つようにし、赤緑の着色だけに依存しないでください。
