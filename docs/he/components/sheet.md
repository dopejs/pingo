---
title: Sheet
description: פאנל שנגלל פנימה מכל קצה של המסך, מתאים לתוכן משני כמו סינון ופרטים.
---

# Sheet

Sheet גולל פאנל פנימה מקצה המכולה, ונפוץ לשימוש עבור תנאי סינון, סרגל צד לפרטים ותוכן משני שאינו קוטע את הזרימה הראשית. התצוגה המקדימה למטה מרונדרת בזמן אמת על ידי מנוע pingo, ועוקבת אחר ערכת הנושא של האתר למעבר בין מצב בהיר לכהה.

:::preview sheet-basic
:::

## שימוש

```tsx
import { createElement } from "@dopejs/pingo";
import { Sheet } from "@dopejs/pingo-ui";

root.render(
  createElement(Sheet, {
    open,
    onOpenChange: (next) => setOpen(next),
    side: "right",
    children: createElement("text", { value: "תוכן הפאנל" }),
  }),
);
```

שכבת העל ממלאת את מכולת האב שלה, ולכן יש להרכיב אותה קרוב לצומת השורש. `open` הוא prop מבוקר; לחיצה על שכבת המסך או לחיצה על `Escape` תבקש סגירה דרך `onOpenChange(false)`. עבור אזורי הכותרת/כפתורים בתוך הפאנל ניתן לעשות שימוש חוזר ב-`DialogHeader`, `DialogTitle`, `DialogDescription` ו-`DialogFooter`.

## דוגמאות

### כיוון

`side` תומך ב-`"left"`, `"right"`, `"top"`, `"bottom"`, ברירת המחדל היא `"right"`. כאשר נדרשים רק הקצוות העליון והתחתון, יש להשתמש ב-[Drawer](/components/drawer) בעל הסמנטיקה המפורשת יותר.

## Props

יורש את `DialogProps` (`open`, `onOpenChange`, `children`, `className`), ובנוסף:

| Prop   | סוג                                      | ברירת מחדל | תיאור            |
| ------ | ---------------------------------------- | ---------- | ---------------- |
| `side` | `"left" \| "right" \| "top" \| "bottom"` | `"right"`  | קצה הגלילה פנימה |

## נגישות

לפאנל יש סמנטיקה משלימה (complementary); בפתיחה המיקוד עובר לתוך הפאנל, ולאחר סגירה עם `Escape` המיקוד חוזר לאלמנט המפעיל.
