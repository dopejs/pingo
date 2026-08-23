---
title: Context Menu
description: 右クリックで開くコンテキストメニュー。ポインタを押した位置に表示。
---

# Context Menu

Context Menu は、対象領域上で右クリック（`contextmenu` イベント）したときに、ポインタ位置でメニューを
開きます。下のプレビューは pingo エンジンによるリアルタイムレンダリングです。テキスト領域上で右クリック
するとメニューが開き、サイトのテーマに合わせて明暗が切り替わります。

:::preview context-menu-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { ContextMenu } from "@dopejs/pingo-ui";

root.render(
  createElement(ContextMenu, {
    items: [
      { value: "copy", label: "コピー" },
      { value: "paste", label: "貼り付け", disabled: true },
      { value: "delete", label: "削除" },
    ],
    onSelect: (value) => run(value),
    children: createElement("text", { value: "ここで右クリック" }),
  }),
);
```

メニューはトリガーの隅ではなくポインタを押した位置に配置されます。`Escape` または項目を選択すると閉じます。
無効化された項目はキーボードナビゲーションの対象外で、クリックにも反応しません。静的レンダリング時は
トリガー領域だけが表示され、メニューは右クリック時に現れます。

## Props

| Prop           | 型                            | デフォルト | 説明                             |
| -------------- | ----------------------------- | ---------- | -------------------------------- |
| `children`     | `PingoNode`                   | —          | トリガー領域のコンテンツ（必須） |
| `items`        | `readonly ContextMenuEntry[]` | —          | メニュー項目（必須）             |
| `onSelect`     | `(value: string) => void`     | —          | メニュー項目選択時のコールバック |
| `onOpenChange` | `(open: boolean) => void`     | —          | 開閉変化時のコールバック         |
| `className`    | `string`                      | —          | 追加するクラス名                 |

### ContextMenuEntry

| フィールド | 型        | デフォルト | 説明                     |
| ---------- | --------- | ---------- | ------------------------ |
| `value`    | `string`  | —          | メニュー項目の値（必須） |
| `label`    | `string`  | —          | 表示テキスト（必須）     |
| `disabled` | `boolean` | `false`    | 無効状態                 |

## アクセシビリティ

メニューは menu セマンティクスを、メニュー項目は menuitem セマンティクスを持ちます。開いた後は矢印キーで
上下に移動し、`Escape` で閉じます。
