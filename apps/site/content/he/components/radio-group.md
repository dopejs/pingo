---
title: Radio Group
description: קבוצת אפשרויות בחירה יחידה, תומכת בניווט במקשי חצים, מרונדרת על קנבס pingo.
---

# Radio Group

קבוצת בחירה יחידה משמשת לבחירת אפשרות אחת מתוך קבוצת אפשרויות המוציאות זו את זו. התצוגה המקדימה שלהלן מרונדרת בזמן אמת על ידי מנוע pingo – ניתן ללחוץ על אפשרות או להזיז את הבחירה באמצעות מקשי החצים, ולעקוב אחר מעבר ערכת הנושא של האתר בין מצב בהיר לכהה.

:::preview radio-group-basic
:::

## שימוש

```tsx
import { RadioGroup, RadioGroupItem } from "@dopejs/pingo-ui";

root.render(
  <RadioGroup defaultValue="b" onValueChange={(value) => console.log(value)}>
    <RadioGroupItem value="a" label="אפשרות A" />
    <RadioGroupItem value="b" label="אפשרות B" />
    <RadioGroupItem value="c" label="אפשרות C" />
  </RadioGroup>,
);
```

`RadioGroup` מפיץ את הערך הנוכחי ל‑`RadioGroupItem` דרך context, ולכן יש להרכיב את שניהם כרכיבים באמצעות JSX. העברת `value` מכניסה את הרכיב למצב מבוקר; אחרת יש להשתמש ב‑`defaultValue` כדי לאפשר לרכיב לנהל את המצב בעצמו.

## דוגמאות

### השבתה

העברת `disabled` ל‑`RadioGroup` משביתה את הקבוצה כולה, והערך הסמנטי של כל פריט הופך ל‑`disabled`.

## Props

### RadioGroup

| Prop            | סוג                       | ברירת מחדל | תיאור                         |
| --------------- | ------------------------- | ---------- | ----------------------------- |
| `value`         | `string`                  | —          | ערך נבחר במצב מבוקר           |
| `defaultValue`  | `string`                  | —          | ערך נבחר התחלתי במצב לא מבוקר |
| `onValueChange` | `(value: string) => void` | —          | קריאה חוזרת בעת שינוי הבחירה  |
| `disabled`      | `boolean`                 | `false`    | השבתת הקבוצה כולה             |
| `children`      | `PingoNode`               | —          | רשימת `RadioGroupItem` (חובה) |
| `className`     | `string`                  | —          | מצורף לאחר שם המחלקה של הרכיב |

### RadioGroupItem

| Prop        | סוג      | ברירת מחדל | תיאור                         |
| ----------- | -------- | ---------- | ----------------------------- |
| `value`     | `string` | —          | ערך האפשרות (חובה)            |
| `label`     | `string` | —          | טקסט האפשרות                  |
| `className` | `string` | —          | מצורף לאחר שם המחלקה של הרכיב |

## נגישות

מיכל הקבוצה נושא סמנטיקה של `radiogroup`, וכל פריט נושא סמנטיקה של `radio` ומתחלף בין `checked` / `unchecked` / `disabled`. בהתאם ל‑WAI‑ARIA: בקבוצת בחירה יחידה, ללא תלות בכיוון הפריסה, שתי קבוצות מקשי החצים מאפשרות להזיז את הבחירה ולסנכרן את המיקוד.
