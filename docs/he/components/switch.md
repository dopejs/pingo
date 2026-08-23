---
title: Switch
description: פקד מתג נשלט עבור הגדרות בוליאניות שנכנסות לתוקף מיידי, מרונדר על קנבס pingo.
---

# Switch

המתג משמש להגדרות בוליאניות שנכנסות לתוקף מיידי. התצוגה המקדימה שלהלן מרונדרת בזמן אמת על ידי מנוע pingo, ועוקבת אחר ערכת הנושא של האתר למעבר בין מצב בהיר לכהה. Switch הוא רכיב נשלט: התצוגה המקדימה מציגה שילובים סטטיים של מצבי פועל/כבוי/מושבת, והאינטראקציה מונעת על ידי מצב המוחזק אצל הצד הקורא.

:::preview switch-basic
:::

## שימוש

```tsx
import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
import { Switch } from "@dopejs/pingo-ui";

// useSignal הוא hook, וחייב לרוץ בתוך תחום הרכיב.
function AirplaneMode(): PingoNode {
  const on = useSignal(false);
  return createElement(Switch, {
    checked: on.get(),
    semanticLabel: "מצב טיסה",
    onCheckedChange: (next) => on.set(next),
  });
}

root.render(createElement(AirplaneMode));
```

`checked` מוחזק על ידי רכיב האב, ו-`onCheckedChange` אחראי לעדכונו — הרכיב עצמו אינו שומר מצב.

## דוגמאות

### מצב מושבת

כאשר מועבר `disabled`, המתג מפסיק להגיב למצביע ולמקלדת, והערך הסמנטי הופך ל-`disabled`.

## Props

| Prop              | סוג                          | ברירת מחדל | תיאור                     |
| ----------------- | ---------------------------- | ---------- | ------------------------- |
| `checked`         | `boolean`                    | —          | מצב המתג (חובה, נשלט)     |
| `onCheckedChange` | `(checked: boolean) => void` | —          | קריאה חוזרת לשינוי מצב    |
| `disabled`        | `boolean`                    | `false`    | מצב מושבת                 |
| `className`       | `string`                     | —          | מצורף לאחר שם מחלקת הרכיב |
| `semanticLabel`   | `string`                     | —          | שם לנגישות                |

## נגישות

הרכיב נושא תפקיד סמנטי `switch`, והערך הסמנטי עובר בין `on` / `off` / `disabled` בהתאם למצב. בעת לחיצה עם המצביע, הרכיב מקבל פוקוס אוטומטית. למתג אין טקסט גלוי, לכן יש לספק תמיד `semanticLabel`.
