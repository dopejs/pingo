---
title: ベクターグラフィックス：Path と SVG
description: Path ベクター輪郭と SVG ドキュメントサブセット——d 構文、viewBox スケーリング、ストローク、currentColor アイコン。
---

# ベクターグラフィックス：Path と SVG

pingo のベクターグラフィックスは、エンジンが描画する第一級の能力です。パスは不変リソースとして Core 側に存在し、同じアイコンを 50 回描画してもジオメトリは 1 つしか持ちません。入口は 2 つです。`Path` は SVG path データの一部を直接受け取ります。`Svg` は `createSvg` / `loadSvg` が解析したドキュメント全体を受け取ります。下のプレビューはエンジンがリアルタイムに描画し、アイコンの色はサイトのテーマに追従します。

:::preview elements-svg-icon
:::

## Path：単一の輪郭

```tsx
import { createElement, Path, View } from "@dopejs/pingo";

createElement(View, {
  style: { color: "#3157dfff" }, // 輪郭はノードの color で描画され、テキストと同様に継承される
  children: createElement(Path, {
    d: "M20 6 9 17l-5-5",
    viewBox: [0, 0, 24, 24],
    width: 24,
    height: 24,
    strokeWidth: 2,
  }),
});
```

- `d` は完全な SVG path 構文（`M L H V C S Q T A Z` および小文字の相対形式）をサポートします。円弧 `A` は解析時に 3 次ベジェ曲線へ変換されるため、Core に個別の曲線タイプは必要ありません。
- `viewBox` はオーサー空間のボックスで、描画時にノードボックスへスケーリングされます。同じリソースが 16px と 48px のノードのどちらでもそのまま使え、呼び出し側で換算する必要はありません。
- `strokeWidth` を渡さない場合は輪郭を塗りつぶします。非ゼロの値を渡すと、その幅でストロークします（round cap/join）。
- `geometryTransform` はエンコード前にジオメトリのポイントへ焼き込まれます（SVG ドキュメント内の group 変換が動かすのは図形であり、それが属するボックスではありません）。ノードの視覚的な `transform` とは別物です。

:::preview elements-path
:::

## Svg：ドキュメントサブセット

`createSvg(markup)` は `DOMParser` ではなく手書きのパーサーを使います。エンジンはブラウザ、Worker、ヘッドレス差分テストで完全に同一のジオメトリを生成する必要がありますが、`DOMParser` は Worker には存在しないためです。サブセットとは、アイコンセットに実際に含まれる内容です。

- 図形要素：`path` `circle` `ellipse` `rect` `line` `polyline` `polygon`
- 構造要素：`svg` `g` `title` `desc` `defs` `metadata`
- 属性：`fill` `stroke` `stroke-width` `fill-rule` `transform`（`translate`/`scale`/`rotate`/`matrix`。skew はサブセット外）

サブセット外の要素は**名前で拒否**され、`PingoSvgError` がスローされます。呼び出し側は何が失われたのかを明確に把握でき、空白のボックスに直面することはありません。名前付き CSS カラーも同様に拒否されます。色テーブルの半分だけがあると、一部のドキュメントは正常に動作し、別の一部は静かに黒くなるためです。16 進数カラー、`none`、`transparent`、`currentColor` はサブセット内です。`currentColor` は「ノードの色を継承する」と解決されるため、アイコンはテキストと同様にテーマに合わせて色を変えられます（プレビューでの手法）。

`Svg` コンポーネントはドキュメントを**図形ごとに 1 つの path ノード**へ展開し、図形同士は絶対配置で重ねられます。塗りつぶしとストロークの両方を持つ図形は 2 つのノードになります。塗りつぶしとストロークは 2 種類のペイントであり、1 つのノードの半分ではありません。

```ts
import { createSvg, loadSvg, Svg } from "@dopejs/pingo";

const icon = createSvg(`<svg viewBox="0 0 24 24" stroke="currentColor" …>…</svg>`);
createElement(Svg, { source: icon, width: 24, height: 24, style: { color: "#3157df" } });

const remote = await loadSvg("/assets/logo.svg");
```

プログラムによるアクセスが必要な場合、`PingoSvg.shapes` は各図形の `d`、`transform`、塗りつぶし/ストローク、`fillRule` を提供します。`shapeData(name, attributes)` は単一の図形要素を同等の path データへ変換できます。

## Props（Path）

| Prop | 型 | 既定値 | 説明 |
| --- | --- | --- | --- |
| `d` | `string` | — | SVG path データ（必須。パス構文のみで、ドキュメントではない） |
| `viewBox` | `readonly [number, number, number, number]` | — | オーサー空間のボックス。ノードボックスへスケーリングされる |
| `strokeWidth` | `number` | — | 非ゼロの場合、塗りつぶしではなくストロークする |
| `fillRule` | `"nonzero" \| "evenodd"` | `"nonzero"` | 塗りつぶし規則 |
| `geometryTransform` | `readonly [number, number, number, number, number, number]` | 単位行列 | エンコード前にジオメトリへ焼き込まれる変換 |

## Props（Svg）

| Prop | 型 | 既定値 | 説明 |
| --- | --- | --- | --- |
| `source` | `PingoSvg` | — | `createSvg` / `loadSvg` が解析したドキュメント（必須） |

両者は [CommonProps](/api)（`width`/`height`、イベント、セマンティック props など）を継承します。

## アクセシビリティ

ベクターグラフィックス自体にセマンティクスはありません。装飾的なアイコンにラベルは不要です。クリック可能なアイコンボタンには `semanticRole: "button"` と `semanticLabel` を設定してください。詳しくは[アクセシビリティ](/guide/accessibility)を参照してください。
