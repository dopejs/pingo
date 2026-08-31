---
title: Collapsible
description: אזור תוכן יחיד הניתן לפתיחה וסגירה, המרונדר על גבי קנבס pingo.
---

# Collapsible

Collapsible היא הפרימיטיבה הבודדת של Accordion: טריגר אחד שולט בפתיחה ובסגירה של אזור תוכן, מתאים לתרחישים שבהם דרוש אזור קיפול אחד בלבד. התצוגה המקדימה שלהלן מרונדרת בזמן אמת על ידי מנוע pingo — לחצו על הטריגר כדי להחליף מצב.

:::preview collapsible-basic
:::

## שימוש

```tsx
import { Collapsible } from "@dopejs/pingo-ui";

root.render(
  <Collapsible trigger="אפשרויות מתקדמות" defaultOpen>
    <text value="תוכן אזור הקיפול." />
  </Collapsible>,
);
```

תומך הן בשימוש לא מבוקר (`defaultOpen`) והן בשימוש מבוקר (`open` + `onOpenChange`).

## דוגמאות

### מצב מושבת

כאשר מעבירים את `disabled`, הטריגר מפסיק להגיב למצביע ולמקלדת, ומוחל עיצוב מושבת.

:::preview collapsible-disabled
:::

## Props

| Prop           | סוג                       | ברירת מחדל | תיאור                            |
| -------------- | ------------------------- | ---------- | -------------------------------- |
| `trigger`      | `string`                  | —          | טקסט הטריגר (חובה)               |
| `children`     | `PingoNode`               | —          | התוכן המוצג לאחר הפתיחה (חובה)   |
| `open`         | `boolean`                 | —          | מבוקר: מצב הפתיחה הנוכחי         |
| `defaultOpen`  | `boolean`                 | `false`    | לא מבוקר: מצב הפתיחה ההתחלתי     |
| `onOpenChange` | `(open: boolean) => void` | —          | קריאה חוזרת בעת שינוי מצב הפתיחה |
| `disabled`     | `boolean`                 | `false`    | השבתת הטריגר                     |
| `className`    | `string`                  | —          | נוסף לאחר שם מחלקת הרכיב         |

## נגישות

לטריגר יש סמנטיקה של button, והוא חושף מצב expanded/collapsed לטכנולוגיות מסייעות; Enter ומקש הרווח מחליפים את מצב הפתיחה. כאשר התוכן סגור הוא מוסתר באמצעות `display: none` ולא נפרק, כך שמיקום הגלילה ומצב העריכה הפנימיים נשמרים.
