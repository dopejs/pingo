---
title: Text Area
description: שדה קלט רב־שורתי, מונע על ידי מנוע העריכה pingo ומרונדר על גבי canvas.
---

# Text Area

קלט רב־שורתי עבור תוכן ארוך יותר כמו הערות או תיאורים. התצוגה המקדימה שלהלן מרונדרת בזמן אמת על ידי מנוע pingo – לאחר לחיצה ניתן להקליד טקסט רב־שורתי בפועל, והתצוגה עוקבת אחר מעבר הנושא של האתר בין מצב בהיר לכהה.

:::preview text-area-basic
:::

## שימוש

```tsx
import { TextArea } from "@dopejs/pingo-ui";

root.render(
  <TextArea
    semanticLabel="תיאור אישי"
    width={360}
    rows={4}
    onValueChange={(value) => console.log(value)}
  />,
);
```

`rows` קובע את מספר השורות הגלויות ונועל את הגובה המינימלי של המעטפת (`rows × גובה שורה + ריפוד אנכי`). כמו ב-[Input](/components/input), יש לעגן את `TextArea` כרכיב באמצעות JSX. פרטי עריכה נוספים נמצאים ב[מדריך עריכת טקסט](/guide/editing).

## דוגמאות

### מצב מושבת

כאשר מעבירים `disabled`, השדה מפסיק לקבל קלט ומיושם עליו סגנון מושבת.

## Props

| Prop            | סוג                                      | ברירת מחדל | תיאור                                                            |
| --------------- | ---------------------------------------- | ---------- | ---------------------------------------------------------------- |
| `value`         | `string`                                 | `""`       | ערך התחלתי לשימוש לא מבוקר; מתעלמים ממנו כאשר מוגדר `controller` |
| `onValueChange` | `(value: string) => void`                | —          | נקרא עם הערך העדכני לאחר החלת כל טרנזקציית עריכה                 |
| `controller`    | `TextEditingController`                  | —          | פתח מילוט מתקדם: בקר מתמשך המוחזק בידי הקורא                     |
| `onTransaction` | `(transaction: EditTransaction) => void` | —          | קריאה חוזרת גולמית עבור כל טרנזקציית עריכה                       |
| `onSubmit`      | `() => void`                             | —          | קריאה חוזרת לשליחה                                               |
| `disabled`      | `boolean`                                | `false`    | מצב מושבת                                                        |
| `readOnly`      | `boolean`                                | `false`    | מצב קריאה בלבד                                                   |
| `rows`          | `number`                                 | —          | מספר שורות גלוי, קובע את הגובה המינימלי של המעטפת                |
| `className`     | `string`                                 | —          | מצורף אחרי שם המחלקה של הרכיב                                    |
| `width`         | `number`                                 | —          | רוחב קבוע (px)                                                   |
| `semanticLabel` | `string`                                 | —          | שם הנגישות                                                       |

## נגישות

ספקו שם שדה באמצעות `semanticLabel`; גם `disabled` וגם `readOnly` מוציאים את השדה מרצף העריכה. קיים פער ידוע המשותף לרכיב Input: עדיין אין טקסט placeholder וסגנון טבעת מיקוד.
