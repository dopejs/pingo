---
title: "גרפיקה וקטורית: Path ו-SVG"
description: קווי מתאר וקטוריים של Path ותת-קבוצת מסמכי SVG — תחביר d, התאמת viewBox, קו מתאר ואייקוני currentColor.
---

# גרפיקה וקטורית: Path ו-SVG

הגרפיקה הווקטורית של pingo היא יכולת ציור מהדרגה הראשונה של המנוע: נתיבים קיימים כמשאבים
בלתי-ניתנים-לשינוי בצד הליבה, וגם אייקון שמצויר 50 פעמים מחזיק גיאומטריה אחת בלבד. שתי נקודות
כניסה: `Path` מקבל ישירות נתוני SVG path; `Svg` מקבל מסמך שלם שפוענח על ידי `createSvg` /
`loadSvg`. התצוגה המקדימה למטה מרונדרת בזמן אמת על ידי המנוע, וצבע האייקונים עוקב אחר ערכת
הנושא של האתר.

:::preview elements-svg-icon
:::

## Path: קו מתאר בודד

```tsx
import { createElement, Path, View } from "@dopejs/pingo";

createElement(View, {
  style: { color: "#3157dfff" }, // קו המתאר נצבע ב-color של הצומת, ועובר בירושה כמו טקסט
  children: createElement(Path, {
    d: "M20 6 9 17l-5-5",
    viewBox: [0, 0, 24, 24],
    width: 24,
    height: 24,
    strokeWidth: 2,
  }),
});
```

- `d` תומך בתחביר SVG path המלא (`M L H V C S Q T A Z` וצורות יחסיות באותיות קטנות); קשתות `A`
  מומרות בעת הניתוח לעקומות בזייה מעוקבות, כך שהליבה אינה זקוקה לסוג עקומה נפרד.
- `viewBox` הוא קופסת מרחב-היוצר, ובעת הציור היא מותאמת לתוך קופסת הצומת — אותו משאב עובד
  ישירות בצמתים של 16px ושל 48px, בלי המרות מצד הקורא.
- בלי `strokeWidth` קו המתאר ממולא; ערך שונה מאפס מצייר קו מתאר ברוחב הנתון (round cap/join).
- `geometryTransform` נאפה לתוך נקודות הגיאומטריה לפני הקידוד (במסמך SVG טרנספורמציית group
  מזיזה את הצורה ולא את הקופסה שבה היא יושבת), והוא דבר נפרד מה-`transform` החזותי של הצומת.

:::preview elements-path
:::

## Svg: תת-קבוצת מסמכים

‏`createSvg(markup)` משתמש במנתח כתוב-יד ולא ב-`DOMParser` — המנוע חייב להפיק גיאומטריה זהה
לחלוטין בדפדפן, ב-Worker ובבדיקות דיפרנציאליות headless, ו-`DOMParser` לא קיים ב-Worker.
תת-הקבוצה היא בדיוק מה שאוספי אייקונים מכילים בפועל:

- אלמנטי צורה: `path` `circle` `ellipse` `rect` `line` `polyline` `polygon`;
- אלמנטי מבנה: `svg` `g` `title` `desc` `defs` `metadata`;
- תכונות: `fill` `stroke` `stroke-width` `fill-rule` `transform`
  (`translate`/`scale`/`rotate`/`matrix`; skew אינו בתת-הקבוצה).

אלמנטים מחוץ לתת-הקבוצה **נדחים לפי שם** וזורקים `PingoSvgError` — הקורא יודע במדויק מה אבד,
במקום להביט בקופסה ריקה. צבעי CSS בשם גם הם נדחים: חצי טבלת צבעים תגרום לחלק מהמסמכים לרנדר
תקין ולאחרים להשחיר בשקט. צבעי hex, ‏`none`, ‏`transparent` ו-`currentColor` נמצאים בתוך
תת-הקבוצה; `currentColor` נפתר ל«ירושת צבע הצומת», ולכן אייקונים יכולים להחליף צבע עם ערכת
הנושא בדיוק כמו טקסט (כפי שעושה התצוגה המקדימה).

רכיב `Svg` פורש את המסמך ל**צומת path אחד לכל צורה**, והצורות מוערמות במיקום מוחלט; צורה שגם
ממולאת וגם בעלת קו מתאר הופכת לשני צמתים — מילוי וקו מתאר הם שני paint-ים, לא שני חצאים של צומת
אחד.

```ts
import { createSvg, loadSvg, Svg } from "@dopejs/pingo";

const icon = createSvg(`<svg viewBox="0 0 24 24" stroke="currentColor" …>…</svg>`);
createElement(Svg, { source: icon, width: 24, height: 24, style: { color: "#3157df" } });

const remote = await loadSvg("/assets/logo.svg");
```

לגישה פרוגרמטית, `PingoSvg.shapes` נותן לכל צורה את `d`, ה-`transform`, מילוי/קו-מתאר
ו-`fillRule`; `shapeData(name, attributes)` ממיר אלמנט צורה בודד לנתוני path שקולים.

## Props ‏(Path)

| Prop | טיפוס | ברירת מחדל | תיאור |
| --- | --- | --- | --- |
| `d` | `string` | — | נתוני SVG path (חובה; תחביר נתיב בלבד, לא מסמך) |
| `viewBox` | `readonly [number, number, number, number]` | — | קופסת מרחב-היוצר, מותאמת לתוך קופסת הצומת |
| `strokeWidth` | `number` | — | שונה מאפס: קו מתאר במקום מילוי |
| `fillRule` | `"nonzero" \| "evenodd"` | `"nonzero"` | כלל מילוי |
| `geometryTransform` | `readonly [number, number, number, number, number, number]` | מטריצת יחידה | טרנספורמציה הנאפית לתוך הגיאומטריה לפני הקידוד |

## Props ‏(Svg)

| Prop | טיפוס | ברירת מחדל | תיאור |
| --- | --- | --- | --- |
| `source` | `PingoSvg` | — | מסמך שפוענח על ידי `createSvg` / `loadSvg` (חובה) |

שניהם יורשים [CommonProps](/api) (`width`/`height`, אירועים, props סמנטיים ועוד).

## נגישות

לגרפיקה וקטורית אין סמנטיקה משל עצמה. אייקונים דקורטיביים אינם זקוקים לתיוג; לכפתור אייקון
שניתן ללחיצה תן `semanticRole: "button"` ו-`semanticLabel`, ראה [נגישות](/he/guide/accessibility).
