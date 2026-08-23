---
title: 基本要素：View、Text、Image
description: Viewコンテナとflexレイアウト、Textテキスト描画、ImageビットマップとPingoFontによる明示的フォント。
---

# 基本要素：View、Text、Image

pingoのホスト要素はSceneノードに直接対応し、CSSカスケードやセレクタマッチングのオーバーヘッドは存在しない（スタイル機能については[スタイル](/guide/styling)を参照）。本ページでは、最も基本的な3つの要素である汎用ボックス `View`、テキスト `Text`、ビットマップ `Image` を扱う。以下のプレビューはpingoエンジンによってリアルタイムに描画され、サイトテーマに追従して明暗が切り替わる。

:::preview elements-layout
:::

## Viewとレイアウト

`View` は汎用グループボックス（`container` ホスト要素に対応）であり、新しいSceneノード種別を導入しない。

- `width` / `height` / `minWidth` / `maxWidth` / `padding` / `backgroundColor` / `opacity` /
  `transform` は直接propsであり、`padding` は数値または `[上, 右, 下, 左]` の4要素タプルを受け付ける。
- `flexDirection`、`justifyContent`、`alignItems`、ボーダー、角丸は `style` インライン経路を通す
  （型付きCSSサブセット。詳細は[スタイル](/guide/styling)を参照）。
- 子要素の間隔は固定サイズのコンテナで明示的に表現する。プレビュー内の `row` / `column` ヘルパーはこのように実装されている。

## 使用例

```tsx
import { createElement, Text, View } from "@dopejs/pingo";

root.render(
  createElement(View, {
    width: 420,
    padding: 16,
    backgroundColor: "#ffffffff",
    style: { flexDirection: "column", borderRadius: 10 },
    children: [
      createElement(Text, { value: "标题", fontSize: 24, lineHeight: 32, fontWeight: 700 }),
      createElement(View, { height: 8 }),
      createElement(Text, { value: "正文", fontSize: 14, lineHeight: 22 }),
    ],
  }),
);
```

## Text：テキストラン

テキストのシェーピング、改行、計測はすべてCoreが行う。中国語と英語の混在、絵文字、結合文字のいずれもShellの関与を必要としない。内容は `value` または文字列の `children` で指定する。

:::preview elements-text
:::

### Props（Text）

| Prop         | 型                 | デフォルト値 | 説明                                                           |
| ------------ | ------------------ | ------------ | -------------------------------------------------------------- |
| `value`      | `string`           | —            | テキスト内容（`children` との排他指定）                        |
| `children`   | `string \| number` | —            | テキスト内容                                                   |
| `color`      | `Color`            | `#000000ff`  | テキスト色。継承可能                                           |
| `fontSize`   | `number`           | —            | フォントサイズ（論理ピクセル）                                 |
| `lineHeight` | `number`           | —            | 行高（論理ピクセル）                                           |
| `fontWeight` | `number`           | —            | フォントウェイト                                               |
| `fontFamily` | `string`           | —            | CSSフォントファミリー                                          |
| `font`       | `PingoFont`        | —            | 明示的な不変フォント。非対応の入力は全体がフォールバックされる |

`Text` はすべての [CommonProps](/api)（サイズ、padding、イベント、`semanticRole` /
`semanticLabel` など）も継承する。

## Image：ビットマップ

`Image` の `source` は `PingoImage`——Shell側が保持する**不変のRGBA8ビットマップ**であり、コミット境界でSceneリソースとしてインライン同期される。`createImage` で生成し、ピクセルをコピーして検証する。

```ts
import { createImage, Image } from "@dopejs/pingo";

const icon = createImage(pixels, 96, 96, { label: "应用图标" });
createElement(Image, { source: icon, width: 48, height: 48 });
```

`width` / `height` を渡さない場合、ノードは画像のピクセルサイズを採用する。渡した場合はノードボックスにスケーリングされる。`label` はアクセシビリティ名であり、空にすると装飾画像として扱われる。

:::preview elements-image
:::

ピクセルを選択しエンコード済みバイト列を選ばないのは意図的なトレードオフである。リソーストランザクションはコミット境界で同期的に反映されるが、あらゆるエンコーディング形式は非同期デコードを必要とする。リストのサムネイルのような小画像はこの経路に適しており、大きな画像は非同期ステージングを備えたエンコード経路を使うべきである。

## フォント：PingoFontとloadFont

`Text` / 編集可能要素の `font` propは、明示的な不変SFNTフォント（TTF/OTF/TTC）を受け取り、Coreが決定的にシェーピングする。`createFont` はデコード済みのSFNTバイト列を受け取る。`loadFont` はさらにネットワーク読み込みとWOFF/WOFF2デコードを処理する。

```ts
import { loadFont } from "@dopejs/pingo";

const inter = await loadFont("/fonts/Inter-Regular.woff2", {
  fallbackFamily: "sans-serif",
});
createElement(Text, { value: "Hello", font: inter, fontSize: 16 });
```

`PingoFontOptions`：`faceIndex`（TTCコレクション内のフェイスインデックス。デフォルト `0`）と
`fallbackFamily`（明示的フォント経路が全体としてフォールバックされる際に使用するCSSファミリー。デフォルト `"sans-serif"`）。
読み込みに失敗すると、安定した `code` を持つ `PingoFontLoadError` がスローされる（例：`fetch-failed`、`decode-failed`、
`unsupported-format`）。

## アクセシビリティ

`semanticRole` と `semanticLabel` は全要素に共通するpropsである。見出し、ボタン、領域はいずれも要素上で意味を付与すべきであり、`Image` の名前は `createImage` の `label` に由来する。セマンティックスナップショットはcanvas脇のDOMシャドウツリーにミラーリングされる。詳細は[アクセシビリティ](/guide/accessibility)を参照。
