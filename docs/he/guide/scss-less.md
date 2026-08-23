---
title: SCSS / Less
description: כתיבת גיליונות סגנונות של pingo ב-SCSS או Less — צינור קומפילציה בזמן בנייה, תוסף Vite, גבולות ביטחון ואבחון שגיאות.
---

# SCSS / Less

תת-קבוצת ה-CSS של pingo (ראה [מדריך סגנונות](/he/guide/styling)) מקבלת בזמן ריצה רק טקסט CSS או
אובייקט. כדי ליהנות ממשתנים, mixin-ים, ‏`@use` / import ושאר חוויית העריכה, משתמשים ב**קומפילציה
בזמן בנייה**: SCSS/Less מקומפלים בצד Node על ידי `@dopejs/pingo-style-preprocess` ל-CSS, עוברים
אימות ב-`compileStyleSheet` הקיים, ומופקים כמודול JavaScript שברירת-המחדל שלו היא `PingoStyleSheet`.

**Sass ו-Less לא נכנסים לחבילת הדפדפן, ל-facade או לליבה** — בזמן ריצה אין שום פרה-מעבד, רק קומפיילר
ה-CSS הקליל שתמיד היה שם. גבולות תת-הקבוצה אינם מתרחבים בעקבות זאת: בוררי צאצאים, `@media`,
‏`var()`, `calc()`, ‏`em/rem/vw/vh` וכדומה עדיין נדחים לפי האבחונים הקיימים — הבנייה נכשלת ולא עוברת
בשקט.

## שתי סמנטיקות ייבוא שיש להבדיל ביניהן

### סגנונות DOM רגילים (Vite מובנה)

```ts
import "./site.scss";
import "./probe.less";
```

נתיב זה הוא יכולת פרה-עיבוד ה-CSS המובנית של Vite, שפולטת **DOM CSS** ש-Vite מזריק או מחלץ. היא
מתאימה לעמודי DOM כמו אתר התיעוד או קליפת Storybook, **אינה מפיקה `PingoStyleSheet`**, ואין להשתמש
בה לסגנונות בתוך ה-canvas.

### גיליונות סגנונות של pingo (`?pingo-style`)

```ts
import { createHostedCanvasRoot } from "@dopejs/pingo";
import buttonSheet from "./button.scss?pingo-style";
import themeSheet from "./theme.less?pingo-style";

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [buttonSheet, themeSheet],
});
```

‏`?pingo-style` הוא גבול טיפוסים מפורש: בזמן הבנייה מתבצע פרה-עיבוד ואז אימות מול תת-קבוצת ה-CSS,
ומודול ה-ESM המופק מייצא כברירת מחדל `PingoStyleSheet`, **בלי להזריק שום CSS ל-DOM**.

## תוסף Vite

התקן את ערכת הכלים שמיועדת ל-Node בלבד (דורש Node >= 22.12, ‏Vite ^8):

```sh
pnpm add -D @dopejs/pingo-style-preprocess
```

רשום ב-`vite.config.ts`:

```ts
import { pingoStylePreprocess } from "@dopejs/pingo-style-preprocess/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    pingoStylePreprocess({
      // אופציונלי: נתיבי load נוספים ל-Sass / נתיבי Less
      scssLoadPaths: ["styles"],
      lessPaths: ["styles"],
      // אופציונלי: תלויות חייבות לשבת בתוך התיקיות האלה (ברירת מחדל: תיקיית ה-entry ונתיבי ה-load)
      allowRoots: ["src", "styles"],
    }),
  ],
});
```

הצהרות הטיפוסים מגיעות מכניסת `./client` של החבילה; מספיק להפנות אליה פעם אחת ב-`tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["@dopejs/pingo-style-preprocess/client"]
  }
}
```

מוסכמות ההתנהגות של התוסף:

- תואם רק את דגל ה-query המדויק `pingo-style` עם סיומת `.scss` / `.less`; שאר הקבצים לא מושפעים.
- מבודד את צינור ה-CSS המובנה של Vite דרך virtual module, בלי פרה-עיבוד כפול או הזרקת DOM CSS.
- ה-entry וכל ה-partials/imports נכנסים לגרף ה-watch — **שינוי token או mixin מפעיל HMR ובנייה
  מחדש בייצור**, בלי ניקוי מטמון ידני.
- כל אבחון ברמת error מכשיל את הבנייה; warning-ים מודפסים עם מיקום מקור. כשקומפילציית HMR נכשלת,
  המודול האחרון שהתקבל נשמר ומוצגת שגיאה ב-dev server.
- המודול המופק מאמת `CSS_SUBSET_VERSION` בעת האתחול: אם גרסת תת-הקבוצה שבה השתמשה הבנייה אינה
  תואמת ל-facade של זמן הריצה, טעינת המודול זורקת מיד — לא ניתן לערבב שתי סמנטיקות.
