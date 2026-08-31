---
title: スタイル
description: pingo の CSS サブセット：クラスセレクタ、カスケードと優先度、継承の境界、および pingo-ui のテーマとオーバーライドの規約。
---

# スタイル

pingo のスタイルは**バージョン管理された CSS サブセット**（現在 1.6.0）です。CSS テキストは Shell 側で解析・計算され、
Core は正規化された型付きの値のみを消費します。CSS テキストとセレクタのマッチングが Core に入ることは決してありません。
完全なプロパティ対応表は [CSS subset サポート](/guide/style-support) を参照してください。本ページでは使い方と境界を説明します。

## スタイルシートの作成と登録

`createStyleSheet` で CSS テキストをコンパイルし（入力が不正な場合は `StyleSheetCompileError` をスロー）、
root の作成時に登録します。

```tsx
import { createHostedCanvasRoot, createStyleSheet } from "@dopejs/pingo";

const sheet = createStyleSheet(
  `
  .card {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 16px;
  }
  `,
  { sourceName: "app.css" },
);

const root = await createHostedCanvasRoot(canvas, { styleSheets: [sheet] });

root.render(
  <container className="card" width={320}>
    <text value="你好" fontSize={14} />
  </container>,
);
```

例外を処理したくない場合は `compileStyleSheet` を使用できます。これは作成者の入力に対して例外をスローせず、安定した
diagnostics を返します。スタイルシートは型安全なオブジェクト形式（`PingoStyleSheetObject`）としても記述できます。キーは
先頭ドットの有無を問わないクラスセレクタ、値は `PingoStyle` です。

```ts
const sheet = createStyleSheet({
  "card": { backgroundColor: "#ffffffff", borderRadius: 8, padding: 16 },
  "card:hover": { backgroundColor: "#f5f5f5ff" },
});
```

要素は `className` prop でクラスを付与し（ASCII 空白区切りの複数クラス名）、`style` prop で
インライン宣言を記述します（`PingoStyle`。Shell で解析されてから Core に入ります）。

## セレクタとカスケード

サブセットは**同一ノード上のクラスセレクタ**と、4 つのインタラクション状態疑似クラスのみをサポートします。

- 単一クラス `.card`。複合クラス `.pui-card.pui-dark`（ノードが全クラスを同時に持つ場合のみマッチ）。
- 状態 `:hover`、`:active`、`:focus`、`:focus-visible`。クラスと複合可能（例：`.btn:hover`）。

非サポート：要素セレクタ、子孫・子などのコンビネータ、`@media` / `@supports` / `@keyframes`、
`var()` / `calc()`。長さの単位は `px` と `%` のみです（`em` / `rem` / `vw` / `vh` は拒否されます）。
色は hex または `rgb()` / `rgba()` / `hsl()` / `hsla()` で記述します（新旧両方の構文に対応）。
色キーワード（`red` など）はサポートされません。

カスケード規則は CSS と同型ですが、よりシンプルです。

1. **優先度（specificity）＝ クラス数 + 状態数**。`.pui-card.pui-dark`（2）は `.card`（1）より優先されます。
2. **同じ優先度なら source order に従う**：後から登録されたスタイルシート、同じシート内で後方のルールが有効になります。
3. **インラインの `style` prop はすべてのスタイルシートルールより優先**されます。要素上の直接 props（`width`、
   `backgroundColor` など）が最も優先度が高く、`style` よりも優先されます。

第 2 条の帰結に注意してください。オーバーライドの有効性は**スタイルシートの登録順**に基づき、クラス名の `className`
文字列内での前後関係とは無関係です。

## 継承と計算スタイルの境界

継承されるプロパティは少数です。`color`、`visibility`、`font-family` / `font-size` / `font-weight` /
`font-style`、`line-height`、`text-align`、`white-space`、`overflow-wrap`、
`pointer-events`、`cursor`。それ以外のプロパティ（すべてのレイアウトプロパティを含む）は各ノードが初期値から開始し、
書かなければ存在しません。「親から幅を継承する」といった挙動は存在しません。

