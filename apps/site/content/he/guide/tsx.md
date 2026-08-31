---
title: TSX
description: כתיבת רכיבי pingo ב-TSX, ודו-קיום עם React באותו מאגר.
---

# לכתוב pingo ב-TSX

## הגדרה

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@dopejs/pingo"
  }
}
```

‏`jsx` בוחר את זמן הריצה האוטומטי של TypeScript, ו-`jsxImportSource` מכוון אותו אל
`jsx-runtime` של pingo במקום זה של React. השם `react-jsx` הוא שם מצב ההמרה בלבד ואין לו קשר
ל-React.

## מה יכול לשמש כתגית

```tsx
import { createContext, memo, Text, useState, View, type PingoNode } from "@dopejs/pingo";
import { Button } from "@dopejs/pingo-ui";

const Theme = createContext("light");

function Row({ label }: { readonly label: string }): PingoNode {
  const [count, setCount] = useState(0);
  return (
    <View width={240} padding={8}>
      <text value={`${label} ${count}`} />
      <Button onPress={() => setCount(count + 1)}>הוסף</Button>
    </View>
  );
}

root.render(
  <Theme.Provider value="dark">
    <Row label="קליקים" />
  </Theme.Provider>,
);
```

כל חמש הצורות עובדות:

| צורה                   | דוגמה                                                 |
| ---------------------- | ----------------------------------------------------- |
| אלמנטים מובנים         | `<container>`, `<text>`, `<scroll>`, `<editableText>` |
| רכיבי יסוד             | `<View>`, `<Text>`, `<Image>`, `<Input>`              |
| רכיבי פונקציה שכתבת    | `<Row label="…" />`                                   |
| רכיבים עטופים ב-`memo` | כל אלה שב-`@dopejs/pingo-ui`                          |
| ספקי context           | `<Theme.Provider value={…}>`                          |

::: warning רכיב שמשתמש ב-hooks מרכיבים, לא קוראים לו
‏`Row({ label })` עובר בדיקת טיפוסים אך נכשל עם
`hooks may only run in a function component`: ל-hooks נדרש תחום הרכיב שיוצר המְאַחֵד. כתבו
`<Row label="…" />`.
:::

מותר לציין `PingoNode` כטיפוס ההחזרה. הוא כולל `undefined`, אך ההתאמה לתגיות JSX מוצהרת
על ידי `JSX.ElementType` של המנוע, ואין צורך לשנות את החתימה.

## דו-קיום עם React

קבצי TSX של React ושל pingo באותו מאגר הם מצב רגיל: המעטפת ב-React, והאזורים תובעניים
בביצועים מצוירים על ידי pingo.

### המנגנון הוא ההצהרה בראש הקובץ

‏`jsxImportSource` פועל **ברמת הקובץ**. בשורה הראשונה של קובץ pingo כותבים:

```tsx
/** @jsxImportSource @dopejs/pingo */
```

‏`tsconfig.json` של הפרויקט נשאר בהגדרת React, ורק קבצים שיש בהם השורה הזו משתמשים בזמן
הריצה של pingo. גם `tsc`, גם esbuild/Vite וגם babel מכבדים אותה.

**שני הרעיונות האחרים אינם עומדים** — נמדד:

| גישה                                              | תוצאה                                                                                          |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| ‏`tsconfig.json` בתיקייה עם `jsxImportSource` אחר | ‏`tsc` מתעלם ממנו לגמרי ו-Vite כן מיישם — הבנייה ובדיקת הטיפוסים חלוקות ביניהן                 |
| החרגה לפי שם קובץ באמצעות `exclude`               | ‏`exclude` משפיע רק על בחירת קובצי השורש; ברגע שקובץ React מייבא אותו הוא חוזר ומתקמפל כ-React |

כדי ששם הקובץ ינהל באמת את שרשרת הכלים דרושים composite project references: פרויקט pingo פולט
`.d.ts` ופרויקט React קורא הצהרות ולא מקור.

שכחה של השורה הזו אינה נשברת בשקט אלא נכשלת בזמן הקומפילציה:

```
error TS2322: Type 'Element' is not assignable to type 'PingoNode'.
error TS2786: 'View' cannot be used as a JSX component.
```

### סיומת בשם הקובץ היא מוסכמה

כששני סוגי הקבצים יושבים באותה תיקייה, כדאי לתת לקובצי pingo סיומת כמו `scene.pingo.tsx`:
מבחינים ביניהם מיד ברשימת הקבצים, וזה מועיל להגדרות לפי שם כמו `overrides` של babel. זו
מוסכמה לבני אדם ולהגדרות, והיא **אינה מחליפה את ההצהרה בראש הקובץ**. אם כל התיקייה היא pingo,
התיקייה עצמה היא הסימן והסיומת רק רעש.

### הגבול הוא גבול הקובץ

לקובץ יש סוג JSX אחד בלבד, ולכן **אי אפשר לכתוב תגיות pingo בתוך רכיב React**. קובץ pingo
מייצא את הסצנה וקובץ React מייבא אותה:

```tsx
/** @jsxImportSource @dopejs/pingo */
// scene.pingo.tsx
import { Text, View, type PingoNode } from "@dopejs/pingo";

