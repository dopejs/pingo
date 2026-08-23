---
title: Data Table
description: טבלה בגלילה וירטואלית עם כותרות עמודות הניתנות למיון, המיון מדווח כקריאה חוזרת והרינדור מתבצע על גבי קנבס pingo.
---

# Data Table

מוסיף כותרות עמודות הניתנות למיון על גבי [Table](/components/table). המיון הוא **מדווח ולא מבוצע**: הרכיב מודיע על מצב המיון החדש דרך `onSortChange`, ואתה מסדר מחדש את מקור הנתונים של `getRow` — בטבלה וירטואלית נתוני השורות נמצאים לרוב בשרת או ב-store, והרכיב לא יממש את כל השורות לצורך מיון. התצוגה המקדימה למטה מרונדרת בזמן אמת על ידי מנוע pingo: לחיצה על כותרות ״חבר״ ״הגשות״ ״פעילות אחרונה״ עוברת במחזור עולה → יורד → ביטול, ועוקבת אחרי ערכת הנושא של האתר בין מצב בהיר לכהה.

:::preview data-table-sortable
:::

## שימוש

```tsx
import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
import { DataTable, type SortState } from "@dopejs/pingo-ui";

function MemberTable(): PingoNode {
  const sort = useSignal<SortState | undefined>(undefined);
  const current = sort.get();
  const rows = sortMembers(members, current); // סידור עצמי של מקור הנתונים
  return DataTable<Member>({
    columns: [
      {
        key: "name",
        header: "חבר",
        sortable: true,
        cell: (row) => createElement("text", { value: row.name }),
      },
      {
        key: "commits",
        header: "הגשות",
        width: 80,
        align: "end",
        sortable: true,
        cell: (row) => createElement("text", { value: String(row.commits) }),
      },
    ],
    sort: current,
    onSortChange: (next) => sort.set(next),
    rowCount: rows.length,
    getRow: (index) => rows[index],
  });
}
```

לחיצה על עמודה ממוינת עוברת במחזור עולה → יורד → ביטול (כלל `nextSort`); המצב השלישי קיים כי משתמש שלחץ על מיון בטעות צריך דרך לחזור לסדר המקורי של הנתונים. בדומה ל-Table, גוף הטבלה הוא רשימה וירטואלית, ויש לתת גובה לאלמנט ההורה.

## Props

### DataTableProps\<Row\>

יורש את כל השדות של `TableProps<Row>` (כאשר `columns` מוחלף בגרסה הניתנת למיון):

| Prop | סוג | ברירת מחדל | תיאור |
| --- | --- | --- | --- |
| `columns` | `readonly DataTableColumn<Row>[]` | — | הגדרות עמודות (חובה), עם שדה `sortable` נוסף לעומת `TableColumn` |
| `sort` | `SortState` | — | מצב המיון הנוכחי; השמטה משמעה ללא מיון |
| `onSortChange` | `(sort: SortState \| undefined) => void` | — | קריאה חוזרת לשינוי מיון; `undefined` משמעו ביטול מיון. אם לא הועבר, הכותרות אינן ניתנות ללחיצה |
| `rowCount` | `number` | — | מספר השורות הכולל (חובה) |
| `getRow` | `(index: number) => Row` | — | אחזור נתוני שורה לפי מספר שורה (חובה) |
| `estimatedRowHeight` | `number` | `44` | גובה שורה משוער |
| `onRowPress` | `(index: number) => void` | — | קריאה חוזרת ללחיצה על שורה |
| `emptyLabel` | `string` | `"אין נתונים"` | טקסט למצב ריק |
| `renderHeaderCell` | `(column, index) => PingoNode` | — | קיים בטיפוס, אך הרכיב משתמש בו פנימית למימוש כותרות ממויינות — ערך שיועבר יידרס |
| `className` | `string` | — | מתווסף לאחר שם המחלקה של הרכיב |

### DataTableColumn\<Row\>

הרחבה של `TableColumn<Row>`, מוסיף:

| שדה | סוג | ברירת מחדל | תיאור |
| --- | --- | --- | --- |
| `sortable` | `boolean` | `false` | האם כותרת העמודה ניתנת ללחיצה למיון |

### SortState

| שדה | סוג | תיאור |
| --- | --- | --- |
| `key` | `string` | ה-`key` של עמודת המיון |
| `direction` | `"ascending" \| "descending"` | כיוון המיון |

כותרת העמודה הממוינת כעת תכלול מחוון `▲` / `▼`.

## נגישות

לתאי הכותרת יש סמנטיקה של `columnheader`; מצב המיון של עמודה הניתנת למיון (`ascending` / `descending` / `none`) נחשף לטכנולוגיות מסייעות דרך ערך סמנטי, והמיקוד עובר לכותרת לפני הלחיצה. למידע נוסף ראו [מדריך הנגישות](/guide/accessibility).
