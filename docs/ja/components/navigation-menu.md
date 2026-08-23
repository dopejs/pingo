---
title: Navigation Menu
description: サイトナビゲーションスタイルのメニューバー。挙動は Menubar と同一でセマンティクスはナビゲーション。
---

# Navigation Menu

Navigation Menu はナビゲーションセマンティクス版の [Menubar](/ja/components/menubar) です。同じトリガー行と
展開パネルを持ちますが、外部には navigation セマンティクスを公開するため、サイトのメインナビゲーションに
適しています。下のプレビューは pingo エンジンによるリアルタイムレンダリングで、サイトのテーマに合わせて
明暗が切り替わります。

:::preview navigation-menu-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { MenubarMenu, NavigationMenu } from "@dopejs/pingo-ui";

root.render(
  createElement(NavigationMenu, {
    onValueChange: (value) => {},
    children: [
      createElement(MenubarMenu, {
        value: "products",
        label: "プロダクト",
        children: createElement("text", { value: "レンダリングエンジン" }),
      }),
      createElement(MenubarMenu, {
        value: "docs",
        label: "ドキュメント",
        children: createElement("text", { value: "クイックスタート" }),
      }),
    ],
  }),
);
```

項目は `MenubarMenu` を再利用します。開閉はデフォルトで非制御で、`value` を渡すと制御モードに切り替わります。
インタラクションの挙動（キーボードナビゲーション、オープンスロットの共有）は Menubar と完全に同じです。

## Props

`NavigationMenu` は `MenubarProps` のうち `navigation` 以外のすべての props を受け取ります。

| Prop | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 制御：現在開いているメニューの値 |
| `onValueChange` | `(value: string \| undefined) => void` | — | 開いているメニューが変化したときのコールバック（閉じたときは `undefined`） |
| `children` | `PingoNode` | — | 複数の `MenubarMenu`（必須） |
| `className` | `string` | — | 追加するクラス名 |

項目の props については [Menubar](/ja/components/menubar#menubarmenu) を参照してください。

## アクセシビリティ

コンテナは navigation セマンティクスを、ラベルは menuitem セマンティクスを持ち、expanded/collapsed 状態を
公開します。左右の矢印キーで項目間を移動し、`Escape` で閉じて現在のラベルにフォーカスします。
