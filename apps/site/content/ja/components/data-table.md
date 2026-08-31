---
title: Data Table
description: ソート可能なヘッダー付きの仮想スクロールテーブル。ソートはコールバックとして通知。pingo canvas 上にレンダリング。
---

# Data Table

[Table](/ja/components/table) の上にソート可能なヘッダーを追加したものです。ソートは**実行ではなく通知**
です。コンポーネントは `onSortChange` で新しいソート状態を知らせるだけで、`getRow` のデータソースの
並べ替えはあなたが行います。仮想テーブルでは行データはサーバーや store 側にあることが多く、
コンポーネントがソートのために全行を実体化することはありません。下のプレビューは pingo エンジンによる
リアルタイムレンダリングです。「メンバー」「コミット」「最近のアクティブ」のヘッダーをクリックすると
昇順 → 降順 → 解除の順で循環し、サイトのテーマに合わせて明暗が切り替わります。

:::preview data-table-sortable
:::

## 使い方

```tsx
import { useSignal, type PingoNode } from "@dopejs/pingo";
import { DataTable, type SortState } from "@dopejs/pingo-ui";

function MemberTable(): PingoNode {
  const sort = useSignal<SortState | undefined>(undefined);
  const current = sort.get();
  const rows = sortMembers(members, current); // データソースの並べ替えは自分で行う
  return DataTable<Member>({
    columns: [
      {
        key: "name",
        header: "メンバー",
        sortable: true,
        cell: (row) => <text value={row.name} />,
      },
      {
        key: "commits",
        header: "コミット",
        width: 80,
        align: "end",
        sortable: true,
        cell: (row) => <text value={String(row.commits)} />,
      },
    ],
    sort: current,
    onSortChange: (next) => sort.set(next),
    rowCount: rows.length,
    getRow: (index) => rows[index],
  });
}
```

ソート済みの列をクリックすると 昇順 → 降順 → 解除 の順に循環します（`nextSort` のルール）。3 番目の状態が
存在するのは、誤ってソートしてしまったユーザーがデータの元の順序に戻る道が必要だからです。Table と同様に、
テーブル本体は仮想リストなので、親コンテナが高さを指定する必要があります。

## Props

### DataTableProps\<Row\>

`TableProps<Row>` の全フィールドを継承します（`columns` はソート可能版に置き換わります）。

| Prop                 | 型                                       | デフォルト             | 説明                                                                                             |
| -------------------- | ---------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------ |
| `columns`            | `readonly DataTableColumn<Row>[]`        | —                      | 列定義（必須）。`TableColumn` に `sortable` が追加されたもの                                     |
| `sort`               | `SortState`                              | —                      | 現在のソート状態。省略時は未ソート                                                               |
| `onSortChange`       | `(sort: SortState \| undefined) => void` | —                      | ソート変更時のコールバック。`undefined` はソート解除を意味する。未指定時はヘッダーをクリック不可 |
| `rowCount`           | `number`                                 | —                      | 総行数（必須）                                                                                   |
| `getRow`             | `(index: number) => Row`                 | —                      | 行番号から行データを取得（必須）                                                                 |
| `estimatedRowHeight` | `number`                                 | `44`                   | 推定行高                                                                                         |
| `onRowPress`         | `(index: number) => void`                | —                      | 行クリック時のコールバック                                                                       |
| `emptyLabel`         | `string`                                 | `"データがありません"` | 空状態のテキスト                                                                                 |
| `renderHeaderCell`   | `(column, index) => PingoNode`           | —                      | 型上は存在するが、コンポーネント内部でソート可能ヘッダーの実装に使うため、渡しても上書きされる   |
| `className`          | `string`                                 | —                      | コンポーネントのクラス名に追加される                                                             |

### DataTableColumn\<Row\>

`TableColumn<Row>` の拡張で、以下が追加されます。

| フィールド | 型        | デフォルト | 説明                                     |
| ---------- | --------- | ---------- | ---------------------------------------- |
| `sortable` | `boolean` | `false`    | ヘッダーをクリックしてソート可能かどうか |

### SortState

| フィールド  | 型                            | 説明             |
| ----------- | ----------------------------- | ---------------- |
| `key`       | `string`                      | ソート列の `key` |
| `direction` | `"ascending" \| "descending"` | ソート方向       |

現在ソート中の列のヘッダーには `▲` / `▼` インジケーターが付きます。

## アクセシビリティ

ヘッダーセルは `columnheader` セマンティクスを持ちます。ソート可能列のソート状態（`ascending` /
`descending` / `none`）はセマンティック値として支援技術に公開され、クリック前にヘッダーがフォーカス
されます。詳しくは[アクセシビリティガイド](/ja/guide/accessibility)を参照してください。
