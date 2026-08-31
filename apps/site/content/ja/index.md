---
layout: home

hero:
  name: Pingo
  text: canvas レンダリングエンジン
  tagline: Rust/WASM コア + TypeScript シェル + プラガブルバックエンド。高性能インタラクション、ネイティブ仮想スクロール、canvas 内テキスト編集のために設計され、基本コンポーネント、CSS スタイル、shadcn に整合した UI コンポーネントライブラリを同梱。
  image:
    light: /pingo-mark.svg
    dark: /pingo-mark-dark.svg
    alt: Pingo
  actions:
    - theme: brand
      text: クイックスタート
      link: /guide/getting-started
    - theme: alt
      text: Playground
      link: /playground
    - theme: alt
      text: GitHub
      link: https://github.com/dopejs/pingo

features:
  - title: デュアルクロック、メインスレッドが固まってもフレーム落ちなし
    details: UI クロックとレンダリングクロックは相互に独立。スクロール、アニメーション、レイアウト、合成は Worker 内で閉じて進行し、メインスレッドが 200ms ブロックされても描画は連続する。
  - title: ネイティブ仮想スクロール
    details: プレフィックスサムツリー、方向予測プリフェッチ、プレースホルダー補完がすべて Core 内で動作。100 万行の固定フィクスチャにおける 20,000 フレーム再生の P95/P99 はサブマイクロ秒級で、スクロール定常時にシェルへのコールバックは一切発生しない。
  - title: canvas ネイティブ編集
    details: キャレット、選択範囲、ドラッグ選択、ダブルクリックでの単語選択、IME composition、候補ウィンドウ配置、クリップボード、取り消し・やり直しをすべてエンジンが実装。入力機能のために HTML コントロールを作成する必要がない。
  - title: アクセシビリティはアーキテクチャの一部
    details: Core がセマンティックツリーをエクスポートし、ホストは canvas 隣に DOM シャドウツリーとしてミラーリングする。スクリーンリーダーが利用でき、E2E はピクセル比較ではなく role/label で要素を選択できる。
  - title: 決定性と差分テスト
    details: バージョン管理されたバイナリストリーム、注入可能なクロックと乱数ソース、録画再生、および増分と全量、最適化と素朴な実装、wasm と native の差分オラクル。
  - title: 自動フォールバック、常に退路あり
    details: SharedArrayBuffer → postMessage → メインスレッド Canvas2D を能力に応じて自動選択し、機能は等価。移行レイヤーはページ単位のグレースケール展開とワンクリックのロールバックに対応。
  - title: 基本コンポーネントがそのまま使える
    details: View/Text/Image、Input/TextArea、SVG/Path などのエンジン級要素が直接 Scene ノードに対応し、テキストシェーピング、キャレット幾何情報、編集機能は Core から提供され、DOM コントロールの寄せ集めが不要。
  - title: CSS と SCSS/Less サポート
    details: シェル側で解析するバージョン管理された CSS サブセット。クラスセレクター、インタラクション状態、継承、計算済みスタイルには明確な境界があり、SCSS/Less はビルド時にコンパイル検証され、プリプロセッサはブラウザバンドルに入らない。
  - title: shadcn に整合した UI コンポーネントライブラリ
    details: "@dopejs/pingo-ui のコンポーネント API とスキンセマンティクスは shadcn/ui に整合し、Button、Dialog、Table、Calendar などがすべて canvas にレンダリングされ、ライト/ダークテーマとスタイルシートによる上書きに対応。"
---

## 30 秒で始める

```sh
pnpm add @dopejs/pingo
```

```ts
import { createHostedCanvasRoot, Text, View } from "@dopejs/pingo";

const root = await createHostedCanvasRoot(document.querySelector("canvas")!);

root.render(
  View({
    style: { width: 480, height: 640, overflowY: "auto" },
    virtual: {
      itemCount: 1_000_000,
      estimatedItemSize: 32,
      renderItem: (index) => Text({ value: `第 ${index} 行` }),
    },
  }),
);
```

100 万行がシェル側で実体化されることはなく、スクロール中もコンポーネントツリーへのコールバックは発生しない。ウィンドウ計算と補完はすべて Core 内で行われる。

## やらないこと

Pingo はレンダリングエンジンであり、ブラウザではない。**行わない**のは SSR/HTML 初期表示、汎用 CSS 互換性（ボックスモデル、カスケード、セレクター）、
ミニアプリやネイティブ向けアダプテーションレイヤー、そして業務レベルのリッチテキストセマンティクス（コラボレーション、数式、Markdown コマンド）である。

エンジンは**確かに持っている**——キャレット、選択範囲、IME、クリップボード、取り消し・やり直し、編集可能テキストプリミティブを。これらが業務層に押し戻されて DOM コントロールで寄せ集められることはない。

実機性能、実入力メソッド、スクリーンリーダー、メディア消費電力マトリクスはプラットフォーム適格性の収集項目として個別に追跡し、
bidi ビジュアルナビゲーションと WebGPU バックエンドのデフォルト有効化は[記録済みの延期項目](https://github.com/dopejs/pingo/blob/main/docs/plan.md)である。