export function scene(label: string): PingoNode {
  return (
    <View width={240} height={80} padding={12}>
      <Text value={label} />
    </View>
  );
}
```

### הרכבה באמצעות `PingoContainer`

```tsx
// App.tsx —— התגיות בקובץ הזה שייכות ל-React
import { PingoContainer } from "@dopejs/pingo/react";

import { scene } from "./scene.pingo";

export function App() {
  return <PingoContainer scene={scene("Hello")} style={{ height: 320, width: 480 }} />;
}
```

הסצנה מגיעה דרך המאפיין `scene` ולא כ-children, כי התגיות בקובץ הזה שייכות ל-React ואי אפשר
לכתוב כאן children של pingo.

‏`PingoContainer` יוצר את ה-canvas בעצמו במקום לתת ל-React לרנדר אותו ולקחת ref. זה **הכרחי**:
השורש מעביר את ה-canvas ל-OffscreenCanvas, ההעברה סופית, ו-React StrictMode מריץ אפקטים
פעמיים בפיתוח — ולכן canvas שבבעלות React היה עובר לשורש שני ונכשל:

```
this canvas already transferred control to an OffscreenCanvas and cannot host
a second root; create a new canvas element per root
```

ה-canvas שהרכיב יוצר נעלם יחד עם ההרכבה שנזרקה, ולכן המצב הזה אינו מתרחש. גם הגודל אינו דורש
טיפול: השורש עוקב אחרי התיבה של ה-canvas שלו, ומספיק לקבוע לגורם המכיל גודל ב-CSS.

כשצריך את השורש עצמו (שליטה בגלילה, קריאות אבחון) משתמשים ב-`onRoot`; לכשל באתחול —
`onStartupError`. שגיאות זמן ריצה ממשיכות להגיע אל `options.onHostError`.

### שני העצים אינם חולקים מצב

ה-state וה-context של React אינם מגיעים לעץ הרכיבים של pingo, וגם לא להפך. אלה שני מְאַחדים
נפרדים. תקשורת מעבר לגבול היא זרימת נתונים רגילה: React מחשב את הערך ומעביר אותו כ-`scene`,
ו-pingo מחזיר תוצאות דרך קריאות אירוע.

## המאגר הזה הוא הדוגמה

‏`apps/site` הוא יישום React, ובו בזמן יש בו 73 תצוגות מקדימות של רכיבים שנכתבו ב-pingo TSX.
התיקייה שבה השניים יושבים יחד היא
[`apps/site/src/interop`](https://github.com/dopejs/pingo/tree/main/apps/site/src/interop),
והבדיקה שלה רצה תחת `StrictMode`.
