---
title: Avatar
description: אווטאר עגול, נופל לראשי תיבות כשהתמונה חסרה, מרונדר על קנבס pingo.
---

# Avatar

Avatar מציג אווטאר של משתמש: כשהועבר משאב תמונה מפוענח הוא מוצג בחיתוך עגול, וכשלא הועבר הוא נופל לקיצור `fallback`. התצוגה המקדימה שלהלן מרונדרת בזמן אמת על ידי מנוע pingo, ועוקבת אחר החלפת הנושא של האתר בין בהיר לכהה.

:::preview avatar-basic
:::

## שימוש

```tsx
import { createElement } from "@dopejs/pingo";
import { Avatar } from "@dopejs/pingo-ui";

root.render(createElement(Avatar, { fallback: "张" }));
```

כשיש תמונה, העבירו משאב `PingoImage` מפוענח מראש; התמונה ממולאת ב-`object-fit: cover` ונחתכת לעיגול:

```tsx
createElement(Avatar, { image: decodedImage, fallback: "张" });
```

## דוגמאות

### גודל

`size` הוא אורך הצלע של הריבוע (px), ובמקביל מגדיר את רדיוס הפינות כ-`size / 2`. כשהוא מושמט נעשה שימוש בערך ברירת המחדל של הערכת העיצוב, 40px. בתצוגה המקדימה: 32, ברירת מחדל, 56.

```tsx
createElement(Avatar, { fallback: "李", size: 32 });
```

## Props

| Prop | סוג | ברירת מחדל | תיאור |
| --- | --- | --- | --- |
| `image` | `PingoImage` | — | משאב תמונה מפוענח מראש; כשהוא חסר מוצג קיצור `fallback` |
| `fallback` | `string` | — | טקסט קיצור, מוצג כשהתמונה חסרה (חובה) |
| `size` | `number` | ברירת מחדל של הערכת העיצוב `40` | אורך צלע הריבוע (px) |
| `className` | `string` | — | מצורף אחרי שם המחלקה של הרכיב |

## נגישות

קיצור ה-`fallback` משמש גם כשם קריא, לכן השתמשו בתווים שמייצגים את המשתמש (כמו שם משפחה או ראשי תיבות של שם), ואל תעבירו תווי placeholder.
