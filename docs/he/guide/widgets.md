---
title: "Widgets: אבני בניין של המנוע ללא סגנון"
description: "@dopejs/pingo-widgets מספק TextField, ‏TextArea, ‏Pressable, ‏Button ואבני בניין ברמת המנוע ללא סגנון, ואת הגבול מול @dopejs/pingo-ui."
---

# Widgets: אבני בניין של המנוע ללא סגנון

‏`@dopejs/pingo-widgets` היא שכבת ההרכבה הראשונה מעל המנוע: היא מרכיבה את
[הפרימיטיבים הניתנים לעריכה](/he/guide/elements-editing) עם מיקוד ואירועים מקוריים ליצירת אבני
בניין שמישות, עם קישוט **מינימלי** (מסגרת, מצב שגיאה), בלי להניח שום מערכת עיצוב. העסק אינו תלוי
ישירות בחבילה פנימית זו — כל הייצואים מיוצאים מחדש דרך `@dopejs/pingo`. התצוגה המקדימה למטה
מרונדרת בזמן אמת וניתנת להקלדה ישירה.

:::preview widgets-textfield
:::

## ייצואים ושמות

| ייצוא       | תיאור                                                                             |
| ----------- | --------------------------------------------------------------------------------- |
| `TextField` | קלט חד-שורתי: קישוט מסגרת + מצב שגיאה, שבפנים מרכיב רק את פרימיטיב `editableText` |
| `TextArea`  | וריאנט מרובה-שורות; Enter מעביר שורה, submit נשאר לטופס המארח                     |
| `Pressable` | משטח הפעלה בר-מיקוד: View + מיקוד + click/tap מקוריים                             |
| `Button`    | הרכבת-נוחות של כפתור טקסט: `Pressable` + `Text`                                   |

שים לב לשמות: `TextArea` ב-`@dopejs/pingo` מתייחס ל-widget המקושט הזה; ה**פרימיטיב** מרובה-השורות
מיוצא בשם `UnstyledTextArea` (ובאופן דומה ל-`TextAreaProps` יש כינוי `UnstyledTextAreaProps`).

## TextField ו-TextArea

הקישוט בברירת המחדל הוא מסגרת של 1px וריפוד פנימי של 8px; כשמועברת מחרוזת `error` המסגרת עוברת
לצבע השגיאה, ומתחת לשדה מרונדר הסבר שגיאה בתפקיד `alert`. החוזה המבוקר (`value` + `revision` +
`onTransaction`) זהה לחלוטין לזה של [רכיבי העריכה](/he/guide/elements-editing) — ה-widget אינו
מכניס נתיב קלט חדש.

```tsx
import { createElement, TextField } from "@dopejs/pingo";

createElement(TextField, {
  value,
  revision,
  semanticLabel: "נמען",
  width: 320,
  error: value === "" ? "נמען הוא שדה חובה" : undefined,
  onTransaction: (t) => apply(t),
});
```

### Props ‏(TextField)

| Prop              | טיפוס                          | ברירת מחדל               | תיאור                                                     |
| ----------------- | ------------------------------ | ------------------------ | --------------------------------------------------------- |
| `value`           | `string`                       | `""`                     | טקסט מבוקר                                                |
| `revision`        | `number \| bigint`             | `0n`                     | ה-revision הסמכותי של הערך המבוקר                         |
| `controller`      | `TextEditingController`        | —                        | controller מקומי; שולל `value`/`revision`                 |
| `readOnly`        | `boolean`                      | —                        | קריאה בלבד                                                |
| `password`        | `boolean`                      | —                        | מצב סיסמה (טקסט גלוי לא נכנס ל-DisplayList ולערך הנגישות) |
| `maxGraphemes`    | `number`                       | —                        | תקרת grapheme-ים                                          |
| `inputMode`       | `EditableInputMode`            | —                        | רמז לפריסת מקלדת רכה                                      |
| `width`           | `number`                       | `240`                    | רוחב כולל מסגרת                                           |
| `height`          | `number`                       | `lineHeight × rows + 16` | גובה כולל מסגרת                                           |
| `fontSize`        | `number`                       | `14`                     | גודל גופן                                                 |
| `lineHeight`      | `number`                       | `round(fontSize × 1.5)`  | גובה שורה                                                 |
| `color`           | `Color`                        | `#1f2329ff`              | צבע טקסט                                                  |
| `backgroundColor` | `Color`                        | `#ffffffff`              | צבע רקע של השדה                                           |
| `borderColor`     | `Color`                        | `#c0c4ccff`              | צבע מסגרת                                                 |
| `errorColor`      | `Color`                        | `#d03050ff`              | צבע מסגרת והסבר במצב שגיאה                                |
| `error`           | `string`                       | —                        | לא ריק = מצב שגיאה: מסגרת בצבע שגיאה + הסבר מתחת          |
| `onTransaction`   | `(t: EditTransaction) => void` | —                        | callback לטרנזקציות עריכה של הליבה                        |
| `onSubmit`        | `() => void`                   | —                        | Enter בשורה יחידה שולח                                    |
| `semanticLabel`   | `string`                       | —                        | שם נגישות (התפקיד תמיד `textbox`)                         |

