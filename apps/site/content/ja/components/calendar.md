---
title: Calendar
description: shadcn スタイルの月間カレンダー。固定 6 行グリッド。日付は年月日のパーツで表現しタイムゾーンによるずれを回避。
---

# Calendar

shadcn スタイルの月間カレンダーです。日付は `{ year, month, day }` の 3 つのパーツで表現され（`month` は
1 始まり）、どのタイムゾーンでも日付がずれません。グリッドは常に 6 行固定で、月をめくってもコンポーネントの
高さは変わりません。下のプレビューは pingo エンジンによるリアルタイムレンダリングです。日付をクリックして
選択したり、矢印で月をめくったりでき、サイトのテーマに合わせて明暗が切り替わります。

:::preview calendar-basic
:::

## 使い方

選択状態は**制御**です。日付をクリックすると `onSelect` が発火するので、`value` に書き戻してください。
表示月はコンポーネント内部で自己管理（`defaultMonth`）することも、`month` + `onMonthChange` で完全に
制御することもできます。

```tsx
import { useSignal, type PingoNode } from "@dopejs/pingo";
import { Calendar, type CalendarDate } from "@dopejs/pingo-ui";

function DateField(): PingoNode {
  const selected = useSignal<CalendarDate>({ year: 2026, month: 8, day: 22 });
  return (
    <Calendar
      defaultMonth={{ year: 2026, month: 8, day: 1 }}
      value={selected.get()}
      onSelect={(date) => selected.set(date)}
    />
  );
}
```

## 例

### 日付の無効化

`isDisabled` は日付ごとに選択可否を返します。無効化された日付はポインタにもキーボードにも反応しません。
以下は週末を無効化した例です。

:::preview calendar-disabled
:::

## Props

### CalendarProps

| Prop            | 型                                | デフォルト                             | 説明                                                 |
| --------------- | --------------------------------- | -------------------------------------- | ---------------------------------------------------- |
| `value`         | `CalendarDate`                    | —                                      | 選択中の日付（制御）                                 |
| `month`         | `CalendarDate`                    | —                                      | 表示する月（制御）。省略時は内部状態で管理           |
| `defaultMonth`  | `CalendarDate`                    | `value` ?? 2026 年 1 月                | 非制御モードでの初期表示月                           |
| `onSelect`      | `(date: CalendarDate) => void`    | —                                      | 日付クリック時のコールバック                         |
| `onMonthChange` | `(month: CalendarDate) => void`   | —                                      | 月めくり時のコールバック（制御・非制御の両方で発火） |
| `weekdayLabels` | `readonly string[]`               | `["日","月","火","水","木","金","土"]` | 曜日ヘッダー。日曜始まり                             |
| `monthLabel`    | `(month: CalendarDate) => string` | `"2026 年 8 月"` 形式                  | 月タイトルのカスタマイズ                             |
| `isDisabled`    | `(date: CalendarDate) => boolean` | —                                      | 特定の日付を無効化                                   |
| `className`     | `string`                          | —                                      | コンポーネントのクラス名に追加される                 |

### CalendarDate

| フィールド | 型       | 説明       |
| ---------- | -------- | ---------- |
| `year`     | `number` | 年         |
| `month`    | `number` | 月（1–12） |
| `day`      | `number` | 日（1–31） |

パッケージは `daysInMonth`、`monthGrid`、`shiftMonth`、`sameDate` などの純粋関数もエクスポートしているので、
独自の日付ロジックに利用できます。

## アクセシビリティ

カレンダー全体は `group` セマンティクスを持ちます。月めくり矢印のアクセシブル名は "previous month" /
"next month" で、日付セルは button セマンティクス、選択中の日付には `selected` セマンティック値が
付きます。キーボードでは `PageUp` / `PageDown` でグリッドのどこからでも月をめくれるため、キーボード
ユーザーが現在の月に閉じ込められることはありません。詳しくは
[アクセシビリティガイド](/ja/guide/accessibility)を参照してください。
