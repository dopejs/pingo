---
title: Select
description: בורר רשימה נפתחת מודולרי, תומך בניווט מקלדת, מרונדר על גבי קנבס pingo.
---

# Select

הבורר הנפתח מורכב מהשילוב של `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`. התצוגה המקדימה למטה מרונדרת בזמן אמת על ידי מנוע pingo — הרשימה כבר פתוחה, ניתן לנווט עם מקשי החיצים, לבחור עם Enter, והיא עוקבת אחר ערכת הנושא של האתר ומחליפה בין מצב בהיר לכהה.

:::preview select-basic
:::

## שימוש

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger } from "@dopejs/pingo-ui";

root.render(
  <Select value="pingo-ui" onValueChange={(value) => console.log(value)}>
    <SelectTrigger placeholder="בחר חבילה" />
    <SelectContent>
      <SelectItem value="pingo">@dopejs/pingo</SelectItem>
      <SelectItem value="pingo-ui">@dopejs/pingo-ui</SelectItem>
    </SelectContent>
  </Select>,
);
```

כל החלקים משתפים פעולה דרך context, ויש לטעון את כולם כרכיבים באמצעות JSX. הטריגר מציג את ה-`value` שנבחר; כשאין בחירה מוצג ה-`placeholder`.

## דוגמאות

### פתוח כברירת מחדל

`defaultOpen` גורם לרשימה להיפתח במצב התחלתי (כמו בתצוגה המקדימה למעלה); `onOpenChange` מאזין לפתיחה וסגירה.

## Props

### Select

| Prop            | סוג                       | ברירת מחדל | תיאור                                                |
| --------------- | ------------------------- | ---------- | ---------------------------------------------------- |
| `value`         | `string`                  | —          | הערך הנבחר, מוצג בטריגר                              |
| `defaultOpen`   | `boolean`                 | `false`    | פתיחה ראשונית                                        |
| `onValueChange` | `(value: string) => void` | —          | קריאה חוזרת לשינוי בחירה (נסגר אוטומטית לאחר הבחירה) |
| `onOpenChange`  | `(open: boolean) => void` | —          | קריאה חוזרת לפתיחה וסגירה                            |
| `children`      | `PingoNode`               | —          | טריגר ותוכן (חובה)                                   |
| `className`     | `string`                  | —          | מצורף אחרי שם מחלקת הרכיב                            |

### SelectTrigger

| Prop          | סוג         | ברירת מחדל | תיאור                                                                     |
| ------------- | ----------- | ---------- | ------------------------------------------------------------------------- |
| `children`    | `PingoNode` | —          | תוכן טריגר מותאם אישית; כברירת מחדל מרונדר הערך הנבחר או טקסט placeholder |
| `placeholder` | `string`    | —          | טקסט placeholder כשאין בחירה                                              |
| `className`   | `string`    | —          | מצורף אחרי שם מחלקת הרכיב                                                 |

### SelectContent

| Prop        | סוג         | ברירת מחדל | תיאור                     |
| ----------- | ----------- | ---------- | ------------------------- |
| `children`  | `PingoNode` | —          | רשימת `SelectItem` (חובה) |
| `className` | `string`    | —          | מצורף אחרי שם מחלקת הרכיב |

### SelectItem

| Prop        | סוג      | ברירת מחדל | תיאור                     |
| ----------- | -------- | ---------- | ------------------------- |
| `value`     | `string` | —          | ערך האפשרות (חובה)        |
| `children`  | `string` | —          | טקסט האפשרות (חובה)       |
| `className` | `string` | —          | מצורף אחרי שם מחלקת הרכיב |

## נגישות

לטריגר יש סמנטיקה של button והוא מתחלף בין `expanded` ל-`collapsed`; לתוכן יש סמנטיקה של menu. מקשי החיצים מזיזים את ההדגשה, `Enter`/`רווח` בוחרים, `Esc` סוגר; לאחר הבחירה הפוקוס חוזר לטריגר.
