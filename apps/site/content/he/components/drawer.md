---
title: Drawer
description: לוח מגירה שנגלש פנימה מהקצה העליון או התחתון, מתאים לפעולות תחתונות בסגנון מובייל.
---

# Drawer

מגירה היא לוח שנגלש פנימה מקצה אופקי — שקול ל-[Sheet](/components/sheet) שבו `side` מקבל רק `"top" | "bottom"`. התצוגה המקדימה שלהלן מרונדרת בזמן אמת על ידי מנוע pingo, ועוקבת אחר ערכת הנושא של האתר במעבר בין בהיר לכהה.

:::preview drawer-basic
:::

## שימוש

```tsx
import { Drawer } from "@dopejs/pingo-ui";

root.render(
  <Drawer open={open} onOpenChange={(next) => setOpen(next)} side="bottom">
    <text value="תוכן המגירה" />
  </Drawer>,
);
```

שכבת העל ממלאת את מיכל האב שלה, לכן יש לטעון אותה קרוב לצומת השורש. `open` הוא prop נשלט; לחיצה על המסכה או לחיצה על `Escape` תבקש סגירה דרך `onOpenChange(false)`. עבור בלוקי הכותרת/כפתורים בתוך הלוח ניתן לעשות שימוש חוזר ב-`DialogHeader`, `DialogTitle`, `DialogDescription` ו-`DialogFooter`.

## דוגמאות

### כיוון

`side` תומך ב-`"top"` וב-`"bottom"`, ברירת המחדל היא `"bottom"`.

## Props

יורש את `DialogProps` (`open`, `onOpenChange`, `children`, `className`), ובנוסף:

| Prop   | סוג                 | ברירת מחדל | תיאור                      |
| ------ | ------------------- | ---------- | -------------------------- |
| `side` | `"top" \| "bottom"` | `"bottom"` | הקצה שממנו נגלש הלוח פנימה |

## נגישות

ללוח ישנה סמנטיקה של complementary; בעת פתיחה הפוקוס עובר אל תוך הלוח, ולאחר סגירה עם `Escape` הפוקוס חוזר לאלמנט המפעיל.
