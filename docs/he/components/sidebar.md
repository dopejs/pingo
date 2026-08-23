---
title: Sidebar
description: "עמודת ניווט למוצר: קבוצות, פריטים ומצב נבחר, המרונדרת על גבי קנבס pingo."
---

# Sidebar

Sidebar היא עמודת ניווט ברמת האפליקציה, המורכבת מקבוצות (Section) ומפריטים (Item), עם מצב נבחר מובנה וניווט מקלדת. התצוגה המקדימה שלהלן מרונדרת בזמן אמת על ידי מנוע pingo — לחצו על פריט או התמקדו והשתמשו במקשי החצים למעבר.

:::preview sidebar-basic
:::

## שימוש

```tsx
import { createElement } from "@dopejs/pingo";
import { Sidebar, SidebarItem, SidebarSection } from "@dopejs/pingo-ui";

root.render(
  createElement(Sidebar, {
    defaultValue: "stats",
    onValueChange: (value) => navigate(value),
    children: [
      createElement(SidebarSection, {
        title: "סביבת עבודה",
        children: [
          createElement(SidebarItem, { value: "home", label: "דף הבית" }),
          createElement(SidebarItem, { value: "stats", label: "סטטיסטיקות" }),
        ],
      }),
      createElement(SidebarSection, {
        title: "מערכת",
        children: createElement(SidebarItem, { value: "settings", label: "הגדרות" }),
      }),
    ],
  }),
);
```

`Sidebar` תומך גם בשימוש לא מבוקר (`defaultValue`) וגם בשימוש מבוקר (`value` + `onValueChange`). רוחב עמודת הצד נקבע על ידי token של ערכת הנושא (ברירת מחדל 240px).

## Props

### Sidebar

| Prop            | טיפוס                     | ברירת מחדל | תיאור                                      |
| --------------- | ------------------------- | ---------- | ------------------------------------------ |
| `value`         | `string`                  | —          | מבוקר: ה-`value` של הפריט הנבחר הנוכחי     |
| `defaultValue`  | `string`                  | —          | לא מבוקר: ה-`value` של הפריט הנבחר ההתחלתי |
| `onValueChange` | `(value: string) => void` | —          | קריאה חוזרת בעת שינוי הבחירה               |
| `children`      | `PingoNode`               | —          | רשימת `SidebarSection` (חובה)              |
| `className`     | `string`                  | —          | מצורף לאחר שם מחלקת הרכיב                  |

### SidebarSection

| Prop        | טיפוס       | ברירת מחדל | תיאור                                              |
| ----------- | ----------- | ---------- | -------------------------------------------------- |
| `title`     | `string`    | —          | כותרת הקבוצה; כאשר מושמט, שורת הכותרת אינה מרונדרת |
| `children`  | `PingoNode` | —          | רשימת `SidebarItem` (חובה)                         |
| `className` | `string`    | —          | מצורף לאחר שם מחלקת הרכיב                          |

### SidebarItem

| Prop        | טיפוס       | ברירת מחדל | תיאור                                 |
| ----------- | ----------- | ---------- | ------------------------------------- |
| `value`     | `string`    | —          | מזהה ייחודי של הפריט (חובה)           |
| `label`     | `string`    | —          | טקסט הפריט, משמש גם כשם נגישות (חובה) |
| `icon`      | `PingoNode` | —          | משבצת קדמית, עבור סמל                 |
| `className` | `string`    | —          | מצורף לאחר שם מחלקת הרכיב             |

## נגישות

לעמודת הצד יש סמנטיקה של navigation; לפריטים יש סמנטיקה של link, עם `label` כשם הנגישות וחשיפת מצב selected/unselected. מקשי החצים למעלה ולמטה ו-Home/End מעבירים בין פריטים, והבחירה נעה יחד עם המיקוד.

להתאמה אישית של רוחב עמודת הצד וצבעיה ראו [מדריך הסגנון](/guide/styling).
