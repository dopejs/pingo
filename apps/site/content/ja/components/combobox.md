---
title: Combobox
description: 検索可能なドロップダウンセレクター。入力で選択肢リストをフィルタリング。pingo canvas 上にレンダリング。
---

# Combobox

コンボボックスは、選択値を表示するトリガーと検索可能な選択肢リストを結び付けます。下のプレビューは
pingo エンジンによるリアルタイムレンダリングです。リストは展開済みで、入力によるフィルタリングや矢印キー
による選択ができ、サイトのテーマに合わせて明暗が切り替わります。

:::preview combobox-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { Combobox } from "@dopejs/pingo-ui";

root.render(
  createElement(Combobox, {
    items: [
      { value: "next", label: "Next.js" },
      { value: "remix", label: "Remix" },
      { value: "astro", label: "Astro" },
    ],
    placeholder: "フレームワークを選択",
    onValueChange: (value) => console.log(value),
  }),
);
```

`items` は `{ value, label }` の配列です。フィルタリングは `label` に対する大文字小文字を区別しない部分文字列
マッチで、あえてファジーソートは行いません。誤ったソートはソートなしより悪いからです。選択するとリストは
自動的に折りたたまれ、クエリは**閉じたとき**にクリアされます。再オープン時に、とっくに忘れたフィルタ語と
向き合うことのないようにするためです。

## 例

### 制御

`value` / `onValueChange` と `open` / `onOpenChange` はどちらも制御できます。省略した場合、コンポーネントは
`defaultValue` / `defaultOpen` で状態を自己管理します。

### 空状態

`emptyLabel` で、フィルタ結果がないときのヒントテキストをカスタマイズできます。

## Props

| Prop            | 型                                            | デフォルト           | 説明                                                     |
| --------------- | --------------------------------------------- | -------------------- | -------------------------------------------------------- |
| `items`         | `readonly { value: string; label: string }[]` | —                    | 選択肢リスト（必須）                                     |
| `value`         | `string`                                      | —                    | 制御された選択値                                         |
| `defaultValue`  | `string`                                      | —                    | 非制御の初期選択値                                       |
| `onValueChange` | `(value: string) => void`                     | —                    | 選択変更時のコールバック（選択後に自動で折りたたまれる） |
| `open`          | `boolean`                                     | —                    | 制御された開閉                                           |
| `defaultOpen`   | `boolean`                                     | `false`              | 非制御の初期開閉                                         |
| `onOpenChange`  | `(open: boolean) => void`                     | —                    | 開閉時のコールバック                                     |
| `placeholder`   | `string`                                      | `"選択してください"` | 未選択時にトリガーに表示するプレースホルダーテキスト     |
| `emptyLabel`    | `string`                                      | —                    | フィルタ結果がないときのヒント                           |
| `className`     | `string`                                      | —                    | コンポーネントのクラス名に追加される                     |

## アクセシビリティ

トリガーは button セマンティクスを持ち、`expanded` / `collapsed` の間で切り替わります。リストが開くと
フォーカスは検索ボックスに移り、矢印キーでハイライトを移動し、Enter で選択して閉じます。閉じた後、
フォーカスはトリガーに戻ります。
