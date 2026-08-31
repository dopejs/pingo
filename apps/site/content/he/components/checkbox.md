---
title: Checkbox
description: תיבת סימון נשלטת, יכולה לכלול תווית טקסט, מרונדרת על קנבס pingo.
---

# Checkbox

תיבת הסימון משמשת למתג בוליאני עצמאי. התצוגה המקדימה שלהלן מרונדרת בזמן אמת על ידי מנוע pingo, ועוקבת אחר ערכת הנושא של האתר (בהיר/כהה). Checkbox הוא רכיב נשלט: התצוגה המקדימה מציגה שילוב סטטי של מופעל/כבוי/מושבת, והאינטראקציה מונעת על ידי מצב המוחזק אצל הצד הקורא.

:::preview checkbox-basic
:::

## שימוש

```tsx
import { useSignal, type PingoNode } from "@dopejs/pingo";
import { Checkbox } from "@dopejs/pingo-ui";

// useSignal הוא hook, חייב לרוץ בתוך תחום רכיב.
function NotificationSetting(): PingoNode {
  const enabled = useSignal(false);
  return (
    <Checkbox
      checked={enabled.get()}
      label="התראות הופעלו"
      onCheckedChange={(next) => enabled.set(next)}
    />
  );
}

root.render(<NotificationSetting />);
```

`checked` מוחזק על ידי רכיב האב, ו-`onCheckedChange` אחראי לעדכן אותו — הרכיב עצמו אינו שומר מצב. `label` הוא אופציונלי, וכאשר מסופק, טקסט ירונדר מימין לתיבה.

## דוגמאות

### מצב מושבת

כאשר מעבירים `disabled`, התיבה מפסיקה להגיב למצביע ולמקלדת, והערך הסמנטי הופך ל-`disabled`.

## Props

| Prop              | טיפוס                        | ברירת מחדל | תיאור                         |
| ----------------- | ---------------------------- | ---------- | ----------------------------- |
| `checked`         | `boolean`                    | —          | מצב סימון (חובה, נשלט)        |
| `onCheckedChange` | `(checked: boolean) => void` | —          | קריאה חוזרת לשינוי מצב        |
| `disabled`        | `boolean`                    | `false`    | מצב מושבת                     |
| `label`           | `string`                     | —          | תווית טקסט מימין לתיבה        |
| `className`       | `string`                     | —          | מצורף לאחר שם המחלקה של הרכיב |
| `semanticLabel`   | `string`                     | —          | שם נגישות                     |

## נגישות

לרכיב יש תפקיד סמנטי `checkbox`, והערך הסמנטי עובר בין `checked` / `unchecked` / `disabled` בהתאם למצב. בעת לחיצת מצביע, הרכיב מקבל מיקוד אוטומטית. מחוון ה-✓ תלוי בכיסוי גליפים של הגופן, ומהווה מימוש זמני עד שמוכנים נכסי אייקונים.
