---
title: TopBar
description: アプリのトップバー分子コンポーネント。タイトルと前後のスロットで構成され、pingo canvas 上に描画される。
---

# TopBar

TopBar は pingo 特有のプロダクト分子です。タイトルと `leading`（ロゴ、戻る）、`actions`（ボタン、アバター）の 2 つのスロットを 1 行のアプリトップバーに組み合わせます。タイトル列は常に残りのスペースを占有し（`flexGrow`）、actions を右端に押し出します。計測は一切不要です。下のプレビューは pingo エンジンによってリアルタイムに描画され、サイトのテーマに合わせて明暗が切り替わります。

:::preview topbar-basic
:::

shadcn の基本部品との組み合わせ関係: TopBar 自体はボタンやアバターを提供しません。TopBar が定義するのは**レイアウトの骨格**です。`leading` と `actions` のスロットは任意の `PingoNode` を受け入れ、通常は [Button](/components/button)、IconButton、Avatar などの基本部品を組み合わせます。複数の action は `flexDirection: "row"` の container で包んで渡します。

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { Avatar, Button, TopBar } from "@dopejs/pingo-ui";

root.render(
  createElement(TopBar, {
    title: "仪表盘",
    leading: createElement(Avatar, { fallback: "P", size: 28 }),
    actions: createElement(Button, {
      children: "新建",
      variant: "outline",
      onPress: () => create(),
    }),
  }),
);
```

## 例

### タイトルなし

`title` を省略した場合もタイトル列は描画されます（空の伸縮列）。actions は引き続き右端に押し出されます。操作領域のみのツールバーに適しています。

```tsx
createElement(TopBar, {
  actions: createElement(Button, { children: "导出", onPress: () => {} }),
});
```

## Props

| Prop        | 型          | デフォルト値 | 説明                                                 |
| ----------- | ----------- | ------------ | ---------------------------------------------------- |
| `title`     | `string`    | —            | タイトルテキスト。省略時は空の伸縮列を描画します     |
| `leading`   | `PingoNode` | —            | 前部スロット。ロゴや戻るボタンを配置します           |
| `actions`   | `PingoNode` | —            | 尾部スロット。タイトル列によって右端に押し出されます |
| `className` | `string`    | —            | コンポーネントのクラス名の後に追加されます           |

## アクセシビリティ

TopBar は `banner` セマンティックロールを持ちます。`title` を指定した場合、タイトルテキストには `heading` ロールが付与されます。スロット内コンポーネントのアクセシビリティ属性（IconButton の `semanticLabel` など）は、それぞれのコンポーネントが責任を持ちます。
