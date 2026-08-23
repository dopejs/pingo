---
title: Input
description: שדה קלט טקסט חד-שורתי, המונע על ידי מנוע העריכה pingo ומרונדר על גבי canvas.
---

# Input

קלט טקסט חד-שורתי. התצוגה המקדימה שלהלן מרונדרת בזמן אמת על ידי מנוע pingo — לאחר לחיצה ניתן באמת להקליד, לבחור ולמחוק, והיא מתחלפת בין מצב בהיר לכהה בהתאם לערכת הנושא של האתר.

:::preview input-basic
:::

## שימוש

```tsx
import { createElement } from "@dopejs/pingo";
import { Input } from "@dopejs/pingo-ui";

root.render(
  createElement(Input, {
    semanticLabel: "דוא״ל",
    width: 320,
    onValueChange: (value) => console.log(value),
  }),
);
```

`Input` מתחזק באופן פנימי `TextEditingController` יציב באמצעות hooks, ולכן יש לעטוף אותו כרכיב עם `createElement(Input, props)` ולא לקרוא לו ישירות כפונקציה. פרטי עריכה נוספים זמינים ב[מדריך עריכת טקסט](/guide/editing).

## דוגמאות

### קידומת, סיומת וסיסמה

משבצות `prefix`/`suffix` יכולות להכיל אייקונים או יחידות מידה; `password` מפעיל קלט מוסווה; `disabled` נועל את השדה כולו.

:::preview input-adornments
:::

### שימוש מבוקר

העברת `controller` משלך מעבירה את הרכיב למצב מבוקר, שבו `value` משמש רק כערך התחלתי ונזנח — הקורא מחזיק את הבקר ושומר על אותו מופע בין רינדורים.

## Props

| Prop            | סוג                                                                                   | ברירת מחדל | תיאור                                                    |
| --------------- | ------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------- |
| `value`         | `string`                                                                              | `""`       | ערך התחלתי לשימוש לא מבוקר; נזנח לאחר הגדרת `controller` |
| `onValueChange` | `(value: string) => void`                                                             | —          | נקרא לאחר כל החלת טרנזקציית עריכה עם הערך העדכני         |
| `controller`    | `TextEditingController`                                                               | —          | פתח מילוט מתקדם: בקר עמיד המוחזק בידי הקורא              |
| `onTransaction` | `(transaction: EditTransaction) => void`                                              | —          | הקריאה החוזרת הגולמית עבור כל טרנזקציית עריכה            |
| `onSubmit`      | `() => void`                                                                          | —          | קריאה חוזרת לשליחה (Enter)                               |
| `disabled`      | `boolean`                                                                             | `false`    | מצב מושבת                                                |
| `readOnly`      | `boolean`                                                                             | `false`    | מצב קריאה בלבד                                           |
| `password`      | `boolean`                                                                             | `false`    | קלט מוסווה                                               |
| `inputMode`     | `"decimal" \| "email" \| "none" \| "numeric" \| "search" \| "tel" \| "text" \| "url"` | `"text"`   | רמז לפריסת מקלדת רכה                                     |
| `className`     | `string`                                                                              | —          | מצורף לאחר שם מחלקת הרכיב                                |
| `width`         | `number`                                                                              | —          | רוחב קבוע (px)                                           |
| `semanticLabel` | `string`                                                                              | —          | שם נגישות                                                |
| `prefix`        | `PingoNode`                                                                           | —          | קישוט קדמי, כגון אייקון או סמל מטבע                      |
| `suffix`        | `PingoNode`                                                                           | —          | קישוט אחורי, כגון יחידת מידה או כפתור ניקוי              |

## נגישות

יש לספק את שם השדה באמצעות `semanticLabel`; הן `disabled` והן `readOnly` מוציאים את השדה מרצף העריכה. פערים ידועים כיום: אין עדיין טקסט placeholder ואין סגנון טבעת מיקוד.
