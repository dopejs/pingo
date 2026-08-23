---
title: Date Picker
description: 日付に紐付いたポップアップカレンダー選択器。pingo canvas 上にレンダリング。
---

# Date Picker

日付選択器は値に紐付いた [Calendar](/ja/components/calendar) です。1 つのトリガーとポップアップする月間
カレンダーから構成されます。下のプレビューは pingo エンジンによるリアルタイムレンダリングです。カレンダーは
展開済みで、ページをめくったり日付をクリックして選択したりでき、サイトのテーマに合わせて明暗が切り替わります。

:::preview date-picker-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { DatePicker, type CalendarDate } from "@dopejs/pingo-ui";

root.render(
  createElement(DatePicker, {
    placeholder: "日付を選択",
    onSelect: (date: CalendarDate) => console.log(date),
  }),
);
```

日付は `CalendarDate`（`{ year, month, day }`）で表現されます。フィールドに分解して保存するため、どの
タイムゾーンでも日付が 1 日ずれることはありません。日付を選択するとポップアップは自動的に閉じます。
選択器が開いたまま残るのは、ただのカレンダーになってしまうからです。

## 例

### フォーマットとプレースホルダー

トリガーはデフォルトで選択日付を `YYYY-MM-DD` 形式で表示します。`format` でレンダリングをカスタマイズ
でき、`placeholder` で未選択時のプレースホルダーテキストをカスタマイズできます。

### 制御された開閉

`open` と `onOpenChange` で開閉を制御できます。省略した場合、コンポーネントが開閉状態を自己管理します。

## Props

| Prop            | 型                                | デフォルト                             | 説明                                           |
| --------------- | --------------------------------- | -------------------------------------- | ---------------------------------------------- |
| `value`         | `CalendarDate`                    | —                                      | 選択中の日付                                   |
| `month`         | `CalendarDate`                    | —                                      | 制御された表示月                               |
| `defaultMonth`  | `CalendarDate`                    | `value ?? 2026-01-01`                  | 非制御の初期表示月                             |
| `onSelect`      | `(date: CalendarDate) => void`    | —                                      | 日付選択時のコールバック（その後自動で閉じる） |
| `onMonthChange` | `(month: CalendarDate) => void`   | —                                      | 月めくり時のコールバック                       |
| `weekdayLabels` | `readonly string[]`               | `["日","月","火","水","木","金","土"]` | 曜日ヘッダー                                   |
| `monthLabel`    | `(month: CalendarDate) => string` | —                                      | 月タイトルのカスタマイズ                       |
| `isDisabled`    | `(date: CalendarDate) => boolean` | —                                      | 特定の日付を無効化                             |
| `open`          | `boolean`                         | —                                      | 制御された開閉                                 |
| `onOpenChange`  | `(open: boolean) => void`         | —                                      | 開閉時のコールバック                           |
| `placeholder`   | `string`                          | `"日付を選択"`                         | 未選択時のプレースホルダーテキスト             |
| `format`        | `(date: CalendarDate) => string`  | `formatDate`（`YYYY-MM-DD`）           | トリガー上の日付レンダリング                   |
| `className`     | `string`                          | —                                      | コンポーネントのクラス名に追加される           |

## アクセシビリティ

トリガーは button セマンティクスを持ち、`expanded` / `collapsed` の間で切り替わります。カレンダー部分は
Calendar のグリッドセマンティクスを継承します。ポップアップが開くとフォーカスはパネルに移り、閉じると
トリガーに戻ります。
