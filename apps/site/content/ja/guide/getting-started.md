# クイックスタート

## インストール

```sh
pnpm add @dopejs/pingo
```

ビジネスコードが依存するのは `@dopejs/pingo` の1パッケージのみです。`@dopejs/pingo-host`、`@dopejs/pingo-jsx` などは内部実装パッケージであり、
公開契約には含まれません——[移行スキャナー](/migration)はこれらを直接 import するコードを拒否します。

## 最初のキャンバスをマウントする

```ts
import { createElement, createHostedCanvasRoot } from "@dopejs/pingo";

const canvas = document.querySelector<HTMLCanvasElement>("#app")!;
canvas.width = 800;
canvas.height = 600;

const root = await createHostedCanvasRoot(canvas);

root.render(
  createElement("container", {
    width: 800,
    height: 600,
    backgroundColor: "#ffffffff",
    padding: 24,
    children: createElement("text", {
      value: "Hello pingo",
      fontSize: 24,
      lineHeight: 32,
      color: "#1f2329ff",
    }),
  }),
);
```

`createHostedCanvasRoot` はブラウザの能力を自動検出し、SharedArrayBuffer、postMessage、メインスレッド
Canvas2D の中から転送経路を選択します。フォールバック用の分岐を書く必要はありません。`root.mode` は実際に選択された経路を返します。

## TSX を使用する

`tsconfig.json` を設定します：

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@dopejs/pingo"
  }
}
```

これで次のように書けます：

```tsx
function OrderRow({ index }: { index: number }) {
  return (
    <container width={480} height={32} padding={[6, 12, 6, 12]}>
      <text value={`订单 #${index}`} fontSize={13} lineHeight={20} />
    </container>
  );
}

root.render(<OrderRow index={1} />);
```

## ホスト要素

エンジンに組み込まれている要素は5つだけで、それらは直接 Scene ノードに対応します。CSS のカスケードやセレクターは存在しません：

| 要素           | 用途                                                               |
| -------------- | ------------------------------------------------------------------ |
| `container`    | 汎用グループ化、背景、パディング、変形                             |
| `text`         | テキストラン（シェーピング、折り返し、キャレット幾何は Core から） |
| `scroll`       | Core が所有するスクロール可能コンテナ                              |
| `virtualList`  | Core がウィンドウを計画する仮想リスト                              |
| `editableText` | 編集可能テキストプリミティブ                                       |

`TextField` と `TextArea` は `editableText` の上に組み立てられたウィジェットです（枠線、エラー状態）。
これらが新しい入力経路を導入することはありません。

## 状態と副作用

```ts
import { signal, useEffect, useSignal, useState } from "@dopejs/pingo";

function Counter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCount((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return createElement("text", { value: `已过 ${count} 秒` });
}
```

利用可能なリアクティブプリミティブ：`signal`、`computed`、`effect`、`batch`、`untracked`、
およびフック `useState`、`useSignal`、`useMemo`、`useCallback`、`useRef`、`useEffect`。

::: warning 同期レイアウト読み取りはありません
`useLayoutEffect` のような同期 Worker レイアウト読み取りはサポートされません——レイアウトは別のクロックで発生します。
レイアウト結果が必要な場合は非同期契約を使用し、再描画中に同期的にジオメトリを読み取ろうとしないでください。
:::

## 実行状況の観測

```ts
const root = await createHostedCanvasRoot(canvas, {
  onFrame: (report) => {
    console.log(report.commands, report.displayListBytes, report.core?.sceneNodes);
  },
  onHostError: (error) => report(error),
});
```

`onFrame` は毎フレーム、コマンド数、DisplayList のバイト数、Core 側のダーティ領域カウント、レイアウト作業量、picture hash を提供します。
これはパフォーマンス調査の一次データです。詳細は[診断](/diagnostics)を参照してください。

## 機能ツアー

5つの組み込み要素に加えて、pingo は作成者向けに3層の機能を提供します：

- [基本コンポーネント](/guide/elements)：View/Text/Image、Input/TextArea、SVG/Path などのエンジンレベル要素。
- [スタイル](/guide/styling)：バージョン管理された CSS サブセット——クラスセレクター、インタラクション状態、カスケードと継承の明確な境界。
  変数と mixin が必要な場合はビルド時の [SCSS / Less パイプライン](/guide/scss-less)を使用します。
- [UI コンポーネントライブラリ](/components)：`@dopejs/pingo-ui`。shadcn/ui と整合した完成品コンポーネントで、すべて canvas にレンダリングされます。

## 次のステップ

- [アーキテクチャ概要](/guide/architecture)：Shell と Core の役割分担
- [仮想スクロール](/guide/scrolling)、[テキストと編集](/guide/editing)
- [Playground](/playground)：インタラクティブなライブデモ
