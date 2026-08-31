---
title: TSX
description: TSX で pingo コンポーネントを書く方法と、同じリポジトリで React と共存させる方法。
---

# TSX で pingo を書く

## 設定

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@dopejs/pingo"
  }
}
```

`jsx` は TypeScript の自動ランタイムを指し、`jsxImportSource` はその向き先を React では
なく pingo の `jsx-runtime` にします。`react-jsx` という名前は変換モードの名称であって、
React とは関係ありません。

## タグにできるもの

```tsx
import { createContext, memo, Text, useState, View, type PingoNode } from "@dopejs/pingo";
import { Button } from "@dopejs/pingo-ui";

const Theme = createContext("light");

function Row({ label }: { readonly label: string }): PingoNode {
  const [count, setCount] = useState(0);
  return (
    <View width={240} padding={8}>
      <text value={`${label} ${count}`} />
      <Button onPress={() => setCount(count + 1)}>加算</Button>
    </View>
  );
}

root.render(
  <Theme.Provider value="dark">
    <Row label="クリック数" />
  </Theme.Provider>,
);
```

次の五つの形すべてが使えます。

| 形                             | 例                                                    |
| ------------------------------ | ----------------------------------------------------- |
| 組み込み要素                   | `<container>`、`<text>`、`<scroll>`、`<editableText>` |
| 基礎コンポーネント             | `<View>`、`<Text>`、`<Image>`、`<Input>`              |
| 自分で書いた関数コンポーネント | `<Row label="…" />`                                   |
| `memo` でラップしたもの        | `@dopejs/pingo-ui` のすべてのコンポーネント           |
| context provider               | `<Theme.Provider value={…}>`                          |

::: warning hooks を使うコンポーネントは呼び出さずにマウントする
`Row({ label })` は型検査を通りますが、`hooks may only run in a function component`
で失敗します。hooks には reconciler が用意するコンポーネントスコープが必要です。
`<Row label="…" />` と書いてください。
:::

戻り値の型に `PingoNode` を書いて構いません。`PingoNode` は `undefined` を含みますが、
JSX タグとの適合はエンジンの `JSX.ElementType` 宣言が担うので、シグネチャを書き換える
必要はありません。

## React との共存

一つのリポジトリに React と pingo の TSX ファイルが同居するのは普通のことです。たとえば
外側を React で書き、性能が要る領域を pingo で描く場合です。

### 仕組みはファイル先頭の宣言

`jsxImportSource` の粒度は**ファイル**です。pingo のファイルの一行目にこう書きます。

```tsx
/** @jsxImportSource @dopejs/pingo */
```

プロジェクトの `tsconfig.json` は React 設定のままで、この行のあるファイルだけが pingo の
ランタイムを使います。`tsc`、esbuild/Vite、babel のいずれもこれを解釈します。

**ほかの二つの案は成立しません**（実測）。

| やり方                                                           | 結果                                                                                                        |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| ディレクトリに `jsxImportSource` を変えた `tsconfig.json` を置く | `tsc` は完全に無視し、Vite は解釈する — ビルドと型検査の結論が食い違う                                      |
| `exclude` でファイル名を除外する                                 | `exclude` はルートファイルの選択にしか効かず、React ファイルが `import` した時点で React として取り込まれる |

ファイル名で本当にツールチェインを切り替えるには composite project references が必要です
（pingo プロジェクトが `.d.ts` を出し、React プロジェクトはソースではなく宣言を読む）。

この一行を忘れても黙って壊れることはなく、コンパイル時にエラーになります。

```
error TS2322: Type 'Element' is not assignable to type 'PingoNode'.
error TS2786: 'View' cannot be used as a JSX component.
```

### ファイル名の接尾辞は規約

二種類のファイルが同じディレクトリに並ぶときは、pingo のファイルに `scene.pingo.tsx` の
ような接尾辞を付けることを勧めます。ファイル一覧で区別でき、babel の `overrides` のような
ファイル名ベースの設定にも使えます。これは人と設定のための規約であり、**先頭の宣言の
代わりにはなりません**。ディレクトリ全体が pingo なら、ディレクトリ自体が印になるので
接尾辞はノイズです。

### 境界はファイル境界

一つのファイルには一種類の JSX しかないので、**React コンポーネントの中に pingo のタグは
書けません**。pingo のファイルがシーンをエクスポートし、React のファイルがそれを取り込みます。

```tsx
/** @jsxImportSource @dopejs/pingo */
// scene.pingo.tsx
import { Text, View, type PingoNode } from "@dopejs/pingo";

export function scene(label: string): PingoNode {
  return (
    <View width={240} height={80} padding={12}>
      <Text value={label} />
    </View>
  );
}
```

### `PingoContainer` でマウントする

```tsx
// App.tsx —— このファイルのタグは React のもの
import { PingoContainer } from "@dopejs/pingo/react";

import { scene } from "./scene.pingo";

export function App() {
  return <PingoContainer scene={scene("Hello")} style={{ height: 320, width: 480 }} />;
}
```

シーンは children ではなく `scene` プロパティで渡します。このファイルのタグは React の
ものなので、pingo の children は書けないからです。

`PingoContainer` は React に canvas を描かせて ref を取るのではなく、自分で canvas を
作ります。これは**必須**です。root は canvas を OffscreenCanvas へ移譲し、その移譲は
恒久的で、React StrictMode は開発時に effect を二度走らせます。React が持つ canvas は
二つ目の root に渡され、こう失敗します。

```
this canvas already transferred control to an OffscreenCanvas and cannot host
a second root; create a new canvas element per root
```

コンポーネントが作った canvas は破棄されたマウントと一緒に消えるので、これは起きません。
サイズも気にする必要はありません。root は canvas 自身のボックスに追従するので、コンテナに
CSS でサイズを与えれば十分です。

root が必要なとき（スクロール操作や診断コールバック）は `onRoot` を、起動失敗は
`onStartupError` を使います。実行時のエラーは従来どおり `options.onHostError` に届きます。

### 二つのツリーは状態を共有しない

React の state と context は pingo のコンポーネントツリーに流れ込みませんし、その逆もあり
ません。独立した二つの reconciler です。境界を越える通信は普通のデータフローです。React 側で
値を決めて `scene` として渡し、pingo 側はイベントコールバックで結果を返します。

## このリポジトリ自体が例

`apps/site` は React アプリケーションであり、同時に 73 個の pingo TSX コンポーネント
プレビューを含みます。両者が同居するディレクトリは
[`apps/site/src/interop`](https://github.com/dopejs/pingo/tree/main/apps/site/src/interop)
で、そのテストは `StrictMode` の下で走ります。
