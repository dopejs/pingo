---
title: תפריט ניווט
description: שורת תפריט בסגנון ניווט אתר, עם התנהגות זהה ל-Menubar אך עם סמנטיקה של ניווט.
---

# תפריט ניווט

Navigation Menu הוא הגרסה הסמנטית לניווט של [Menubar](/components/menubar): אותה שורת טריגרים ואותם לוחות נפתחים, אך עם חשיפת סמנטיקת navigation, המתאימה לניווט הראשי של האתר. התצוגה המקדימה שלהלן מרונדרת בזמן אמת על ידי מנוע pingo, ועוקבת אחר ערכת הנושא של האתר במעבר בין מצב בהיר לכהה.

:::preview navigation-menu-basic
:::

## שימוש

```tsx
import { createElement } from "@dopejs/pingo";
import { MenubarMenu, NavigationMenu } from "@dopejs/pingo-ui";

root.render(
  createElement(NavigationMenu, {
    onValueChange: (value) => {},
    children: [
      createElement(MenubarMenu, {
        value: "products",
        label: "产品",
        children: createElement("text", { value: "渲染引擎" }),
      }),
      createElement(MenubarMenu, {
        value: "docs",
        label: "文档",
        children: createElement("text", { value: "快速开始" }),
      }),
    ],
  }),
);
```

הפריטים עושים שימוש חוזר ב-`MenubarMenu`. הפתיחה והסגירה אינן מנוהלות כברירת מחדל; העברת `value` מעבירה למצב מנוהל. התנהגות האינטראקציה (ניווט מקלדת, שיתוף מיקום פתיחה) זהה לחלוטין ל-Menubar.

## Props

`NavigationMenu` מקבל את כל ה-props של `MenubarProps` מלבד `navigation`:

| Prop | סוג | ברירת מחדל | תיאור |
| --- | --- | --- | --- |
| `value` | `string` | — | מנוהל: הערך של התפריט הפתוח כעת |
| `onValueChange` | `(value: string \| undefined) => void` | — | קריאה חוזרת לשינוי התפריט הפתוח (`undefined` בעת סגירה) |
| `children` | `PingoNode` | — | מספר `MenubarMenu` (חובה) |
| `className` | `string` | — | שם מחלקה נוסף |

לפריטי props ראו [Menubar](/components/menubar#menubarmenu).

## נגישות

למכל יש סמנטיקת navigation, לתוויות יש סמנטיקת menuitem והן חושפות מצב expanded/collapsed; מקשי החצים ימינה ושמאלה מעבירים בין פריטים, `Escape` סוגר וממקד את התווית הנוכחית.
