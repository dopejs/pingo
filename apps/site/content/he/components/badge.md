---
title: Badge
description: תגית סטטוס לא אינטראקטיבית, מרונדרת על קנבס pingo.
---

# Badge

Badge היא תגית סטטוס לא אינטראקטיבית, המשמשת לסימון סטטוס, קטגוריה או כמות, למשל „מנהל" או „Beta". התצוגה המקדימה שלהלן מרונדרת בזמן אמת על ידי מנוע pingo, ומתחלפת בין מצב בהיר לכהה בהתאם לערכת הנושא של האתר.

:::preview badge-variants
:::

## שימוש

```tsx
import { createElement } from "@dopejs/pingo";
import { Badge } from "@dopejs/pingo-ui";

root.render(createElement(Badge, { children: "Beta" }));
```

## דוגמאות

### וריאנטים

ארבעה וריאנטים מכסים סמנטיקה נפוצה: `default` (הדגשה), `secondary` (החלשה), `destructive` (שגיאה/סכנה), `outline` (קו מתאר). בתצוגה המקדימה הם מוצגים לפי הסדר.

```tsx
createElement(Badge, { children: "קריאה בלבד", variant: "secondary" });
```

### שילוב עם רכיבים אחרים

Badge משמשת לעיתים קרובות כרכיב trailing בשורת רשימה או בכרטיס, בשילוב עם `Avatar` ו־`ListRow`:

```tsx
createElement(ListRow, {
  title: "ג'אנג סאן",
  leading: createElement(Avatar, { fallback: "ג'", size: 32 }),
  trailing: createElement(Badge, { children: "מנהל" }),
  onPress: () => {},
});
```

## Props

| Prop            | סוג                                                      | ברירת מחדל  | תיאור                                                        |
| --------------- | -------------------------------------------------------- | ----------- | ------------------------------------------------------------ |
| `children`      | `string`                                                 | —           | טקסט התגית (חובה)                                            |
| `variant`       | `"default" \| "secondary" \| "destructive" \| "outline"` | `"default"` | וריאנט חזותי                                                 |
| `semanticLabel` | `string`                                                 | —           | שם נגישות; אם הושמט, נעשה שימוש בסמנטיקה המוגדרת כברירת מחדל |
| `className`     | `string`                                                 | —           | מצורף לאחר שם המחלקה של הרכיב                                |

## נגישות

Badge אינה מגיבה למצביע או למקלדת, והיא רכיב תצוגה בלבד. כאשר הטקסט אינו מספיק כדי להעביר את המשמעות (כמו תווית מספרית בלבד), יש להשתמש ב־`semanticLabel` כדי לספק תיאור מלא.