- סביבות dev, ‏production ו-SSR מייצרות גיליונות סגנונות זהים מבחינה סמנטית.

## API קומפילציה ל-Node

מערכות בנייה שאינן Vite (CLI, ‏codegen) יכולות להשתמש ישירות ב-API של Node:

```ts
import {
  compileLessString,
  compilePingoStyleFile,
  compileScssString,
  createStyleSheetFromLess,
  createStyleSheetFromScss,
} from "@dopejs/pingo-style-preprocess";
```

- `compileScssString(source, options)`: סינכרוני, ולכן **מטפל רק במקור ללא imports**; כשיש
  imports מוחזר אבחון `file-api-required`.
- `compileLessString(source, options)`: אסינכרוני (ה-`render` של Less הוא Promise); ייבוא יחסי
  נפתר רק לאחר שמסופק `sourceName` שהוא נתיב מוחלט.
- `compilePingoStyleFile(filename, options)`: API קבצים אסינכרוני — עליו רץ תוסף ה-Vite; בסיס
  הפתרון היחסי מוגדר היטב וגרף התלויות שלם.
- סדרת `compile*` **אינה זורקת** על שגיאות קלט של יוצרים — מחזירה `styleSheet: null` ו-diagnostics
  ממוינים יציב; `createStyleSheetFromScss` / `createStyleSheetFromLess` הן עטיפות נוחות שזורקות —
  שגיאות יוצרים זורקות תמיד `StylePreprocessError` ומשמרות את כל ה-diagnostics.

ה-`StylePreprocessResult` המוחזר כולל `cssText`, `styleSheet`, `diagnostics` ו-`dependencies`
(רשימת קבצי התלות המלאה, שימושית ל-watch עצמאי).

## Source map ואבחון שגיאות

כל אבחון נושא סימון שלב:

| `stage`       | מקור                                                              |
| ------------- | ----------------------------------------------------------------- |
| `"scss"`      | חריגת קומפילציית Sass (שגיאת תחביר, משתנה לא מוגדר וכדומה)        |
| `"less"`      | rejection של קומפילציית Less                                       |
| `"pingo-css"` | אבחון `compileStyleSheet` על תוצר שחורג מתת-קבוצת ה-CSS            |

שני הקומפיילרים מפעילים source map, ומיקום הייצור של אבחוני pingo CSS **ממופה במיטב היכולת חזרה
לקובץ ה-SCSS/Less המקורי עם שורה ועמודה** (`sourceLocation`); כשאי אפשר למפות, נשמרים מיקום הייצור
(`generatedLocation`) ושם ה-entry — מיקום מקור לא מזויף לעולם. האבחונים ממוינים יציב לפי מיקום ייצור
ו-code, כך שפלט CI ו-snapshot-ים ניתנים לשחזור.

## גבולות ביטחון

הפרה-מעבד מריץ קוד יוצרים בזמן הבנייה, ולכן ברירת המחדל מחמירה:

- **Sass**: לא נפתחים custom importer, ‏custom function או Node package importer; מתקבלות רק
  תלויות `file:`.
- **Less**: `javascriptEnabled: false` קבוע, לא מועברים plugins, וסריקה מוקדמת דוחה `@plugin`;
  ייבוא HTTP(S) או יחסי-פרוטוקול אסור.
- **מגבלות משותפות**: תלויות, לאחר canonicalize, חייבות לשבת בתוך ה-allow roots (תיקיית ה-entry +
  נתיבי load מפורשים); בריחת symlink, תלויות שאינן קבצים ותלויות מרוחקות נדחות. ה-CSS המקומפל עובר
  קודם תקרת 1,048,576 code-unit-ים ורק אז אימות תת-הקבוצה; ל-entry, למספר התלויות ולסך בתי התלויות
  יש תקציבים מפורשים, וחריגה מפיקה שגיאת בנייה יציבה.
- גרסאות הקומפיילרים ננעלות ב-lockfile, וה-CSS, ה-diagnostics ורשימת התלויות של ה-fixture-ים עוברים
  snapshot לשחזוריות; שדרוג Sass/Less מחייב סקירה מפורשת של הבדלי הפלט.

מגבלות אלה חלות רק על שרשרת הכלים של `?pingo-style`; קבצי `.scss` / `.less` רגילים ל-DOM ממשיכים
להתנהג לפי תצורת ה-Vite שלהם.

## פונקציות צבע

פרה-מעבדים נוהגים לפלוט פונקציות צבע, ולכן תת-הקבוצה תומכת ב-`rgb()` / `rgba()` / `hsl()` /
`hsla()` (בשתי הצורות — פסיקים legacy ו-space/slash מודרני), ומנרמלת הכל ל-RGBA בן 8 סיביות.
פלט שמעבר לקבוצה זו — `color(display-p3 ...)`, מאפייני CSS מותאמים אישית, `calc()` — ממשיך
להיכשל בבנייה.
