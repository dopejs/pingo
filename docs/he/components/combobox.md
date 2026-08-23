---
title: Combobox
description: בורר נפתח עם חיפוש, מסנן את רשימת האפשרויות לפי קלט ומרונדר על קנבס pingo.
---

# Combobox

תיבת שילוב קושרת יחד טריגר שמציג את הערך הנבחר ורשימת אפשרויות ניתנת לחיפוש. התצוגה המקדימה שלהלן מרונדרת בזמן אמת על ידי מנוע pingo — הרשימה כבר פתוחה, אפשר להקליד לסינון, לבחור עם מקשי החצים, ולעבור בין מצב בהיר לכהה לפי ערכת הנושא של האתר.

:::preview combobox-basic
:::

## שימוש

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
    placeholder: "בחרו מסגרת",
    onValueChange: (value) => console.log(value),
  }),
);
```

`items` הוא מערך של `{ value, label }`; הסינון הוא התאמת תת־מחרוזת שאינה תלויה ברישיות על פני `label` — בכוונה ללא מיון מטושטש, כי מיון שגוי גרוע יותר מהיעדר מיון. לאחר בחירה הרשימה נסגרת אוטומטית, ומונח החיפוש מתנקה **בעת הסגירה**, כדי להימנע מפתיחה חוזרת מול מונח סינון שנשכח מזמן.

## דוגמאות

### מבוקר

גם `value` / `onValueChange` וגם `open` / `onOpenChange` יכולים להיות מבוקרים; בהיעדרם הרכיב מנהל את המצב בעצמו באמצעות `defaultValue` / `defaultOpen`.

### מצב ריק

`emptyLabel` מתאים אישית את טקסט ההודעה כאשר הסינון אינו מניב תוצאות.

## Props

| Prop | סוג | ברירת מחדל | תיאור |
| --- | --- | --- | --- |
| `items` | `readonly { value: string; label: string }[]` | — | רשימת האפשרויות (חובה) |
| `value` | `string` | — | ערך נבחר מבוקר |
| `defaultValue` | `string` | — | ערך נבחר התחלתי לא מבוקר |
| `onValueChange` | `(value: string) => void` | — | קריאה חוזרת בעת שינוי הבחירה (נסגר אוטומטית לאחר הבחירה) |
| `open` | `boolean` | — | פתיחה/סגירה מבוקרת |
| `defaultOpen` | `boolean` | `false` | פתיחה/סגירה התחלתית לא מבוקרת |
| `onOpenChange` | `(open: boolean) => void` | — | קריאה חוזרת בעת פתיחה/סגירה |
| `placeholder` | `string` | `"请选择"` | טקסט מציין מיקום על הטריגר כשאין ערך נבחר |
| `emptyLabel` | `string` | — | הודעה כאשר הסינון אינו מניב תוצאות |
| `className` | `string` | — | נוסף לאחר שם המחלקה של הרכיב |

## נגישות

לטריגר יש סמנטיקה של button והוא עובר בין `expanded` / `collapsed`. כאשר הרשימה נפתחת, המיקוד נכנס לתיבת החיפוש, מקשי החצים מזיזים את ההדגשה, Enter בוחר וסוגר; לאחר הסגירה המיקוד חוזר לטריגר.
