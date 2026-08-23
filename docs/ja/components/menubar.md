---
title: Menubar
description: デスクトップスタイルのアプリケーションメニューバー。複数のメニューが 1 つのオープンスロットを共有。
---

# Menubar

Menubar は同じオープンスロットを共有するメニューの列で、デスクトップアプリのメニューバーのようなものです。
下のプレビューは pingo エンジンによるリアルタイムレンダリングです。「ファイル」「編集」などのラベルを
クリックすると対応するメニューが開閉し、サイトのテーマに合わせて明暗が切り替わります。

:::preview menubar-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { Menubar, MenubarMenu } from "@dopejs/pingo-ui";

root.render(
  createElement(Menubar, {
    onValueChange: (value) => {},
    children: [
      createElement(MenubarMenu, {
        value: "file",
        label: "ファイル",
        children: createElement("text", { value: "新規作成" }),
      }),
      createElement(MenubarMenu, {
        value: "edit",
        label: "編集",
        children: createElement("text", { value: "元に戻す" }),
      }),
    ],
  }),
);
```

`MenubarMenu` はコンテキスト経由でメニューバーの状態を読み取るため、`Menubar` の子ノードである必要が
あります。その `children` は開いたときに表示されるパネルコンテンツです。開閉はデフォルトで非制御で、
`value` を渡すと制御モードに切り替わります（値は現在開いているメニューの `value`）。

## 例

### 制御されたオープン

`value` を渡して開くメニューを固定します。初期のガイドや外部状態との同期によく使われます。

:::preview menubar-open
:::

## Props

### Menubar

| Prop | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 制御：現在開いているメニューの値 |
| `onValueChange` | `(value: string \| undefined) => void` | — | 開いているメニューが変化したときのコールバック（閉じたときは `undefined`） |
| `children` | `PingoNode` | — | 複数の `MenubarMenu`（必須） |
| `className` | `string` | — | 追加するクラス名 |
| `navigation` | `boolean` | `false` | ナビゲーションセマンティクスを使用（[NavigationMenu](/ja/components/navigation-menu) が内部で使用） |

### MenubarMenu

| Prop | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `value` | `string` | — | メニュー識別子（必須） |
| `label` | `string` | — | バー上に表示するラベル（必須） |
| `children` | `PingoNode` | — | 開いたときのパネルコンテンツ（必須） |
| `className` | `string` | — | 追加するクラス名 |

## アクセシビリティ

メニューバーは menubar セマンティクスを、ラベルは menuitem セマンティクスを持ち、expanded/collapsed 状態を
公開します。左右の矢印キーでメニュー間を移動でき、メニューが開いているときも同様に切り替わります。
`Escape` で閉じて現在のラベルにフォーカスします。