ל-`TextArea` מתווסף `rows` (ברירת מחדל `3`) לחישוב הגובה בברירת המחדל.

## Pressable ו-Button

‏`Pressable` אינו מכניס סוג חדש של צומת Scene: הוא פשוט `View` עם סמנטיקת `button`, שלוקח מיקוד
בלחיצה וממפה click/tap מקוריים ל-`onPress`. הסגנון נקבע כולו על ידי `style` ו-`children`; במצב
`disabled` הוא מנמיך שקיפות ומסיר אירועים.

| Prop               | טיפוס        | ברירת מחדל                   | תיאור                                     |
| ------------------ | ------------ | ---------------------------- | ----------------------------------------- |
| `children`         | `PingoNode`  | —                            | תוכן (ב-Button: `string \| number`, חובה) |
| `disabled`         | `boolean`    | `false`                      | מצב מושבת                                 |
| `onPress`          | `() => void` | —                            | callback הפעלה                            |
| `className`        | `string`     | —                            | שמות מחלקה (לחיבור לגיליון סגנונות)       |
| `style`            | `PingoStyle` | —                            | סגנון inline                              |
| `width` / `height` | `number`     | —                            | מידות                                     |
| `semanticLabel`    | `string`     | ‏`Button` לוקח את `children` | שם נגישות                                 |

‏`Button` מקבל בנוסף `color` ו-`fontSize` (מועברים לטקסט הפנימי).

## הגבול מול @dopejs/pingo-ui

שתי השכבות עונות על שאלות שונות:

- **widgets** — נכונות התנהגותית: טרנזקציות עריכה, מיקוד, תפקידים סמנטיים, קישוט מינימלי. בלי שום
  דעה עיצובית; כל הצבעים והגופנים ניתנים לדריסה.
- **@dopejs/pingo-ui** — מערכת עיצוב: רכיבים מוגמרים ברוח shadcn (וריאנטים, מידות, ערכות נושא,
  גיליונות סגנונות), שמרכיבים פנימית widgets, ‏`@dopejs/pingo-editing` והוקים של זמן ריצה, עם אפס
  שינויים במנוע.

המלצת בחירה: רוצה מערכת עיצוב מוכנה — השתמש ישירות ב[רכיבי pingo-ui](/he/components); יש לך שפת
עיצוב משלך אבל אתה לא רוצה לגעת בפרטי טרנזקציות העריכה — בנה על widgets; התאמה מלאה (למשל HUD
של משחק) — השתמש ישירות בפרימיטיבים של [רכיבי הבסיס](/he/guide/elements).

## נגישות

‏`TextField` / `TextArea` נושאים תפקיד `textbox`, והסבר ה-`error` בתפקיד `alert`;
‏`Pressable` / `Button` בתפקיד `button`, ו-`disabled` נחשף דרך `semanticValue`. השמות מגיעים תמיד
מ-`semanticLabel` — אל תשמיט אותו כשאין label נראה. ראה [נגישות](/he/guide/accessibility).
