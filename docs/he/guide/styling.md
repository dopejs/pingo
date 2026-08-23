---
title: סגנונות
description: תת-קבוצת ה-CSS של pingo — בוררי מחלקה, מפל וספציפיות, גבולות ירושה, ומוסכמות ערכות הנושא והדריסה של pingo-ui.
---

# סגנונות

הסגנונות ב-pingo הם **תת-קבוצת CSS מנוהלת-גרסאות** (נוכחית 1.6.0): טקסט ה-CSS מנותח ומחושב
בצד המעטפת, והליבה צורכת רק ערכים מוטיפסים מנורמלים — טקסט CSS והתאמת בוררים לעולם אינם נכנסים
לליבה. טבלת התמיכה המלאה בתכונות נמצאת ב[תמיכת תת-קבוצת ה-CSS](/style-support); עמוד זה עוסק
בשימוש ובגבולות.

## יצירה ורישום של גיליון סגנונות

מדרים טקסט CSS בעזרת `createStyleSheet` (קלט לא חוקי זורק `StyleSheetCompileError`), ומרשימים
בעת יצירת ה-root:

```ts
import { createElement, createHostedCanvasRoot, createStyleSheet } from "@dopejs/pingo";

const sheet = createStyleSheet(
  `
  .card {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 16px;
  }
  `,
  { sourceName: "app.css" },
);

const root = await createHostedCanvasRoot(canvas, { styleSheets: [sheet] });

root.render(
  createElement("container", {
    className: "card",
    width: 320,
    children: createElement("text", { value: "שלום", fontSize: 14 }),
  }),
);
```

מי שלא רוצה לטפל בחריגות יכול להשתמש ב-`compileStyleSheet`: הוא אינו זורק על קלט יוצרים אלא
מחזיר diagnostics יציבים. אפשר גם לכתוב גיליון סגנונות כאובייקט בטוח-טיפוסים
(`PingoStyleSheetObject`), שבו המפתחות הם בוררי מחלקה עם או בלי נקודה מובילה, והערכים הם
`PingoStyle`:

```ts
const sheet = createStyleSheet({
  card: { backgroundColor: "#ffffffff", borderRadius: 8, padding: 16 },
  "card:hover": { backgroundColor: "#f5f5f5ff" },
});
```

רכיבים מקבלים מחלקות דרך ה-prop ‏`className` (מספר שמות מחלקה מופרדים ברווחי ASCII), והצהרות
inline נכתבות דרך ה-prop ‏`style` (מסוג `PingoStyle`, שמנותח במעטפת לפני שהוא מגיע לליבה).

## בוררים ומפל

תת-הקבוצה תומכת רק ב**בוררי מחלקה על אותו צומת**, ובארבע פסאודו-מחלקות של מצבי אינטראקציה:

- מחלקה בודדת `.card`; מחלקות מורכבות `.pui-card.pui-dark` (פוגע רק כשלצומת יש את כל המחלקות).
- מצבים `:hover`, `:active`, `:focus`, `:focus-visible`, שניתנים להרכבה עם מחלקות, כמו `.btn:hover`.

לא נתמכים: בוררי אלמנטים, קומבינטורים כמו צאצא/ילד, ‏`@media` / `@supports` / `@keyframes`,
‏`var()` / `calc()`. יחידות האורך היחידות הן `px` ו-`%` (‏‏`em` / `rem` / `vw` / `vh` נדחות);
צבעים נכתבים כ-hex או `rgb()` / `rgba()` / `hsl()` / `hsla()` (שתי התחבירים, הישן והחדש, מתקבלים);
מילות מפתח של צבעים (כמו `red`) אינן נתמכות.

כללי המפל איזומורפיים ל-CSS אך פשוטים יותר:

1. **ספציפיות = מספר מחלקות + מספר מצבים**. `.pui-card.pui-dark` (2) גוברת על `.card` (1).
2. **באותה ספציפיות — לפי סדר המקור**: גיליון שנרשם מאוחר יותר, וכלל המופיע מאוחר יותר באותו
   גיליון, גוברים.
3. **ה-prop ‏`style` המוטבע גובר על כל כללי גיליונות הסגנונות**; props ישירים על הרכיב (כמו
   `width`, `backgroundColor`) בעלי העדיפות הגבוהה ביותר — גוברים על `style`.

שים לב למסקנה מסעיף 2: דריסה תלויה ב**סדר הרישום של גיליונות הסגנונות**, ולא בסדר שמות המחלקות
בתוך מחרוזת ה-`className`.

## ירושה וגבולות סגנון מחושב

רק מעט תכונות עוברות בירושה: `color`, `visibility`, `font-family` / `font-size` /
`font-weight` / `font-style`, `line-height`, `text-align`, `white-space`, `overflow-wrap`,
`pointer-events`, `cursor`. כל שאר התכונות (כולל כל תכונות הפריסה) מתחילות בכל צומת מהערך
ההתחלתי — מה שלא נכתב לא קיים; אין התנהגות כמו «ירושת רוחב מההורה».