各プロパティは単一ソースのスキーマで自身の無効化ドメイン（レイアウト/描画/ヒット/セマンティクス）を宣言します。`opacity` を
変更しても再レイアウトは発生せず、`width` を変更すると発生します。これは[アーキテクチャ](/guide/architecture)の無効化モデルと
同じ仕組みです。

### インタラクション状態で宣言できるプロパティは制限される

状態ルール（`.btn:hover` など）では描画系プロパティのみ許可されます。`background-color`、`color`、
`opacity`、各辺の `border-*-color`、`border-radius`、`box-shadow`、`visibility`、
`transform` / `transform-origin`、`pointer-events`、`cursor`。状態ルールでレイアウトプロパティを書くと
コンパイル時に拒否されます。状態の切り替えがレイアウト変更を引き起こすことはできません。

## CSS との主な相違点

サブセットは意図的に完全な CSS 互換を実装していません。主な相違点（完全な一覧は [CSS subset サポート](/guide/style-support) を参照）：

- `position: absolute` の包含ブロックは**親ノード**であり、最も近い positioned 祖先ではありません。
  `position: relative` はなく、視覚的なオフセットには `transform` を使います。
- `flex-wrap` はありません。flex コンテナは単一行で、主軸のあふれはクリップまたはスクロールされます。
- flex item に自動最小サイズはなく、0 まで縮小可能です（ブラウザで `min-width: 0` を書くのと同等）。
  `min-width: auto` / `min-height: auto` は直接コンパイルエラーになります。
- 主軸サイズが不定の場合、パーセンテージは CSS の `auto` ではなく `0` として解決されます。
- `box-shadow` は外側の影のみ、ノードごとに最大 4 層までで、`inset` は拒否されます。
- `z-index` は兄弟間でのみ安定して再配置され、スタッキングコンテキストはありません。

## pingo-ui のテーマとオーバーライドの規約

`@dopejs/pingo-ui` コンポーネントライブラリのスキンは、上記の仕組みでコンパイルされた 1 枚のスタイルシートです。

```ts
import { createHostedCanvasRoot, createStyleSheet } from "@dopejs/pingo";
import { createPingoUiStyleSheet } from "@dopejs/pingo-ui";

const myOverrides = createStyleSheet(`
  .pui-button { border-radius: 4px; }
`);

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [createPingoUiStyleSheet(), myOverrides], // 順序を逆にしないこと
});
```

- **`createPingoUiStyleSheet()` は root ごとに独立した不変のシートを 1 枚作成します**。
- **ユーザーシートは pingo-ui シートの後に登録する必要があります**。同じ優先度なら source order で上書きされ、
  後から書いた方が有効になります。コンポーネントの `className` prop はコンポーネント自身のクラス名の後に追記されます
  （例：`pui-input pui-input--disabled mine`）。ただし上書きできるかどうかは上記の登録順のみに依存します。
- 上書きの優先度を高めたい場合は、複合クラスで specificity を上げてください（例：`.pui-button.mine`）。
  記述位置に依存させるのは避けてください。

### ライト/ダークテーマ

```ts
import { setTheme, useTheme } from "@dopejs/pingo-ui";

setTheme("dark"); // すべての購読コンポーネントが自動で再描画される
useTheme(); // コンポーネントの render 内で読み取り・購読する
```

テーマはモジュールレベルの signal です。コンポーネントの render 内で `useTheme()` が自動購読し、`setTheme` がすべての
購読コンポーネントの再描画をトリガーします。ダークは compound class で実装されます。dark テーマではコンポーネントに `pui-dark`
マーカークラスが付与され、スキン内の `.pui-x.pui-dark` 複合ルールがマッチします（例：`.pui-card.pui-dark`）。

**ブランドカスタマイズはビルド時の挙動です**。新しい preset を作成するには
`@use "@dopejs/pingo-ui/styles/tokens" with ($primary: ...)` で token を上書きし、
`@dopejs/pingo-style-preprocess` の Vite プラグインでコンポーネントスキンを再コンパイルします。ブランドカラーの変更 = 再
ビルドであり、実行時に切り替えることはできません。token 値の色も同様に hex または
`rgb()` / `rgba()` / `hsl()` / `hsla()` のみ使用できます。SCSS/Less パイプラインについては
[SCSS / Less ガイド](/guide/scss-less) を参照してください。
