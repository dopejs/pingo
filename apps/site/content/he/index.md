---
layout: home

hero:
  name: Pingo
  text: מנוע רינדור canvas
  tagline: ליבת Rust/WASM + מעטפת TypeScript + קצה אחורי ניתן להחלפה. מתוכנן לאינטראקטיביות בביצועים גבוהים, גלילה וירטואלית מקורית ועריכת טקסט בתוך canvas, עם רכיבי בסיס, סגנונות CSS וספריית רכיבי UI מותאמת ל-shadcn.
  image:
    light: /pingo-mark.svg
    dark: /pingo-mark-dark.svg
    alt: Pingo
  actions:
    - theme: brand
      text: התחלה מהירה
      link: /guide/getting-started
    - theme: alt
      text: Playground
      link: /playground
    - theme: alt
      text: GitHub
      link: https://github.com/dopejs/pingo

features:
  - title: שני שעונים, בלי נפילת פריימים גם כשהשרשור הראשי נתקע
    details: שעון ה-UI ושעון הרינדור עצמאיים זה מזה. גלילה, אנימציה, פריסה וקומפוזיציה מתקדמים בלולאה סגורה בתוך Worker; גם כשהשרשור הראשי חסום ל-200ms התצוגה נשארת רציפה.
  - title: גלילה וירטואלית מקורית
    details: עץ סכומי תחיליות, חימום מראש לפי חיזוי כיוון והשלמת מצייני מיקום — הכול בתוך ה-Core. שידור חוזר של 20,000 פריימים עם fixture קבוע של מיליון שורות נותן P95/P99 ברמת תת-מיקרו-שנייה, ובמצב גלילה יציב אין בכלל קריאה חזרה ל-Shell.
  - title: עריכה מקורית ב-canvas
    details: caret, בחירה, גרירה לבחירה, בחירת מילה בלחיצה כפולה, IME composition, מיקום חלון מועמדים, לוח גזירה וביטול/שחזור — הכול ממומש על ידי המנוע. האפליקציה לא צריכה ליצור רכיבי HTML בשביל יכולות קלט.
  - title: נגישות היא חלק מהארכיטקטורה
    details: ה-Core מייצא עץ סמנטי, והמארח משקף אותו כעץ DOM צללי לצד ה-canvas. קוראי מסך עובדים, ובדיקות E2E יכולות לבחור אלמנטים לפי role/label במקום להשוות פיקסלים.
  - title: דטרמיניזם ובדיקות דיפרנציאליות
    details: זרם בינארי עם גרסאות, שעון ומקור אקראי ניתנים להזרקה, הקלטה ושידור חוזר, ואורקל דיפרנציאלי בין אינקרמנטלי למלא, אופטימלי לנאיבי, ו-wasm ל-native.
  - title: ירידת ביצועים אוטומטית, תמיד יש גיבוי
    details: SharedArrayBuffer ← postMessage ← Canvas2D בשרשור הראשי נבחרים אוטומטית לפי יכולות, עם שקילות פונקציונלית. שכבת ההגירה תומכת בהשקה הדרגתית לפי עמודים ובחזרה לאחור בלחיצה אחת.
  - title: רכיבי בסיס מוכנים לשימוש מיידי
    details: אלמנטים ברמת המנוע כמו View/Text/Image, Input/TextArea, SVG/Path ממופים ישירות לצמתי Scene. עיצוב טקסט, גיאומטריית caret ויכולות עריכה מגיעים מה-Core, בלי להרכיב פקדי DOM.
  - title: תמיכה ב-CSS וב-SCSS/Less
    details: "תת-קבוצת CSS עם גרסאות שמפוענחת בצד ה-Shell: לבוררי מחלקות, מצבי אינטראקציה, ירושה וערכים מחושבים יש גבולות ברורים; SCSS/Less עוברים הידור ואימות בזמן הבנייה, והמעבד המקדים לא נכנס ל-bundle של הדפדפן."
  - title: ספריית רכיבי UI מותאמת ל-shadcn
    details: "ה-API והסמנטיקה של העיצוב ברכיבי @dopejs/pingo-ui מותאמים ל-shadcn/ui — Button, Dialog, Table, Calendar וכולי מרונדרים כולם ל-canvas, עם תמיכה בערכת נושא בהירה/כהה ודריסת גיליונות סגנון."
---

## התחלה ב-30 שניות

```sh
pnpm add @dopejs/pingo
```

```tsx
import { createHostedCanvasRoot, Text, View } from "@dopejs/pingo";

const root = await createHostedCanvasRoot(document.querySelector("canvas")!);

root.render(
  <View
    style={{ width: 480, height: 640, overflowY: "auto" }}
    virtual={{
      itemCount: 1_000_000,
      estimatedItemSize: 32,
      renderItem: (index) => <Text value={`שורה ${index}`} />,
    }}
  />,
);
```

‏TSX דורש להפנות את `jsxImportSource` אל `@dopejs/pingo` בקובץ `tsconfig.json`, ראו [תחילת עבודה](/guide/getting-started).

מיליון שורות אינן מתממשות בצד ה-Shell, ותהליך הגלילה גם אינו קורא חזרה לעץ הרכיבים — חישובי החלונות וההשלמה מתרחשים כולם בתוך ה-Core.

## מה הוא לא עושה

Pingo הוא מנוע רינדור, לא דפדפן. הוא **לא עושה** SSR/HTML לראש עמוד, תאימות CSS כללית (מודל קופסה, שכבות, בוררים),
שכבת התאמה למיני-אפליקציות או לפלטפורמות מקוריות, וגם לא סמנטיקה של טקסט עשיר ברמה עסקית (שיתוף פעולה, נוסחאות, פקודות Markdown).

המנוע **כן מחזיק** ב-caret, בחירה, IME, לוח גזירה, ביטול/שחזור ופרימיטיבים של טקסט ניתן לעריכה — אלה לא נדחפים חזרה לשכבת העסקים
כדי להרכיבם מפקדי DOM.

ביצועים על חומרה אמיתית, שיטות קלט אמיתיות, קוראי מסך ומטריצת צריכת חשמל במדיה שייכים לאיסוף כשירות פלטפורמה ומנוהלים בנפרד;
ניווט ויזואלי דו-כיווני והפעלת הקצה האחורי WebGPU כברירת מחדל הם עדיין [פריטים מתועדים שנדחו](https://github.com/dopejs/pingo/blob/main/docs/plan.md).
