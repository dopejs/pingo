---
title: תפריט נפתח
description: תפריט פעולות הנפתח בלחיצה על טריגר, עם תמיכה בניווט מקלדת.
---

# Dropdown Menu

Dropdown Menu פורס קבוצת פריטי פעולה מתחת לטריגר. התצוגה המקדימה שלהלן מרונדרת בזמן אמת על ידי מנוע pingo – לחצו על הטריגר כדי לפתוח ולסגור, והיא עוקבת אחר ערכת הנושא של האתר למעבר בין מצב בהיר לכהה.

:::preview dropdown-menu-basic
:::

## שימוש

```tsx
import { createElement } from "@dopejs/pingo";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@dopejs/pingo-ui";

root.render(
  createElement(DropdownMenu, {
    onValueChange: (value) => run(value),
    children: [
      createElement(DropdownMenuTrigger, {
        children: createElement(Button, { children: "פתח תפריט", onPress: () => {} }),
      }),
      createElement(DropdownMenuContent, {
        children: [
          createElement(DropdownMenuItem, { value: "profile", children: "פרופיל אישי" }),
          createElement(DropdownMenuItem, { value: "settings", children: "הגדרות" }),
        ],
      }),
    ],
  }),
);
```

Trigger ו-Content קוראים את מצב רכיב השורש דרך context, וחייבים להיות צאצאים של אותו `DropdownMenu`. בחירת פריט מפעילה את `onValueChange` וסוגרת את התפריט אוטומטית. הפתיחה והסגירה אינן נשלטות כברירת מחדל (`defaultOpen`), והרכיב אינו מספק prop נשלט `open` – לבחירת רשימה נשלטת לחלוטין השתמשו ב-Select (שניהם חולקים את אותו מימוש).

## Props

### DropdownMenu

| Prop | סוג | ברירת מחדל | תיאור |
| --- | --- | --- | --- |
| `value` | `string` | — | הערך הנבחר הנוכחי (מסמן את הפריט המתאים) |
| `defaultOpen` | `boolean` | `false` | מצב פתיחה/סגירה התחלתי |
| `onValueChange` | `(value: string) => void` | — | קריאה חוזרת בעת בחירת פריט תפריט |
| `onOpenChange` | `(open: boolean) => void` | — | קריאה חוזרת בעת שינוי מצב פתיחה/סגירה |
| `children` | `PingoNode` | — | Trigger ו-Content (חובה) |
| `className` | `string` | — | מצורף לאחר שם מחלקת מיכל העוגן |

### DropdownMenuTrigger

| Prop | סוג | ברירת מחדל | תיאור |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | אלמנט הטריגר; בהיעדרו יוצג הערך הנוכחי/טקסט חלופי |
| `placeholder` | `string` | — | טקסט חלופי כשאין ערך נבחר |
| `className` | `string` | — | שם מחלקה נוסף |

### DropdownMenuContent

| Prop | סוג | ברירת מחדל | תיאור |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | פריטי התפריט (חובה) |
| `className` | `string` | — | שם מחלקה נוסף |

### DropdownMenuItem

| Prop | סוג | ברירת מחדל | תיאור |
| --- | --- | --- | --- |
| `value` | `string` | — | ערך פריט התפריט (חובה) |
| `children` | `string` | — | טקסט התצוגה (חובה) |
| `className` | `string` | — | שם מחלקה נוסף |

## נגישות

לתפריט יש סמנטיקה של menu, ולפריטי התפריט סמנטיקה של menuitem; לאחר הפתיחה ניתן לנוע עם מקשי החצים למעלה ולמטה, לבחור עם `Enter`/`Space`, ולסגור עם `Escape` תוך החזרת הפוקוס לטריגר.
