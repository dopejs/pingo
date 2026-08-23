---
title: Table
description: 仮想スクロールのデータテーブル。列定義がヘッダーと行の両方を駆動し、pingo canvas 上に描画されます。
---

# Table

仮想スクロールテーブル：列定義がヘッダーと各行の両方を駆動し、一万行と一画面分の行の描画コストは同じです。下のプレビューは pingo エンジンによってリアルタイムに描画されます——スクロール、行のクリック、サイトのテーマに追従した明暗の切り替えが可能です。

:::preview table-basic
:::

## 使い方

`Table` は memo コンポーネントではなく純粋な構築関数です。直接呼び出すとシーンノードを返します。コンポーネントの描画スコープ内で呼び出すことで（下記の関数コンポーネントのように）、テーマの読み取りがサイトテーマの切り替えをサブスクライブします。

```tsx
import { createElement, type PingoNode } from "@dopejs/pingo";
import { Table } from "@dopejs/pingo-ui";

type FileRow = { name: string; size: string };

function FileTable(): PingoNode {
  return Table<FileRow>({
    columns: [
      {
        key: "name",
        header: "名称",
        cell: (row) => createElement("text", { value: row.name }),
      },
      {
        key: "size",
        header: "大小",
        width: 96,
        align: "end",
        cell: (row) => createElement("text", { value: row.size }),
      },
    ],
    rowCount: files.length,
    getRow: (index) => files[index],
    onRowPress: (index) => open(files[index]),
  });
}
```

テーブル本体は [VirtualList](/guide/scrolling) であり、親コンテナが高さを指定する必要があります（例では外側コンテナの `height: 260`）。

## 例

### 空状態

`rowCount` が `0` の場合、`emptyLabel`（デフォルト「暂无数据」）が描画され、仮想リストは作成されません。

:::preview table-empty
:::

## Props

### TableProps\<Row\>

| Prop                 | 型                                                       | デフォルト値 | 説明                                                                             |
| -------------------- | -------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------- |
| `columns`            | `readonly TableColumn<Row>[]`                            | —            | 列定義。ヘッダーと行の両方を駆動します（必須）                                   |
| `rowCount`           | `number`                                                 | —            | 総行数（必須）。`0` の場合は空状態を描画します                                   |
| `getRow`             | `(index: number) => Row`                                 | —            | 行番号から行データを取得します。可視ウィンドウに対してのみ呼び出されます（必須） |
| `estimatedRowHeight` | `number`                                                 | `44`         | 仮想スクロールの計画に使用する推定行高                                           |
| `onRowPress`         | `(index: number) => void`                                | —            | 行クリックのコールバック。指定すると行がフォーカス可能になります                 |
| `emptyLabel`         | `string`                                                 | `"暂无数据"` | 空状態の文言                                                                     |
| `renderHeaderCell`   | `(column: TableColumn<Row>, index: number) => PingoNode` | —            | 特定の列のデフォルトヘッダーセルを置き換えます                                   |
| `className`          | `string`                                                 | —            | コンポーネントのクラス名の後に追加されます                                       |

### TableColumn\<Row\>

| フィールド | 型                                       | デフォルト値 | 説明                                                                       |
| ---------- | ---------------------------------------- | ------------ | -------------------------------------------------------------------------- |
| `key`      | `string`                                 | —            | 列の識別子。ノードの key として使用されます（必須）                        |
| `header`   | `string`                                 | —            | ヘッダーの文言（必須）                                                     |
| `width`    | `number`                                 | —            | 固定幅（論理ピクセル）。省略時は `flex` に応じて残りの幅が割り当てられます |
| `flex`     | `number`                                 | `1`          | `width` 未設定時の残り幅に対する割り当て比率                               |
| `align`    | `"start" \| "center" \| "end"`           | `"start"`    | 列コンテンツの水平方向の配置。ヘッダーとセルで共通です                     |
| `cell`     | `(row: Row, index: number) => PingoNode` | —            | セルコンテンツの構築関数（必須）                                           |

仮想テーブルはコンテンツに基づいて列幅を測定できません。描画されていない行は測定に参加しないため、列幅は列定義からのみ取得できます。これにより、ヘッダーと行が自然に整列します。

## アクセシビリティ

テーブルには `table` セマンティクスが付与され、ヘッダーは `columnheader`、各行は `row` となります。`onRowPress` を渡すと、行はポインターでフォーカスしてアクティブ化できます。詳細は[アクセシビリティガイド](/guide/accessibility)を参照してください。
