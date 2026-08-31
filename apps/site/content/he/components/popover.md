---
title: Popover
description: לוח צף המעוגן ליד טריגר, להשלמת מידע ולפעולות קלות.
---

# Popover

Popover פותח לוח צף ליד הטריגר, והלוח נשאר מעוגן בעת גלילת הדף. התצוגה המקדימה שלהלן מרונדרת בזמן אמת על ידי מנוע pingo — לחצו על הטריגר כדי לפתוח ולסגור, והיא עוקבת אחר מעבר הנושא של האתר בין בהיר לכהה.

:::preview popover-basic
:::

## שימוש

```tsx
import { Button, Popover, PopoverContent, PopoverTrigger } from "@dopejs/pingo-ui";

root.render(
  <Popover defaultOpen={false} onOpenChange={(open) => {}}>
    <PopoverTrigger>
      <Button onPress={() => {}}>打开浮层</Button>
    </PopoverTrigger>
    <PopoverContent>
      <text value="任意内容" />
    </PopoverContent>
  </Popover>,
);
```

`PopoverTrigger` ו־`PopoverContent` קוראים את מצב רכיב השורש דרך context, וחייבים להיות צאצאים של אותו `Popover`. ברירת המחדל היא מצב לא מבוקר (`defaultOpen`); העברת `open` מעבירה למצב מבוקר. הלוח מעוגן כברירת מחדל מתחת לטריגר; לאחר הפעלת קריאה חוזרת של הפריסה, כאשר אין מספיק מקום הוא מתהפך אוטומטית לצד השני.

## דוגמאות

### תוכן כלשהו

ה־`children` של `PopoverContent` מקבל כל `PingoNode`, וניתן להציב בו טופס, רשימה או תוכן טיפוגרפי.

:::preview popover-rich
:::

## Props

### Popover

| Prop           | סוג                       | ברירת מחדל | תיאור                           |
| -------------- | ------------------------- | ---------- | ------------------------------- |
| `open`         | `boolean`                 | —          | מצב פתיחה/סגירה מבוקר           |
| `defaultOpen`  | `boolean`                 | `false`    | מצב פתיחה/סגירה התחלתי לא מבוקר |
| `onOpenChange` | `(open: boolean) => void` | —          | קריאה חוזרת לשינוי פתיחה/סגירה  |
| `children`     | `PingoNode`               | —          | Trigger ו־Content (חובה)        |
| `className`    | `string`                  | —          | נוסף לאחר שם מחלקת מיכל העוגן   |

### PopoverTrigger

| Prop        | סוג         | ברירת מחדל | תיאור               |
| ----------- | ----------- | ---------- | ------------------- |
| `children`  | `PingoNode` | —          | אלמנט הטריגר (חובה) |
| `className` | `string`    | —          | שם מחלקה נוסף       |

### PopoverContent

| Prop        | סוג         | ברירת מחדל | תיאור            |
| ----------- | ----------- | ---------- | ---------------- |
| `children`  | `PingoNode` | —          | תוכן הלוח (חובה) |
| `className` | `string`    | —          | שם מחלקה נוסף    |

## נגישות

לטריגר יש סמנטיקה של button והוא חושף מצב expanded/collapsed; מקש `Escape` סוגר את הלוח ומחזיר את המיקוד לטריגר.
