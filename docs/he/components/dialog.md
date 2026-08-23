---
title: Dialog
description: תיבת דו-שיח מודאלית, קוטעת את הזרימה כדי לקבל קלט או אישור מהמשתמש, ומרונדרת על גבי קנבס pingo.
---

# Dialog

תיבת דו-שיח פותחת פאנל מודאלי מעל התוכן הנוכחי, עם שכבת רקע. התצוגה המקדימה למטה מרונדרת בזמן אמת על ידי מנוע pingo — לחיצה על שכבת הרקע או על `Escape` תפעיל את `onOpenChange(false)`, והצבעים מתחלפים בין מצב בהיר לכהה בהתאם לערכת הנושא של האתר.

:::preview dialog-basic
:::

## שימוש

```tsx
import { createElement } from "@dopejs/pingo";
import {
  Button,
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@dopejs/pingo-ui";

root.render(
  createElement(Dialog, {
    open,
    onOpenChange: (next) => setOpen(next),
    children: [
      createElement(DialogHeader, {
        children: [
          createElement(DialogTitle, { children: "עריכת פרופיל" }),
          createElement(DialogDescription, { children: "השינויים יסונכרנו מיד." }),
        ],
      }),
      createElement(DialogFooter, {
        children: createElement(Button, { children: "שמירה", onPress: () => save() }),
      }),
    ],
  }),
);
```

שכבת העל של Dialog ממלאת **את מיכל האב שלה** (ולא את אזור התצוגה), לכן יש למקם אותה קרוב לצומת השורש. `open` הוא prop נשלט: הרכיב אינו מחזיק במצב פתיחה/סגירה, ובעת סגירה הוא מודיע לקורא באמצעות `onOpenChange(false)`.

## דוגמאות

### בלוקים מורכבים

`DialogHeader` / `DialogTitle` / `DialogDescription` / `DialogFooter` הם רכיבי פריסה וטיפוגרפיה טהורים, אותם ניתן לשלב לפי הצורך; `children` מקבל כל `PingoNode` — טפסים ורשימות יכולים להיכנס לפאנל.

## Props

### Dialog

| Prop | סוג | ברירת מחדל | תיאור |
| --- | --- | --- | --- |
| `open` | `boolean` | — | האם הרכיב פתוח (חובה, נשלט) |
| `onOpenChange` | `(open: boolean) => void` | — | קריאה חוזרת בעת בקשה לסגירה/פתיחה |
| `children` | `PingoNode` | — | תוכן הפאנל (חובה) |
| `className` | `string` | — | מצורף לאחר שם המחלקה של שכבת העל |

### DialogHeader / DialogFooter

| Prop | סוג | ברירת מחדל | תיאור |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | תוכן הבלוק (חובה) |
| `className` | `string` | — | שם מחלקה מצורף |

### DialogTitle / DialogDescription

| Prop | סוג | ברירת מחדל | תיאור |
| --- | --- | --- | --- |
| `children` | `string` | — | תוכן טקסטואלי (חובה) |
| `className` | `string` | — | שם מחלקה מצורף |

## נגישות

לפאנל יש סמנטיקה של dialog; בעת פתיחה הפוקוס עובר אל הפאנל, ולאחר סגירה עם `Escape` הפוקוס חוזר לאלמנט המפעיל. אלמנטים אינטראקטיביים בתוך הפאנל נרשמים במחזור ה-Tab. לכותרת יש להשתמש ב-`DialogTitle` (סמנטיקה של heading).