כל תכונה מצהירה בסכימה בעלת מקור יחיד מהו תחום ההשבתה שלה (פריסה/ציור/פגיעה/סמנטיקה). שינוי
‏`opacity` אינו מפעיל פריסה מחדש, שינוי `width` כן; זהו אותו מנגנון ההשבתה שמתואר ב[ארכיטקטורה](/he/guide/architecture).

### תכונות מוגבלות בכללי מצבי אינטראקציה

בכללי מצב (כמו `.btn:hover`) מותר לכתוב רק תכונות ממשפחת הציור: `background-color`, `color`,
`opacity`, `border-*-color` לכל צד, `border-radius`, `box-shadow`, `visibility`,
`transform` / `transform-origin`, `pointer-events`, `cursor`. כתיבת תכונת פריסה בכלל מצב
נדחית בזמן קומפילציה — מעבר מצב אינו רשאי להפעיל שינוי פריסה.

## סטיות עיקריות מ-CSS

תת-הקבוצה בכוונה אינה שואפת לתאימות CSS מלאה. סטיות מרכזיות (הרשימה המלאה ב[תמיכת תת-קבוצת
ה-CSS](/style-support)):

- הבלוק המכיל של `position: absolute` הוא **צומת האב** ולא האב הממוקם הקרוב ביותר;
  אין `position: relative`, והיסט חזותי מבוצע עם `transform`.
- אין `flex-wrap`: מכולת flex היא חד-שורתית, וגלישה בציר הראשי נחתכת או נגללת.
- לפריטי flex אין גודל מינימלי אוטומטי — הם יכולים להידחס עד 0 (שקול לכתיבת `min-width: 0`
  בדפדפן); `min-width: auto` / `min-height: auto` נכשלים בקומפילציה ישירות.
- כשגודל הציר הראשי אינו ודאי, אחוזים נפתרים ל-`0` ולא ל-`auto` של CSS.
- `box-shadow` תומך רק בצללים חיצוניים, עד 4 שכבות לצומת; `inset` נדחה.
- `z-index` מסדר מחדש באופן יציב רק בין אחים; אין stacking context.

## מוסכמות ערכות נושא ודריסה ב-pingo-ui

העיצוב של ספריית הרכיבים `@dopejs/pingo-ui` הוא פשוט גיליון סגנונות שעבר קומפילציה במנגנונים
שלעיל:

```ts
import { createHostedCanvasRoot, createStyleSheet } from "@dopejs/pingo";
import { createPingoUiStyleSheet } from "@dopejs/pingo-ui";

const myOverrides = createStyleSheet(`
  .pui-button { border-radius: 4px; }
`);

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [createPingoUiStyleSheet(), myOverrides], // הסדר אסור להתהפך
});
```

- **`createPingoUiStyleSheet()` יוצר גיליון בלתי-ניתן-לשינוי נפרד לכל root**.
- **גיליון המשתמש חייב להירשם אחרי גיליון pingo-ui**: באותה ספציפיות הדריסה היא לפי סדר המקור —
  מה שנכתב מאוחר יותר גובר. ה-prop ‏`className` של הרכיב מתווסף אחרי שמות המחלקה של הרכיב עצמו
  (למשל `pui-input pui-input--disabled mine`), אבל היכולת לדרוס תלויה רק בסדר הרישום לעיל.
- כדי להעלות את עדיפות הדריסה, הגדל ספציפיות עם מחלקה מורכבת (כמו `.pui-button.mine`), במקום
  להסתמך על מיקום הכתיבה.

### ערכות נושא בהירה וכהה

```ts
import { setTheme, useTheme } from "@dopejs/pingo-ui";

setTheme("dark"); // כל הרכיבים המנויים מתרנדרים מחדש אוטומטית
useTheme();       // קריאה ורישום מנוי מתוך render של רכיב
```

ערכת הנושא היא signal ברמת המודול: `useTheme()` בתוך render של רכיב נרשם אוטומטית כמנוי, ו-`setTheme`
מפעיל רינדור מחדש של כל הרכיבים המנויים. המצב הכהה ממומש דרך מחלקה מורכבת — בערכה כהה הרכיבים
נושאים את מחלקת הסימון `pui-dark`, וכללים מורכבים `.pui-x.pui-dark` בגיליון פוגעים (למשל
`.pui-card.pui-dark`).

**התאמת מותג היא פעולת זמן-בנייה**: יוצרים preset חדש עם
`@use "@dopejs/pingo-ui/styles/tokens" with ($primary: ...)` כדי לדרוס tokens, ואז מקמפלים מחדש
את עיצוב הרכיבים דרך תוסף ה-Vite של `@dopejs/pingo-style-preprocess` — שינוי צבע מותג = בנייה
מחדש; אין החלפה בזמן ריצה. צבעי ערכי ה-tokens גם הם יכולים להיכתב רק כ-hex או
`rgb()` / `rgba()` / `hsl()` / `hsla()`. על צינור SCSS/Less ראה
[מדריך SCSS / Less](/he/guide/scss-less).
