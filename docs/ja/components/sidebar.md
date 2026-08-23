---
title: Sidebar
description: 製品ナビゲーションサイドバー：グループ、項目、選択状態を pingo キャンバス上に描画します。
---

# Sidebar

Sidebar はアプリケーションレベルのナビゲーション列で、グループ（Section）と項目（Item）から構成され、選択状態とキーボードナビゲーションを内蔵しています。下のプレビューは pingo エンジンによってリアルタイムに描画されます。項目をクリックするか、フォーカス後に方向キーで切り替えます。

:::preview sidebar-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { Sidebar, SidebarItem, SidebarSection } from "@dopejs/pingo-ui";

root.render(
  createElement(Sidebar, {
    defaultValue: "stats",
    onValueChange: (value) => navigate(value),
    children: [
      createElement(SidebarSection, {
        title: "ワークスペース",
        children: [
          createElement(SidebarItem, { value: "home", label: "ホーム" }),
          createElement(SidebarItem, { value: "stats", label: "統計" }),
        ],
      }),
      createElement(SidebarSection, {
        title: "システム",
        children: createElement(SidebarItem, { value: "settings", label: "設定" }),
      }),
    ],
  }),
);
```

`Sidebar` は非制御（`defaultValue`）と制御（`value` + `onValueChange`）の両方の使い方をサポートします。サイドバーの幅はテーマトークンによって決まります（デフォルト 240px）。

## Props

### Sidebar

| Prop            | 型                        | デフォルト値 | 説明                               |
| --------------- | ------------------------- | ------------ | ---------------------------------- |
| `value`         | `string`                  | —            | 制御：現在選択中の項目の `value`   |
| `defaultValue`  | `string`                  | —            | 非制御：初期選択項目の `value`     |
| `onValueChange` | `(value: string) => void` | —            | 選択変更時のコールバック           |
| `children`      | `PingoNode`               | —            | `SidebarSection` のリスト（必須）  |
| `className`     | `string`                  | —            | コンポーネントのクラス名の後に追加 |

### SidebarSection

| Prop        | 型          | デフォルト値 | 説明                                                 |
| ----------- | ----------- | ------------ | ---------------------------------------------------- |
| `title`     | `string`    | —            | グループのタイトル。省略時はタイトル行を描画しません |
| `children`  | `PingoNode` | —            | `SidebarItem` のリスト（必須）                       |
| `className` | `string`    | —            | コンポーネントのクラス名の後に追加                   |

### SidebarItem

| Prop        | 型          | デフォルト値 | 説明                                                   |
| ----------- | ----------- | ------------ | ------------------------------------------------------ |
| `value`     | `string`    | —            | 項目の一意な識別子（必須）                             |
| `label`     | `string`    | —            | 項目のテキスト。アクセシビリティ名としても使用（必須） |
| `icon`      | `PingoNode` | —            | 先頭スロット。アイコン用                               |
| `className` | `string`    | —            | コンポーネントのクラス名の後に追加                     |

## アクセシビリティ

サイドバーは navigation セマンティクスを持ち、項目は link セマンティクスを持ちます。`label` をアクセシビリティ名として使用し、selected/unselected 状態を公開します。上下方向キーと Home/End で項目間を移動し、選択とフォーカスが一緒に移動します。

サイドバーの幅と配色のカスタマイズは[スタイルガイド](/guide/styling)を参照してください。
