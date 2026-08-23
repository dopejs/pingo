---
title: "רכיבי בסיס: View, ‏Text ו-Image"
description: מכולת View ופריסת flex, רינדור טקסט של Text, מפת סיביות Image וגופן מפורש PingoFont.
---

# רכיבי בסיס: View, ‏Text ו-Image

רכיבי המארח של pingo תואמים ישירות לצמתי Scene, בלי תקורת מפל CSS או התאמת בוררים (על יכולות
הסגנון ראה [סגנונות](/he/guide/styling)). עמוד זה מכסה את שלושת הרכיבים הבסיסיים ביותר: הקופסה
הכללית `View`, הטקסט `Text` ומפת הסיביות `Image`. התצוגה המקדימה למטה מרונדרת בזמן אמת על ידי
מנוע pingo ועוקבת אחר מעבר ערכת הנושא של האתר בין בהיר לכהה.

:::preview elements-layout
:::

## View ופריסה

‏`View` היא קופסת קיבוץ כללית (המתאימה לרכיב המארח `container`), ואינה מכניסה סוג חדש של צומת
Scene:

- `width` / `height` / `minWidth` / `maxWidth` / `padding` / `backgroundColor` / `opacity` /
  `transform` הם props ישירים; `padding` מקבל מספר או רביעייה `[עליון, ימין, תחתון, שמאל]`.
- `flexDirection`, `justifyContent`, `alignItems`, מסגרות ופינות מעוגלות עוברים דרך ערוץ ה-inline
  של `style` (תת-קבוצת CSS מוטיפסת, ראה [סגנונות](/he/guide/styling)).
- ריווח בין ילדים מבוטא במפורש במכולות בגודל קבוע — כך ממומשים עוזרי ה-`row` / `column`
  בתצוגה המקדימה.

## שימוש

```tsx
import { createElement, Text, View } from "@dopejs/pingo";

root.render(
  createElement(View, {
    width: 420,
    padding: 16,
    backgroundColor: "#ffffffff",
    style: { flexDirection: "column", borderRadius: 10 },
    children: [
      createElement(Text, { value: "כותרת", fontSize: 24, lineHeight: 32, fontWeight: 700 }),
      createElement(View, { height: 8 }),
      createElement(Text, { value: "גוף", fontSize: 14, lineHeight: 22 }),
    ],
  }),
);
```

## Text: רצף טקסט

עיצוב (shaping), שבירת שורות ומדידת הטקסט מתבצעים כולם בליבה — ערבוב שפות, אמוג'י ותווים משולבים
אינם דורשים מעורבות של המעטפת. התוכן ניתן דרך `value` או דרך `children` מחרוזתיים.

:::preview elements-text
:::

### Props ‏(Text)

| Prop | טיפוס | ברירת מחדל | תיאור |
| --- | --- | --- | --- |
| `value` | `string` | — | תוכן הטקסט (או `children`, אחד משניהם) |
| `children` | `string \| number` | — | תוכן הטקסט |
| `color` | `Color` | `#000000ff` | צבע טקסט, ניתן לירושה |
| `fontSize` | `number` | — | גודל גופן (פיקסלים לוגיים) |
| `lineHeight` | `number` | — | גובה שורה (פיקסלים לוגיים) |
| `fontWeight` | `number` | — | משקל גופן |
| `fontFamily` | `string` | — | משפחת גופנים של CSS |
| `font` | `PingoFont` | — | גופן מפורש בלתי-ניתן-לשינוי; קלט לא נתמך נופל לנסיגה שלמה |

‏`Text` יורש גם את כל ה-[CommonProps](/api) (מידות, padding, אירועים, `semanticRole` /
`semanticLabel` ועוד).

## Image: מפת סיביות

ה-`source` של `Image` הוא `PingoImage` — **מפת סיביות RGBA8 בלתי-ניתנת-לשינוי** המוחזקת בצד המעטפת
ומוטמעת כמשאב Scene באופן סינכרוני בגבול ה-commit. יוצרים עם `createImage`, שמעתיק ומאמת את
הפיקסלים:

```ts
import { createImage, Image } from "@dopejs/pingo";

const icon = createImage(pixels, 96, 96, { label: "אייקון האפליקציה" });
createElement(Image, { source: icon, width: 48, height: 48 });
```

בלי `width` / `height` הצומת לוקח את ממדי הפיקסלים של התמונה; אם הועברו, התמונה מותאמת לקופסת
הצומת. `label` הוא שם הנגישות; השאר ריק לתמונה דקורטיבית.

:::preview elements-image
:::

הבחירה בפיקסלים ולא בבתים מקודדים היא מכוונת: עסקת המשאבים נכנסת לתוקף סינכרונית בגבול ה-commit,
ואילו כל פורמט מקודד דורש פענוח אסינכרוני. תמונות ממוזערות ברשימות מתאימות לנתיב זה; תמונות
גדולות צריכות ללכת בנתיב המקודד עם staging אסינכרוני.

## גופנים: PingoFont ו-loadFont

ה-prop ‏`font` של `Text` ושל רכיבי העריכה מקבל גופן SFNT מפורש בלתי-ניתן-לשינוי
(TTF/OTF/TTC) שהליבה מעצבת באופן דטרמיניסטי. `createFont` מקבל בתי SFNT שכבר פוענחו; `loadFont`
מטפל גם בטעינת רשת ובפענוח WOFF/WOFF2:

```ts
import { loadFont } from "@dopejs/pingo";

const inter = await loadFont("/fonts/Inter-Regular.woff2", {
  fallbackFamily: "sans-serif",
});
createElement(Text, { value: "Hello", font: inter, fontSize: 16 });
```

‏`PingoFontOptions`: `faceIndex` (אינדקס הפנים באוסף TTC, ברירת מחדל `0`) ו-`fallbackFamily`
(משפחת ה-CSS שמשמשת כשכל נתיב הגופן המפורש נופל לנסיגה, ברירת מחדל `"sans-serif"`). כשלון טעינה
זורק `PingoFontLoadError` עם `code` יציב (כגון `fetch-failed`, `decode-failed`,
`unsupported-format`).

## נגישות

‏`semanticRole` ו-`semanticLabel` הם props המשותפים לכל הרכיבים: כותרות, כפתורים ואזורים צריכים
לשאת סמנטיקה על הרכיב, ושם ה-`Image` מגיע מה-`label` של `createImage`. תמונת המצב הסמנטית
משוקפת לעץ DOM צללי לצד ה-canvas, ראה [נגישות](/he/guide/accessibility).
