---
title: Tooltip
description: טקסט הסבר קצר המוצג בריחוף, מעוגן מעל רכיב המטרה.
---

# Tooltip

Tooltip מציג טקסט הסבר קצר בעת ריחוף המצביע, ומעוגן כברירת מחדל מעל המטרה. התצוגה המקדימה שלהלן מרונדרת בזמן אמת על ידי מנוע pingo — רחפו עם המצביע מעל הכפתור כדי לראות את הבועה, העוקבת אחר ערכת הנושא של האתר ומתחלפת בין בהיר לכהה.

:::preview tooltip-basic
:::

## שימוש

```tsx
import { createElement } from "@dopejs/pingo";
import { Button, Tooltip } from "@dopejs/pingo-ui";

root.render(
  createElement(Tooltip, {
    content: "שמירה לענן",
    children: createElement(Button, { children: "שמור", onPress: () => save() }),
  }),
);
```

Tooltip מונע מכניסה ויציאה של המצביע (`pointerenter` / `pointerleave`), ללא props נשלטים; ברינדור סטטי מוצג רק רכיב ההפעלה, והבועה מופיעה בעת ריחוף.

## Props

| Prop        | סוג         | ברירת מחדל | תיאור                              |
| ----------- | ----------- | ---------- | ---------------------------------- |
| `content`   | `string`    | —          | טקסט הבועה (חובה)                  |
| `children`  | `PingoNode` | —          | רכיב ההפעלה (חובה)                 |
| `className` | `string`    | —          | נוסף לאחר שם המחלקה של מיכל העיגון |

## נגישות

הבועה נושאת סמנטיקה של tooltip. Tooltip מופיע רק בריחוף ואינו מגיב למיקוד מקלדת; אין להעביר מידע קריטי דרך Tooltip בלבד.
