---
title: רכיבים
description: ספריית רכיבי UI מקורית של pingo ברוח shadcn, כולם מרונדרים בזמן אמת על גבי canvas.
---

# רכיבים

`@dopejs/pingo-ui` היא ספריית רכיבים המיושרת עם shadcn/ui: ה-API וסמנטיקת העיצוב נשמרים, ויעד הרינדור הוא מנוע ה-canvas של pingo במקום ה-DOM. כל עמוד רכיב להלן כולל תצוגה מקדימה **המרונדרת בזמן אמת** — התצוגה עצמה היא canvas שצויר על ידי המנוע, ניתנת לאינטראקציה ועוקבת אחר החלפת ערכת נושא.

## שימוש

```ts
import { createHostedCanvasRoot } from "@dopejs/pingo";
import { Button, createPingoUiStyleSheet } from "@dopejs/pingo-ui";

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [createPingoUiStyleSheet()],
});
root.render(createElement(Button, { children: "שמירה" }));
```

גיליונות סגנון מותאמים אישית חייבים להירשם **אחרי** גיליון הסגנון של pingo-ui; כללים בעלי עדיפות זהה נדרסים לפי סדר הרישום. להתאמת ערכת נושא ומיתוג ראו [מדריך העיצוב](/guide/styling) ו-[SCSS ו-Less](/guide/scss-less).

בחרו רכיב מתוכן העניינים משמאל כדי להתחיל.
