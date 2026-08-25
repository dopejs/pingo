# התחלה מהירה

## התקנה

```sh
pnpm add @dopejs/pingo
```

האפליקציה תלויה רק בחבילה `@dopejs/pingo`. `@dopejs/pingo-host`, `@dopejs/pingo-jsx` וכדומה הן חבילות מימוש פנימיות,
שאינן חלק מהחוזה הציבורי — [סורק ההגירה](/migration) ידחה ייבוא ישיר שלהן.

## הרכבת הקנבס הראשון

```ts
import { createElement, createHostedCanvasRoot } from "@dopejs/pingo";

const canvas = document.querySelector<HTMLCanvasElement>("#app")!;
canvas.width = 800;
canvas.height = 600;

const root = await createHostedCanvasRoot(canvas);

root.render(
  createElement("container", {
    width: 800,
    height: 600,
    backgroundColor: "#ffffffff",
    padding: 24,
    children: createElement("text", {
      value: "Hello pingo",
      fontSize: 24,
      lineHeight: 32,
      color: "#1f2329ff",
    }),
  }),
);
```

`createHostedCanvasRoot` מזהה אוטומטית את יכולות הדפדפן ובוחר נתיב העברה בין SharedArrayBuffer, postMessage ו־Canvas2D בשרשור הראשי,
אין צורך לכתוב הסתעפויות לגיבוי. `root.mode` מחזיר את הנתיב שנבחר בפועל.

## שימוש ב־TSX

הגדירו את `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@dopejs/pingo"
  }
}
```

לאחר מכן ניתן לכתוב:

```tsx
function OrderRow({ index }: { index: number }) {
  return (
    <container width={480} height={32} padding={[6, 12, 6, 12]}>
      <text value={`הזמנה #${index}`} fontSize={13} lineHeight={20} />
    </container>
  );
}

root.render(<OrderRow index={1} />);
```

## רכיבי מארח

למנוע יש רק חמישה רכיבים מובנים, המקבילים ישירות לצמתי Scene, ללא שכבות CSS או בוררים:

| רכיב           | שימוש                                                  |
| -------------- | ------------------------------------------------------ |
| `container`    | קיבוץ כללי, רקע, ריווח פנימי, טרנספורמציות             |
| `text`         | ריצת טקסט (עיצוב, שבירת שורות, גאומטריית caret מ־Core) |
| `scroll`       | מיכל גלילה בבעלות Core                                 |
| `virtualList`  | רשימה וירטואלית עם תכנון חלון ב־Core                   |
| `editableText` | פרימיטיב טקסט בר־עריכה                                 |

`TextField` ו־`TextArea` הם וידג'טים מורכבים מעל `editableText` (מסגרת, מצב שגיאה),
הם אינם מציגים נתיב קלט חדש.

## מצב ותופעות לוואי

```ts
import { signal, useEffect, useSignal, useState } from "@dopejs/pingo";

function Counter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCount((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return createElement("text", { value: `עברו ${count} שניות` });
}
```

הפרימיטיבים הראקטיביים הזמינים: `signal`, `computed`, `effect`, `batch`, `untracked`,
וכן ה־hooks: `useState`, `useSignal`, `useMemo`, `useCallback`, `useRef`, `useEffect`.

::: warning אין קריאת פריסה סינכרונית
קריאת פריסה סינכרונית בסגנון `useLayoutEffect` מה־Worker אינה נתמכת — הפריסה מתרחשת בשעון אחר.
כאשר נדרשת תוצאת פריסה, השתמשו בחוזה אסינכרוני, ואל תנסו לקרוא גאומטריה באופן סינכרוני במהלך רינדור.
:::

## ניטור מצב תקינות

```ts
const root = await createHostedCanvasRoot(canvas, {
  onFrame: (report) => {
    console.log(report.commands, report.displayListBytes, report.core?.sceneNodes);
  },
  onHostError: (error) => report(error),
});
```

`onFrame` מספק בכל פריים את מספר הפקודות, גודל ה־DisplayList בבתים, וספירות האזורים המלוכלכים בצד Core, עומס הפריסה ו־picture hash,
אלו הם הנתונים הראשוניים לאיתור בעיות ביצועים. למידע נוסף ראו [אבחון](/diagnostics).

## סקירת יכולות

מעל חמשת הרכיבים המובנים, pingo מספקת גם שלוש שכבות יכולות למפתחים:

- [רכיבי בסיס](/guide/elements): View/Text/Image, Input/TextArea, SVG/Path ורכיבים נוספים ברמת המנוע.
- [עיצוב](/guide/styling): תת־קבוצת CSS עם גרסאות — בוררי מחלקות, מצבי אינטראקציה, גבולות ברורים של שכבות והורשה;
  כשצריכים משתנים ו־mixin, עוברים דרך [צינור SCSS / Less](/guide/scss-less) בזמן הבנייה.
- [ספריית רכיבי UI](/components): `@dopejs/pingo-ui`, רכיבים מוכנים המותאמים ל־shadcn/ui, כולם מרונדרים לקנבס.

## הצעדים הבאים

- [סקירת ארכיטקטורה](/guide/architecture): כיצד מתחלקים התפקידים בין Shell ל־Core
- [גלילה וירטואלית](/guide/scrolling), [טקסט ועריכה](/guide/editing)
- [Playground](/playground): הדגמה חיה אינטראקטיבית
