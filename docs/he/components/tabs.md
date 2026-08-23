---
title: Tabs
description: כרטיסיות מחליפות קבוצת לוחות באותה רמה, ומרונדרות על קנבס pingo.
---

# Tabs

כרטיסיות מחליפות מספר לוחות תוכן באותה רמה בתוך אותו אזור. התצוגה המקדימה שלהלן מרונדרת בזמן אמת על ידי מנוע pingo — ניתן ללחוץ על כרטיסייה כדי לעבור, או להשתמש במקשי החצים שמאלה/ימינה כדי לנוע בין הכרטיסיות.

:::preview tabs-basic
:::

## שימוש

```tsx
import { createElement } from "@dopejs/pingo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@dopejs/pingo-ui";

root.render(
  createElement(Tabs, {
    defaultValue: "account",
    children: [
      createElement(TabsList, {
        children: [
          createElement(TabsTrigger, { value: "account", children: "חשבון" }),
          createElement(TabsTrigger, { value: "password", children: "סיסמה" }),
        ],
      }),
      createElement(TabsContent, {
        value: "account",
        children: createElement("text", { value: "נהל את פרטי החשבון שלך." }),
      }),
      createElement(TabsContent, {
        value: "password",
        children: createElement("text", { value: "שנה את סיסמת הכניסה שלך." }),
      }),
    ],
  }),
);
```

`Tabs` תומך הן בשימוש לא מבוקר (`defaultValue`) והן בשימוש מבוקר (`value` + `onValueChange`).

## Props

### Tabs

| Prop            | סוג                       | ברירת מחדל | תיאור                                          |
| --------------- | ------------------------- | ---------- | ---------------------------------------------- |
| `value`         | `string`                  | —          | מבוקר: ה-`value` של הכרטיסייה שנבחרה כעת       |
| `defaultValue`  | `string`                  | —          | לא מבוקר: ה-`value` של הכרטיסייה שנבחרה בתחילה |
| `onValueChange` | `(value: string) => void` | —          | קריאה חוזרת בעת שינוי הבחירה                   |
| `children`      | `PingoNode`               | —          | `TabsList` ומספר `TabsContent` (חובה)          |
| `className`     | `string`                  | —          | מצורף לאחר שם המחלקה של הרכיב                  |

### TabsList

| Prop        | סוג         | ברירת מחדל | תיאור                         |
| ----------- | ----------- | ---------- | ----------------------------- |
| `children`  | `PingoNode` | —          | רשימת `TabsTrigger` (חובה)    |
| `className` | `string`    | —          | מצורף לאחר שם המחלקה של הרכיב |

### TabsTrigger

| Prop        | סוג      | ברירת מחדל | תיאור                                     |
| ----------- | -------- | ---------- | ----------------------------------------- |
| `value`     | `string` | —          | מזהה המקושר ל-`TabsContent` המתאים (חובה) |
| `children`  | `string` | —          | טקסט הכרטיסייה (חובה)                     |
| `className` | `string` | —          | מצורף לאחר שם המחלקה של הרכיב             |

### TabsContent

| Prop        | סוג         | ברירת מחדל | תיאור                                     |
| ----------- | ----------- | ---------- | ----------------------------------------- |
| `value`     | `string`    | —          | מזהה המקושר ל-`TabsTrigger` המתאים (חובה) |
| `children`  | `PingoNode` | —          | תוכן הלוח (חובה)                          |
| `className` | `string`    | —          | מצורף לאחר שם המחלקה של הרכיב             |

## נגישות

לרשימת הכרטיסיות יש סמנטיקה של tablist, לכרטיסיות יש סמנטיקה של tab והן חושפות את מצב הבחירה לטכנולוגיות מסייעות. מקשי החצים שמאלה/ימינה ו-Home/End מנועים בין הכרטיסיות ובוחרים בו-זמנית, והמיקוד נע יחד עם הבחירה; לוחות שאינם פעילים מוסתרים באמצעות `display: none` במקום להיות מוסרים, כך שמיקום הגלילה ומצב העריכה בתוך הלוח נשמרים.
