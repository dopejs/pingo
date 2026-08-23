---
title: תפריט הקשר
description: תפריט הקשר המופעל בלחיצת עכבר ימנית; התפריט מופיע בנקודת לחיצת המצביע.
---

# תפריט הקשר

תפריט הקשר פותח תפריט במיקום המצביע בעת לחיצה ימנית (`contextmenu` אירוע) על אזור היעד. התצוגה המקדימה שלהלן מרונדרת בזמן אמת על ידי מנוע pingo — לחצו ימנית על אזור הטקסט כדי לפתוח את התפריט, והוא יתחלף בין מצב בהיר לכהה בהתאם לערכת הנושא של האתר.

:::preview context-menu-basic
:::

## שימוש

```tsx
import { createElement } from "@dopejs/pingo";
import { ContextMenu } from "@dopejs/pingo-ui";

root.render(
  createElement(ContextMenu, {
    items: [
      { value: "copy", label: "העתק" },
      { value: "paste", label: "הדבק", disabled: true },
      { value: "delete", label: "מחק" },
    ],
    onSelect: (value) => run(value),
    children: createElement("text", { value: "לחץ כאן ימני" }),
  }),
);
```

התפריט ממוקם בנקודת לחיצת המצביע ולא בפינת מפעיל האירוע; הוא נסגר בלחיצה על `Escape` או לאחר בחירת פריט. פריטים מושבתים אינם משתתפים בניווט מקלדת ואינם מגיבים ללחיצה. ברינדור סטטי מוצג רק אזור ההפעלה, והתפריט מופיע בעת לחיצה ימנית.

## Props

| Prop | סוג | ערך ברירת מחדל | תיאור |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | תוכן אזור ההפעלה (חובה) |
| `items` | `readonly ContextMenuEntry[]` | — | פריטי התפריט (חובה) |
| `onSelect` | `(value: string) => void` | — | קריאה חוזרת לבחירת פריט תפריט |
| `onOpenChange` | `(open: boolean) => void` | — | קריאה חוזרת לשינוי מצב פתיחה/סגירה |
| `className` | `string` | — | שם מחלקה נוסף |

### ContextMenuEntry

| שדה | סוג | ערך ברירת מחדל | תיאור |
| --- | --- | --- | --- |
| `value` | `string` | — | ערך פריט התפריט (חובה) |
| `label` | `string` | — | טקסט התצוגה (חובה) |
| `disabled` | `boolean` | `false` | מצב מושבת |

## נגישות

לתפריט יש סמנטיקה של menu, ולפריטי התפריט סמנטיקה של menuitem; לאחר הפתיחה ניתן לנוע עם מקשי החצים למעלה ולמטה, ו-`Escape` סוגר את התפריט.
