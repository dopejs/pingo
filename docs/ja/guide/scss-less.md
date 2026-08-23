---
title: SCSS / Less
description: SCSS または Less で pingo スタイルシートを記述する：ビルド時コンパイルパイプライン、Vite プラグイン、安全境界とエラー診断。
---

# SCSS / Less

pingo の CSS サブセット（[スタイルガイド](/guide/styling)参照）は、ランタイムで CSS テキストまたはオブジェクトのみを受け付ける。
変数、mixin、`@use` / import などのオーサリング体験を利用するには、**ビルド時コンパイル**を使う。SCSS/Less は Node 側で
`@dopejs/pingo-style-preprocess` によって CSS にコンパイルされ、既存の `compileStyleSheet` による検証を経て、
デフォルトエクスポート `PingoStyleSheet` を持つ JavaScript モジュールを生成する。

**Sass と Less がブラウザバンドル、facade、Core に入ることはない**——ランタイムにはプリプロセッサは存在せず、
元からある軽量 CSS コンパイラのみである。サブセット境界もこれによって広がらない。子孫セレクタ、`@media`、
`var()`、`calc()`、`em/rem/vw/vh` などは引き続き既存の診断で拒否され、ビルドは失敗し、黙って通すことはない。

## 2 種類の import セマンティクスを分けて扱う

### 通常の DOM スタイル（Vite ネイティブ）

```ts
import "./site.scss";
import "./probe.less";
```

この経路は Vite 標準の CSS プリプロセス機能であり、出力は **DOM CSS** で、Vite が注入または抽出する。
ドキュメントサイトや Storybook のシェルといった DOM ページにのみ適用され、**`PingoStyleSheet` は生成されない**。
canvas 内のスタイルには使用しないこと。

### pingo スタイルシート（`?pingo-style`）

```ts
import { createHostedCanvasRoot } from "@dopejs/pingo";
import buttonSheet from "./button.scss?pingo-style";
import themeSheet from "./theme.less?pingo-style";

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [buttonSheet, themeSheet],
});
```

`?pingo-style` は明示的な型境界である。ビルド時にプリプロセスを行い、CSS サブセットで検証し、生成される ESM
モジュールはデフォルトで `PingoStyleSheet` をエクスポートし、**DOM に CSS を一切注入しない**。

## Vite プラグイン

Node 専用ツールパッケージをインストールする（Node >= 22.12、Vite ^8 が必要）：

```sh
pnpm add -D @dopejs/pingo-style-preprocess
```

`vite.config.ts` に登録する：

```ts
import { pingoStylePreprocess } from "@dopejs/pingo-style-preprocess/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    pingoStylePreprocess({
      // 任意：追加の Sass load paths / Less paths
      scssLoadPaths: ["styles"],
      lessPaths: ["styles"],
      // 任意：依存先がこれらのディレクトリ内に収まる必要がある（既定は entry のディレクトリと load paths のみ）
      allowRoots: ["src", "styles"],
    }),
  ],
});
```

型宣言はパッケージの `./client` エントリから提供され、`tsconfig.json` で一度参照すればよい：

```json
{
  "compilerOptions": {
    "types": ["@dopejs/pingo-style-preprocess/client"]
  }
}
```

プラグインの動作規約：

- 正確なクエリフラグ `pingo-style` と `.scss` / `.less` 拡張子の組み合わせのみを対象とする。それ以外のファイルは影響を受けない。
- virtual module によって Vite ネイティブの CSS パイプラインから隔離され、プリプロセスの重複や DOM CSS の注入は発生しない。
- entry とすべての partial/import が watch graph に入る——**token や mixin の変更は
  HMR と本番リビルドをトリガーし**、手動でのキャッシュクリアは不要である。
- いずれかの error レベルの診断があればビルドは失敗して終了する。warning はソース位置付きで出力される。HMR のコンパイルに失敗した場合は、直近に
  コミット済みのモジュールを保持し、dev server でエラーを報告する。
