---
title: "רכיבי עריכה: Input ו-TextArea"
description: פרימיטיבים מובנים-במנוע של טקסט ניתן לעריכה — חוזה טרנזקציות מבוקר עם revision, גשר קלט EditContext, סיסמה וקריאה-בלבד.
---

# רכיבי עריכה: Input ו-TextArea

‏`Input` ו-`TextArea` (מיוצא ב-`@dopejs/pingo` בשם `UnstyledTextArea`, ראה להלן) הם פרימיטיבים
מובנים-במנוע של טקסט ניתן לעריכה: סמן, בחירה, הרכבת IME, לוח גזירים וביטול/ביצוע חוזר — כולם
ממומשים בליבה, **בלי להציב שום פקד קלט HTML מעל ה-canvas**. התצוגה המקדימה למטה ניתנת להקלדה
באמת — לחץ כדי למקד, נסה שיטת קלט, בחירה בגרירה ו-Ctrl+Z.

:::preview elements-input
:::

## שימוש

כתיבה מבוקרת: `value` + `revision` עולה מונוטונית, ואישור הטרנזקציות מהליבה ב-`onTransaction`:

```tsx
import { Input, type EditTransaction } from "@dopejs/pingo";

let value = "הערת הזמנה";
let revision = 1n;

function applyDelta(current: string, transaction: EditTransaction): string {
  const delta = transaction.delta;
  return delta === undefined
    ? current
    : current.slice(0, delta.range.start) + delta.text + current.slice(delta.range.end);
}

<Input
  value={value}
  revision={revision}
  semanticLabel="הערת הזמנה"
  onTransaction={(transaction) => {
    value = applyDelta(value, transaction);
    revision = transaction.revision;
  }}
/>;
```

למצב מקומי בלבד אפשר להשמיט את `value` / `revision` ולהשתמש ב-`TextEditingController`
(ב-hooks — `useTextEditingController`); `controller` ו-`value`/`revision` שוללים זה את זה.

## חוזה טרנזקציות ה-revision

בעלות המצב מוגדרת היטב: **המעטפת מחזיקה בנתוני העסק, והליבה מחזיקה במצב הרגעי של סשן העריכה
הפעיל.**

1. הקלט מגיע לליבה ומאמת שה-`base_revision` תואם את הסשן הנוכחי;
2. לאחר האימות הוא **מיושם ומצויר מחדש מיד** — כל הקשה לא דורשת מעבר מלא של צינור הרינדור;
3. הליבה שולחת חזרה `EditTransaction` מנוהל-גרסאות;
4. המעטפת מאשרת (מעדכנת את `value` / `revision` שלה), או — כשאימות עסקי נכשל — שולחת ערך
   מתקן עם `revision` חדש. revision שפג לעולם אינו דורס קלט חדש יותר של הליבה; אישור של אותו
   revision אינו מנקה את מחסנית הביטולים.

שדות ה-`EditTransaction`:

| שדה            | טיפוס                                                       | תיאור                                                                                           |
| -------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `nodeId`       | `number`                                                    | צומת העריכה שהפיק את הטרנזקציה                                                                  |
| `baseRevision` | `bigint`                                                    | ה-revision שעליו נשענת הטרנזקציה                                                                |
| `revision`     | `bigint`                                                    | ה-revision החדש לאחר הטרנזקציה                                                                  |
| `delta`        | `{ range: { start, end }, text }`                           | הבדל טקסט; היסטים ב-UTF-16, מיושרים ל-EditContext/InputEvent. טרנזקציית בחירה בלבד — ללא שדה זה |
| `selection`    | `{ anchor, focus, anchorAffinity, focusAffinity }`          | הבחירה לאחר הטרנזקציה                                                                           |
| `composition`  | `{ start, end }`                                            | טווח הרכבת IME פעילה                                                                            |
| `kind`         | `"edit" \| "composition" \| "external" \| "undo" \| "redo"` | סוג הטרנזקציה                                                                                   |

