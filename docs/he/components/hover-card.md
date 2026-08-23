---
title: Hover Card
description: כרטיס תוכן עשיר שנפתח בריחוף, עם השהיית פתיחה וסגירה.
---

# Hover Card

Hover Card פותח כרטיס תוכן עשיר כאשר מרחפים (או ממקדים) על הטריגר — נושא יותר מידע מ‑Tooltip, כמו תצוגה מקדימה של פרופיל משתמש. התצוגה המקדימה למטה מרונדרת בזמן אמת על ידי מנוע pingo (מוצגת כפתוחה עם `open` מבוקר), ועוקבת אחר ערכת הנושא של האתר בין בהיר לכהה.

:::preview hover-card-basic
:::

## שימוש

```tsx
import { createElement } from "@dopejs/pingo";
import { HoverCard } from "@dopejs/pingo-ui";

root.render(
  createElement(HoverCard, {
    openDelayMs: 300,
    closeDelayMs: 200,
    children: createElement("text", { value: "@pingo" }),
    content: createElement("text", { value: "מנוע רינדור Canvas וספריית רכיבי UI." }),
  }),
);
```

הכרטיס לא נסגר גם כאשר מרחפים על הכרטיס עצמו לאחר שנפתח, כך ש‑`closeDelayMs` נותן למצביע זמן לחצות את המרווח בין הטריגר לכרטיס. העברת `open` מעבירה למצב מבוקר, וניתן לנהל את המצב בעצמך יחד עם `onOpenChange`.

## Props

| Prop | סוג | ברירת מחדל | תיאור |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | אלמנט הטריגר (חובה) |
| `content` | `PingoNode` | — | תוכן הכרטיס (חובה) |
| `open` | `boolean` | — | מצב פתיחה/סגירה מבוקר |
| `onOpenChange` | `(open: boolean) => void` | — | קריאה חוזרת לשינוי פתיחה/סגירה |
| `openDelayMs` | `number` | `300` | השהיית פתיחה (מילישניות) |
| `closeDelayMs` | `number` | `200` | השהיית סגירה (מילישניות) |
| `className` | `string` | — | מצורף לאחר שם מחלקת מיכל העוגן |

## נגישות

הטריגר פותח את הכרטיס גם בעת מיקוד, ונסגר בעת איבוד מיקוד, כך שמשתמשי מקלדת לא מאבדים את התוכן.
