---
title: Tabs
description: タブは、pingo canvas 上に描画される同レベルのパネル群を切り替えます。
---

# Tabs

タブは、同一領域内で複数の同レベルコンテンツパネルを切り替えます。下のプレビューは pingo エンジンによりリアルタイム描画されます。タブをクリックして切り替えるか、左右方向キーでタブ間を移動できます。

:::preview tabs-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@dopejs/pingo-ui";

root.render(
  createElement(Tabs, {
    defaultValue: "account",
    children: [
      createElement(TabsList, {
        children: [
          createElement(TabsTrigger, { value: "account", children: "账户" }),
          createElement(TabsTrigger, { value: "password", children: "密码" }),
        ],
      }),
      createElement(TabsContent, {
        value: "account",
        children: createElement("text", { value: "管理你的账户信息。" }),
      }),
      createElement(TabsContent, {
        value: "password",
        children: createElement("text", { value: "修改你的登录密码。" }),
      }),
    ],
  }),
);
```

`Tabs` は、非制御（`defaultValue`）と制御（`value` + `onValueChange`）の両方の使い方をサポートします。

## Props

### Tabs

| Prop            | 型                        | デフォルト値 | 説明                                      |
| --------------- | ------------------------- | ------------ | ----------------------------------------- |
| `value`         | `string`                  | —            | 制御：現在選択中のタブの `value`          |
| `defaultValue`  | `string`                  | —            | 非制御：初期選択タブの `value`            |
| `onValueChange` | `(value: string) => void` | —            | 選択変更時のコールバック                  |
| `children`      | `PingoNode`               | —            | `TabsList` と複数の `TabsContent`（必須） |
| `className`     | `string`                  | —            | コンポーネントのクラス名の後に追加        |

### TabsList

| Prop        | 型          | デフォルト値 | 説明                               |
| ----------- | ----------- | ------------ | ---------------------------------- |
| `children`  | `PingoNode` | —            | `TabsTrigger` のリスト（必須）     |
| `className` | `string`    | —            | コンポーネントのクラス名の後に追加 |

### TabsTrigger

| Prop        | 型       | デフォルト値 | 説明                                              |
| ----------- | -------- | ------------ | ------------------------------------------------- |
| `value`     | `string` | —            | 対応する `TabsContent` と関連付ける識別子（必須） |
| `children`  | `string` | —            | タブのテキスト（必須）                            |
| `className` | `string` | —            | コンポーネントのクラス名の後に追加                |

### TabsContent

| Prop        | 型          | デフォルト値 | 説明                                              |
| ----------- | ----------- | ------------ | ------------------------------------------------- |
| `value`     | `string`    | —            | 対応する `TabsTrigger` と関連付ける識別子（必須） |
| `children`  | `PingoNode` | —            | パネルの内容（必須）                              |
| `className` | `string`    | —            | コンポーネントのクラス名の後に追加                |

## アクセシビリティ

タブリストは tablist セマンティクスを持ち、タブは tab セマンティクスを持ち、支援技術に選択状態を公開します。左右方向キーと Home/End でタブ間を移動し、同時に選択します。フォーカスは選択とともに移動します。非アクティブなパネルはアンマウントではなく `display: none` で非表示にするため、パネル内のスクロール位置と編集状態が保持されます。
