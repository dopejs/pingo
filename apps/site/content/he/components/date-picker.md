---
title: בורר תאריך
description: בורר תאריכים קופץ בלוח שנה הקשור לערך, מרונדר על קנבס pingo.
---

# בורר תאריך

בורר התאריכים הוא [Calendar](/components/calendar) הקשור לערך: טריגר plus לוח חודשי קופץ. התצוגה המקדימה שלהלן מרונדרת בזמן אמת על ידי מנוע pingo — לוח השנה כבר פתוח, ניתן לדפדף בין חודשים, לבחור תאריך, ולעבור בין מצב בהיר לכהה בהתאם לערכת הנושא של האתר.

:::preview date-picker-basic
:::

## שימוש

```tsx
import { createElement } from "@dopejs/pingo";
import { DatePicker, type CalendarDate } from "@dopejs/pingo-ui";

root.render(
  createElement(DatePicker, {
    placeholder: "בחר תאריך",
    onSelect: (date: CalendarDate) => console.log(date),
  }),
);
```

התאריך מיוצג כ‑`CalendarDate` (`{ year, month, day }`) — נשמר כשדות נפרדים, כך ששום אזור זמן לא יכול להזיז אותו ביום. לאחר בחירת תאריך השכבה הקופצת נסגרת אוטומטית: אם הבורר נשאר פתוח, הוא פשוט לוח שנה.

## דוגמאות

### עיצוב וטקסט חלופי

כברירת מחדל הטריגר מציג את התאריך הנבחר בתבנית `YYYY-MM-DD`; ניתן להתאים אישית את הרינדור באמצעות `format`, ואת טקסט החלופי כשאין בחירה באמצעות `placeholder`.

### פתיחה וסגירה מבוקרות

`open` ו‑`onOpenChange` מהווים שליטה מבוקרת על הפתיחה; בהיעדרם הרכיב מנהל את מצב הפתיחה בעצמו.

## Props

| Prop            | סוג                               | ברירת מחדל                      | תיאור                                              |
| --------------- | --------------------------------- | ------------------------------- | -------------------------------------------------- |
| `value`         | `CalendarDate`                    | —                               | התאריך הנבחר                                       |
| `month`         | `CalendarDate`                    | —                               | החודש המוצג המבוקר                                 |
| `defaultMonth`  | `CalendarDate`                    | `value ?? 2026-01-01`           | החודש ההתחלתי הלא־מבוקר                            |
| `onSelect`      | `(date: CalendarDate) => void`    | —                               | קריאה חוזרת לבחירת תאריך (ונסגר אוטומטית לאחר מכן) |
| `onMonthChange` | `(month: CalendarDate) => void`   | —                               | קריאה חוזרת למעבר חודש                             |
| `weekdayLabels` | `readonly string[]`               | `["א","ב","ג","ד","ה","ו","ש"]` | כותרות ימות השבוע                                  |
| `monthLabel`    | `(month: CalendarDate) => string` | —                               | כותרת חודש מותאמת אישית                            |
| `isDisabled`    | `(date: CalendarDate) => boolean` | —                               | השבתת תאריכים מסוימים                              |
| `open`          | `boolean`                         | —                               | פתיחה מבוקרת                                       |
| `onOpenChange`  | `(open: boolean) => void`         | —                               | קריאה חוזרת לשינוי מצב הפתיחה                      |
| `placeholder`   | `string`                          | `"בחר תאריך"`                   | טקסט חלופי כשאין תאריך נבחר                        |
| `format`        | `(date: CalendarDate) => string`  | `formatDate` (`YYYY-MM-DD`)     | רינדור התאריך על הטריגר                            |
| `className`     | `string`                          | —                               | מצורף לאחר שם המחלקה של הרכיב                      |

## נגישות

לטריגר יש סמנטיקה של button והוא עובר בין `expanded` ל‑`collapsed`; חלק לוח השנה יורש את הסמנטיקה של רשת מ‑Calendar. כשהשכבה הקופצת נפתחת המיקוד נכנס לפאנל, וכשהיא נסגרת הוא חוזר לטריגר.
