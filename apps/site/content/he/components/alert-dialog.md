---
title: Alert Dialog
description: תיבת דו-שיח לאישור פעולות הרסניות, עם צמד כפתורי ביטול/אישור מובנה.
---

# Alert Dialog

תיבת האישור היא Dialog עם צמד כפתורי ״ביטול / אישור״ מובנה, המיועדת לאישור חוזר לפני פעולות בלתי הפיכות. התצוגה המקדימה למטה מרונדרת בזמן אמת על ידי מנוע pingo, ומתחלפת בין מצב בהיר לכהה בהתאם לערכת הנושא של האתר.

:::preview alert-dialog-basic
:::

## שימוש

```tsx
import { createElement } from "@dopejs/pingo";
import { AlertDialog } from "@dopejs/pingo-ui";

root.render(
  createElement(AlertDialog, {
    open,
    onOpenChange: (next) => setOpen(next),
    title: "确认退出？",
    description: "未保存的修改将会丢失。",
    onCancel: () => {},
    onAction: () => quit(),
    children: null,
  }),
);
```

כמו ב-Dialog, שכבת העל ממלאת את מיכל האב שלה — מומלץ לעגן אותה קרוב לצומת השורש. שימו לב ש-`children` עובר בירושה מ-`DialogProps` ועדיין נדרש, אך הוא נדרס על ידי מבנה הכותרת/תיאור/כפתורים המובנה ברכיב — די להעביר `null`. לחיצה על כפתור הביטול או האישור מפעילה קודם את הקריאה החוזרת המתאימה, ולאחר מכן מבקשת סגירה דרך `onOpenChange(false)`; לחיצה על שכבת העל סוגרת גם כן.

## דוגמאות

### פעולה הרסנית

`destructive` מרַנדר את כפתור האישור בצבע סכנה.

:::preview alert-dialog-destructive
:::

## Props

יורש את `DialogProps` (`open`, `onOpenChange`, `children`, `className`), ובנוסף:

| Prop          | סוג          | ברירת מחדל | תיאור                                |
| ------------- | ------------ | ---------- | ------------------------------------ |
| `title`       | `string`     | —          | כותרת (חובה)                         |
| `description` | `string`     | —          | תיאור משלים                          |
| `cancelLabel` | `string`     | `"取消"`   | טקסט כפתור הביטול                    |
| `actionLabel` | `string`     | `"确定"`   | טקסט כפתור האישור                    |
| `onCancel`    | `() => void` | —          | קריאה חוזרת לביטול (ולאחר מכן סגירה) |
| `onAction`    | `() => void` | —          | קריאה חוזרת לאישור (ולאחר מכן סגירה) |
| `destructive` | `boolean`    | `false`    | כפתור האישור משתמש בצבע סכנה         |

## נגישות

בעל סמנטיקה של dialog; כפתורי הביטול והאישור רשומים שניהם במחזור ה-Tab, כך שמשתמשי מקלדת אינם לכודים בתיבת הדו-שיח.
