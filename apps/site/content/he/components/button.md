---
title: Button
description: כפתור להפעלת פעולות או אירועים, המרונדר על גבי קנבס pingo.
---

# Button

כפתור מפעיל פעולה. התצוגה המקדימה למטה מרונדרת בזמן אמת על ידי מנוע pingo — ניתן ללחוץ, למקד, ולעקוב אחרי מעבר הנושא של האתר בין בהיר לכהה.

:::preview button-basic
:::

## שימוש

```tsx
import { Button } from "@dopejs/pingo-ui";

root.render(
  <Button variant="default" onPress={() => save()}>
    שמור
  </Button>,
);
```

## דוגמאות

### גודל

`size` תומך ב־`default`, `sm`, `lg` ו־`icon`.

### מצב מושבת

כאשר מעבירים `disabled` הכפתור מפסיק להגיב למצביע ולמקלדת, ומוחלים עליו סגנונות של מצב מושבת.

## Props

| Prop            | טיפוס                                                               | ברירת מחדל  | תיאור                                  |
| --------------- | ------------------------------------------------------------------- | ----------- | -------------------------------------- |
| `children`      | `string`                                                            | —           | טקסט הכפתור (חובה)                     |
| `variant`       | `"default" \| "secondary" \| "outline" \| "ghost" \| "destructive"` | `"default"` | וריאציה חזותית                         |
| `size`          | `"default" \| "sm" \| "lg" \| "icon"`                               | `"default"` | גודל                                   |
| `disabled`      | `boolean`                                                           | `false`     | מצב מושבת                              |
| `onPress`       | `() => void`                                                        | —           | קריאה חוזרת להפעלה באמצעות מצביע/מקלדת |
| `semanticLabel` | `string`                                                            | `children`  | שם לנגישות                             |
| `className`     | `string`                                                            | —           | מתווסף לאחר שם מחלקת הרכיב             |

## נגישות

לכפתור יש סמנטיקה של button ותמיכה בהפעלה באמצעות מקלדת; `semanticLabel` מקבל כברירת מחדל את `children`, עבור כפתורי אייקון יש לספק אותו במפורש.
