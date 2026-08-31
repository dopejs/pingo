---
title: Calendar
description: לוח שנה חודשי בסגנון shadcn, עם גריד קבוע של שש שורות; התאריכים מיוצגים לפי חלקי שנה, חודש ויום כדי למנוע הזזות של אזורי זמן.
---

# Calendar

לוח שנה חודשי בסגנון shadcn. התאריכים מיוצגים בשלושה חלקים `{ year, month, day }` (כאשר `month` מתחיל מ־1), כך שהתאריך לא יזוז בשום אזור זמן; הגריד קבוע על שש שורות, וגובה הרכיב נשאר זהה במעבר בין חודשים. התצוגה המקדימה למטה מרונדרת בזמן אמת על ידי מנוע pingo — ניתן ללחוץ לבחירת תאריך, לעבור חודשים באמצעות החצים, ולעבור בין מצב בהיר לכהה בהתאם לערכת הנושא של האתר.

:::preview calendar-basic
:::

## שימוש

מצב הבחירה הוא **מבוקר**: לחיצה על תאריך מפעילה את `onSelect`, ואתה כותב בחזרה את `value`. את החודש ניתן לנהל פנימית ברכיב (`defaultMonth`), או לשלוט בו באופן מלא באמצעות `month` ו־`onMonthChange`.

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

## דוגמאות

### השבתת תאריכים

`isDisabled` מחזיר לפי תאריך האם ניתן לבחירה; תאריכים מושבתים אינם מגיבים למצביע ולמקלדת. בדוגמה למטה סופי השבוע מושבתים:

:::preview calendar-disabled
:::

## Props

### CalendarProps

| Prop            | סוג                               | ברירת מחדל                      | תיאור                                                           |
| --------------- | --------------------------------- | ------------------------------- | --------------------------------------------------------------- |
| `value`         | `CalendarDate`                    | —                               | התאריך הנבחר (מבוקר)                                            |
| `month`         | `CalendarDate`                    | —                               | החודש המוצג (מבוקר); כאשר מושמט, מנוהל על ידי מצב פנימי         |
| `defaultMonth`  | `CalendarDate`                    | `value` ?? ינואר 2026           | החודש ההתחלתי במצב לא מבוקר                                     |
| `onSelect`      | `(date: CalendarDate) => void`    | —                               | קריאה חוזרת בלחיצה על תאריך                                     |
| `onMonthChange` | `(month: CalendarDate) => void`   | —                               | קריאה חוזרת במעבר חודש (מופעלת גם במצב מבוקר וגם במצב לא מבוקר) |
| `weekdayLabels` | `readonly string[]`               | `["א","ב","ג","ד","ה","ו","ש"]` | כותרות ימי השבוע, מתחילות מיום ראשון                            |
| `monthLabel`    | `(month: CalendarDate) => string` | פורמט `"אוגוסט 2026"`           | כותרת חודש מותאמת אישית                                         |
| `isDisabled`    | `(date: CalendarDate) => boolean` | —                               | השבתת תאריכים מסוימים                                           |
| `className`     | `string`                          | —                               | מצורף לאחר שם מחלקת הרכיב                                       |

### CalendarDate

| שדה     | סוג      | תיאור      |
| ------- | -------- | ---------- |
| `year`  | `number` | שנה        |
| `month` | `number` | חודש, 1–12 |
| `day`   | `number` | יום, 1–31  |

החבילה מייצאת גם פונקציות טהורות כגון `daysInMonth`, `monthGrid`, `shiftMonth` ו־`sameDate`, לנוחות במימוש לוגיקת תאריכים מותאמת אישית.

## נגישות

לוח השנה כולו בעל סמנטיקה של `group`; שמות הנגישות של חצי המעבר בין חודשים הם "previous month" / "next month", תאי התאריך הם בעלי סמנטיקה של button, וליום הנבחר יש ערך סמנטי של `selected`. במקלדת, `PageUp` / `PageDown` מאפשרים מעבר חודשים מכל מקום בגריד, כך שמשתמשי מקלדת לא ייתקעו בחודש הנוכחי. למידע נוסף ראו [מדריך הנגישות](/guide/accessibility).
