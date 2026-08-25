---
title: Accordion
description: אקורדיון בערימה אנכית שפותח פריט אחד בכל פעם, מרונדר על גבי קנבס pingo.
---

# Accordion

אקורדיון מארגן תוכן קשור לקבוצות אנכיות הניתנות לפתיחה וסגירה, כאשר רק פריט אחד פתוח בכל רגע נתון. התצוגה המקדימה שלהלן מרונדרת בזמן אמת על ידי מנוע pingo — ניתן ללחוץ על כותרת כדי להחליף, או להשתמש במקשי החצים להזזת הפוקוס ו־Enter/רווח לפתיחה.

:::preview accordion-basic
:::

## שימוש

```tsx
import { createElement } from "@dopejs/pingo";
import { Accordion, AccordionItem } from "@dopejs/pingo-ui";

root.render(
  createElement(Accordion, {
    defaultOpenValue: "intro",
    children: [
      createElement(AccordionItem, {
        value: "intro",
        title: "מה זה pingo-ui?",
        children: createElement("text", { value: "ספריית רכיבים המרונדרת על קנבס pingo." }),
      }),
      createElement(AccordionItem, {
        value: "theme",
        title: "האם יש תמיכה במצב כהה?",
        children: createElement("text", { value: "כן, המעבר מתבצע אוטומטית לפי ערכת הנושא." }),
      }),
    ],
  }),
);
```

`Accordion` תומך הן בשימוש לא נשלט (`defaultOpenValue`) והן בשימוש נשלט (`openValue` + `onValueChange`).

## Props

### Accordion

| Prop               | סוג                                    | ברירת מחדל | תיאור                                                        |
| ------------------ | -------------------------------------- | ---------- | ------------------------------------------------------------ |
| `openValue`        | `string`                               | —          | נשלט: ה־`value` של הפריט הפתוח כעת                           |
| `defaultOpenValue` | `string`                               | —          | לא נשלט: ה־`value` של הפריט הפתוח בהתחלה                     |
| `onValueChange`    | `(value: string \| undefined) => void` | —          | קריאה חוזרת בעת שינוי הפריט הפתוח; `undefined` כאשר הכל סגור |
| `children`         | `PingoNode`                            | —          | רשימת `AccordionItem` (חובה)                                 |
| `className`        | `string`                               | —          | מצורף אחרי שם מחלקת הרכיב                                    |

### AccordionItem

| Prop        | סוג         | ברירת מחדל | תיאור                          |
| ----------- | ----------- | ---------- | ------------------------------ |
| `value`     | `string`    | —          | מזהה ייחודי של הפריט (חובה)    |
| `title`     | `string`    | —          | כותרת הטריגר (חובה)            |
| `children`  | `PingoNode` | —          | התוכן המוצג לאחר הפתיחה (חובה) |
| `className` | `string`    | —          | מצורף אחרי שם מחלקת הרכיב      |

## נגישות

מקשי החצים (למעלה/למטה) מזיזים את הפוקוס בין הכותרות מבלי לשנות את מצב הפתיחה, Home/End קופצים להתחלה/לסוף; Enter או רווח פותחים או סוגרים — בהתאם לדרישת WAI-ARIA להפרדה בין פוקוס לבחירה. אזור התוכן מוסתר בעת סגירה באמצעות `display: none` במקום הסרה מה־DOM, כך שמצב הפתיחה נשמר.