- 生成されたモジュールは初期化時に `CSS_SUBSET_VERSION` を検証する。ランタイム facade とビルド時検証で
  使用されたサブセットバージョンが一致しない場合、モジュールロード時に即座にエラーを投げ、2 つのセマンティクスが混在して動作することはない。
- dev、production、SSR の 3 環境で意味的に同一のスタイルシートを生成する。

## Node コンパイル API

Vite 以外のビルドシステム（CLI、codegen）では Node API を直接使用できる：

```ts
import {
  compileLessString,
  compilePingoStyleFile,
  compileScssString,
  createStyleSheetFromLess,
  createStyleSheetFromScss,
} from "@dopejs/pingo-style-preprocess";
```

- `compileScssString(source, options)`：同期であるため、**import を含まないソースコードのみを処理する**。
  import がある場合は `file-api-required` 診断を返す。
- `compileLessString(source, options)`：非同期（Less の `render` は Promise）。絶対パスの
  `sourceName` を指定した場合のみ相対 import を解決する。
- `compilePingoStyleFile(filename, options)`：非同期のファイル API で、Vite プラグインはこれを使用する。
  相対解決の基準が明確で、依存グラフが完全である。
- `compile*` 系はオーサー入力のエラーに対して**例外を投げず**、`styleSheet: null` と安定ソートされた
  diagnostics を返す。`createStyleSheetFromScss` / `createStyleSheetFromLess` は例外を投げる
  便利なラッパーで、オーサーのエラーは一律 `StylePreprocessError` を投げ、すべての diagnostics を保持する。

返される `StylePreprocessResult` には `cssText`、`styleSheet`、`diagnostics`、
`dependencies`（完全な依存ファイルリスト。自作の watch に使用可能）が含まれる。

## Source map とエラー診断

各診断にはステージマーカーが付与される：

| `stage`       | 来源                                       |
| ------------- | ------------------------------------------ |
| `"scss"`      | Sass コンパイル例外（構文エラー、未定義変数など）     |
| `"less"`      | Less コンパイル rejection                        |
| `"pingo-css"` | 生成物が CSS サブセットを超えた場合の `compileStyleSheet` 診断 |

両コンパイラとも source map を有効にしており、pingo CSS 診断の生成位置は**元の
SCSS/Less ファイルと行・列へのマッピングを可能な限り試みる**（`sourceLocation`）。マッピングできない場合は生成位置
（`generatedLocation`）と entry 名を保持し、元の位置を偽造することはない。診断は生成位置と code で
安定ソートされ、CI 出力と snapshot は再現可能である。

## 安全境界

プリプロセッサはビルド時にオーサーコードを実行するため、既定で制限を強化する：

- **Sass**：custom importer、custom function、Node package importer は開放しない。
  `file:` 依存のみを受け付ける。
- **Less**：`javascriptEnabled: false` に固定し、plugins は渡さず、事前スキャンで `@plugin` を拒否する。
  HTTP(S) またはプロトコル相対 import は許可しない。
- **共通の制限**：依存は canonicalize 後、allow roots（entry のディレクトリ + 明示的な
  load paths）内に存在しなければならない。symlink による脱出、非ファイル依存、リモート依存はすべて拒否する。コンパイル後の CSS は先に
  1,048,576 code-unit の上限を通ってからサブセット検証に入る。entry、依存数、依存の総バイト数には明示的な
  予算があり、超過時は安定したビルドエラーを生成する。
- コンパイラバージョンは lockfile で固定され、fixture の CSS、diagnostics、依存リストは
  reproducibility snapshot の対象である。Sass/Less のアップグレード時は出力差分の明示的なレビューが必要である。

これらの制限は `?pingo-style` ツールチェーンのみを拘束する。通常の DOM 向け `.scss` / `.less` は引き続き Vite
自身の設定に従う。

## 色関数

プリプロセッサは色関数を出力することが多い。サブセットはそのために `rgb()` / `rgba()` / `hsl()` / `hsla()`
（レガシーなカンマ形式とモダンな space/slash 形式の両方）をサポートし、8-bit RGBA に正規化する。この集合を超える
出力——`color(display-p3 ...)`、CSS カスタムプロパティ、`calc()`——は引き続きビルドが失敗する。