## גשר הקלט: EditContext ופרוקסי נסיגה

התהליכון הראשי מתחבר לשירותי קלט הטקסט של מערכת ההפעלה לפי סדר עדיפות:

1. **EditContext** — נקשר ל-canvas, מקבל טקסט/בחירה/composition, ומדווח למקלד הקלט על control,
   selection וגבולות תווים, כך שחלון המועמדים יכול להידבק לצד הסמן.
2. **פרוקסי קלט מנוהל-מנוע** — כש-EditContext אינו זמין, המארח מחזיק `textarea` גלובלי מוסתר
   **אחד** שמטפל ב-`beforeinput`, composition, מקלדת רכה ולוח גזירים.

זהו יישום נסיגת פלטפורמה, לא מודל הרכיבים של EmbedDOM: ב-Scene לא קיים DOM התואם אחד-לאחד לכל
צומת עריכה. שני הנתיבים עוברים אותה מערכת בדיקות חוזה של התנהגות עריכה.

## מרובה-שורות: פרימיטיב TextArea

פרימיטיב ה-`TextArea` חולק עם `Input` את אותה מערכת-משנה `editableText`; ההבדל היחיד הוא שקבועת
ה-`multiline` נעוצה על ידי הרכיב. Enter מכניס מעבר שורה ולא מפעיל `onSubmit`; מקשי החצים מעלה/מטה
שומרים על העמודה הרצויה (desired-x) במעבר בין שורות.

:::preview elements-textarea
:::

## Props ‏(Input / UnstyledTextArea)

שניהם חולקים `EditableTextProps` (`multiline` אינו חשוף — נעוץ על ידי הרכיב):

| Prop            | טיפוס                          | ברירת מחדל | תיאור                                                                          |
| --------------- | ------------------------------ | ---------- | ------------------------------------------------------------------------------ |
| `value`         | `string`                       | —          | טקסט מבוקר                                                                     |
| `revision`      | `number \| bigint`             | —          | ה-revision הסמכותי של הערך המבוקר; ערך שפג לא ידרוס קלט חדש יותר של הליבה      |
| `controller`    | `TextEditingController`        | —          | controller מקומי יציב; שולל `value`/`revision`                                 |
| `readOnly`      | `boolean`                      | `false`    | קריאה בלבד                                                                     |
| `password`      | `boolean`                      | `false`    | מצב סיסמה (ראה להלן)                                                           |
| `maxGraphemes`  | `number`                       | —          | תקרת grapheme-ים                                                               |
| `inputMode`     | `EditableInputMode`            | `"text"`   | רמז למקלדת רכה: `decimal` `email` `none` `numeric` `search` `tel` `text` `url` |
| `onTransaction` | `(t: EditTransaction) => void` | —          | callback לטרנזקציות עריכה של הליבה                                             |
| `onSubmit`      | `() => void`                   | —          | Enter בשורה יחידה שולח; במרובה-שורות Enter שמור למעבר שורה                     |

מראה הטקסט יורש את `TextProps`: `color`, `fontSize`, `fontWeight`, `lineHeight`, `fontFamily`,
`font`; מידות, `padding`, `backgroundColor`, מסגרות (ערוץ `style`) וכדומה מגיעים מ-[CommonProps](/api).

## נגישות ופרטיות

- צמתי עריכה נושאים סמנטיקת `textbox` מובנית; ספק שם עם `semanticLabel` (חשוב במיוחד כשאין label
  נראה).
- תוכן סיסמה מצויר בליבה בגליפים ממוסכים בלבד: הטקסט הגלוי אינו נכנס ל-DisplayList, להקלטה
  ולהרצה חוזרת, ל-devtools או לערך הנגישות, ויעד סיסמה אינו כותב ללוח הגזירים.

עיצוב מעמיק יותר (מודל מיקום טקסט, גבולות bidi, מטריצת בדיקות החוזה) ב[טקסט ועריכה](/he/guide/editing).
