---
title: Toggle Group
description: קבוצת כפתורי מיתוג דו־מצביים, בחירה יחידה או מרובה, עם ניווט במקשי חצים ורינדור על קנבס pingo.
---

# Toggle Group

קבוצת כפתורי מיתוג מאגדת כמה [Toggle](/components/toggle) לאוסף בחירה יחידה או מרובה. התצוגה המקדימה שלהלן מרונדרת בזמן אמת על ידי מנוע pingo – ניתן ללחוץ כדי להחליף מצב, לנוע בין הפריטים במקשי החצים, ולעבור בין מצב בהיר לכהה בהתאם לערכת הנושא של האתר.

:::preview toggle-group-basic
:::

## שימוש

```tsx
import { ToggleGroup, ToggleGroupItem } from "@dopejs/pingo-ui";

root.render(
  <ToggleGroup
    type="single"
    defaultValue={["center"]}
    onValueChange={(value) => console.log(value)}
  >
    <ToggleGroupItem value="left">יישור שמאלה</ToggleGroupItem>
    <ToggleGroupItem value="center">ממורכז</ToggleGroupItem>
    <ToggleGroupItem value="right">יישור ימינה</ToggleGroupItem>
  </ToggleGroup>,
);
```

`ToggleGroup` מפרסם דרך context את אוסף הבחירה אל `ToggleGroupItem`, ושניהם חייבים להיות מורכבים כרכיבים באמצעות JSX. במצב `type: "single"` בחירה חדשה מנקה את הקודמת; במצב `"multiple"` פריטים מצטברים זה לזה.

## דוגמאות

### בחירה מרובה

`type="multiple"` מאפשר ללחוץ על כמה פריטים בו־זמנית, כמו בסרגל כלים לעיצוב טקסט.

:::preview toggle-group-multiple
:::

## Props

### ToggleGroup

| Prop            | טיפוס                                | ברירת מחדל | תיאור                                                               |
| --------------- | ------------------------------------ | ---------- | ------------------------------------------------------------------- |
| `type`          | `"single" \| "multiple"`             | `"single"` | בחירה יחידה מנקה את הבחירה הקודמת; בחירה מרובה מצטברת פריט אחר פריט |
| `value`         | `readonly string[]`                  | —          | אוסף ערכי בחירה נשלט                                                |
| `defaultValue`  | `readonly string[]`                  | `[]`       | אוסף בחירה התחלתי בלתי נשלט                                         |
| `onValueChange` | `(value: readonly string[]) => void` | —          | קריאה חוזרת בשינוי אוסף הבחירה                                      |
| `children`      | `PingoNode`                          | —          | רשימת `ToggleGroupItem` (חובה)                                      |
| `className`     | `string`                             | —          | מצורף אחרי שם המחלקה של הרכיב                                       |

### ToggleGroupItem

| Prop        | טיפוס     | ברירת מחדל | תיאור                         |
| ----------- | --------- | ---------- | ----------------------------- |
| `value`     | `string`  | —          | ערך הפריט (חובה)              |
| `children`  | `string`  | —          | טקסט הפריט (חובה)             |
| `disabled`  | `boolean` | `false`    | השבתת פריט בודד               |
| `className` | `string`  | —          | מצורף אחרי שם המחלקה של הרכיב |

## נגישות

מיכל הקבוצה נושא סמנטיקה של `group`, וכל פריט יורש מ־Toggle את סמנטיקת הכפתור ואת ערכי הסמנטיקה `on` / `off`. טיפול המקלדת מרוכז ברמת הקבוצה: `←`/`→` מעבירים את המיקוד לפריט הסמוך, ו־`Enter`/`מקש רווח` מחליפים את הפריט הנוכחי – הוספה או הסרה של פריטים אינה משפיעה על ניווט זה.
