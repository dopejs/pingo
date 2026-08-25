---
title: Alert
description: בלוק callout להצגת מידע חשוב, המרונדר על קנבס pingo.
---

# Alert

Alert משמש להצגת מידע הדורש תשומת לב משתמש, אך אינו מפריע לזרימה. התצוגה המקדימה שלהלן מרונדרת בזמן אמת על ידי מנוע pingo, ועוקבת אחר ערכת הנושא של האתר לבהיר/כהה.

:::preview alert-basic
:::

## שימוש

```tsx
import { createElement } from "@dopejs/pingo";
import { Alert } from "@dopejs/pingo-ui";

root.render(
  createElement(Alert, {
    title: "提示",
    children: "你的配置已自动保存。",
  }),
);
```

## דוגמאות

### התראה הרסנית

`variant="destructive"` משמש לתרחישי שגיאה או כשל: המסגרת והכותרת משתנות לצבעוניות הרסנית, וטקסט התיאור נשאר בצבע קדמי רגיל כדי לשמור על קריאות.

```tsx
createElement(Alert, {
  title: "同步失败",
  variant: "destructive",
  children: "请检查网络连接后重试。",
});
```

## Props

| Prop        | סוג                          | ברירת מחדל  | תיאור                     |
| ----------- | ---------------------------- | ----------- | ------------------------- |
| `title`     | `string`                     | —           | כותרת (חובה)              |
| `children`  | `string`                     | —           | תוכן התיאור (חובה)        |
| `variant`   | `"default" \| "destructive"` | `"default"` | וריאנט חזותי              |
| `className` | `string`                     | —           | מצורף לאחר שם מחלקת הרכיב |

## נגישות

Alert הוא בלוק טקסט סטטי לחלוטין, שאינו תופס פוקוס; השתמשו ב-`title` תמציתי לסיכום המסקנה, והשאירו את הפרטים בתיאור. לתרחישים הדורשים אישור או טיפול מצד המשתמש, השתמשו ב-`AlertDialog`.
