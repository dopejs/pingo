---
title: Resizable
description: פריסה דו־לוחית עם ידית גרירה להתאמת יחס, המרונדרת על קנבס pingo.
---

# Resizable

Resizable מחלק את המכולה לשני לוחות, כשהידית המרכזית ניתנת לגרירה להתאמת היחס, ותומכת גם בכיוונון עדין באמצעות מקלדת. התצוגה המקדימה למטה מרונדרת בזמן אמת על ידי מנוע pingo — נסו לגרור את הידית.

:::preview resizable-basic
:::

## שימוש

```tsx
import { createElement } from "@dopejs/pingo";
import { Resizable } from "@dopejs/pingo-ui";

root.render(
  createElement(Resizable, {
    defaultSplit: 0.4,
    first: sidebar,
    second: content,
  }),
);
```

רוחב וגובה הרכיב הם 100% ממכולת האב, ונדרשת מכולת אב בעלת ממדים מוגדרים. הרכיב תומך הן בשימוש לא־מבוקר (`defaultSplit`) והן בשימוש מבוקר (`split` + `onSplitChange`).

## דוגמאות

### כיוון אנכי

העברת `direction: "column"` מחליפה לחלוקה עליונה־תחתונה, והידית הופכת לאופקית.

:::preview resizable-vertical
:::

## Props

| Prop | סוג | ברירת מחדל | תיאור |
| --- | --- | --- | --- |
| `first` | `PingoNode` | — | תוכן הלוח הראשון (חובה) |
| `second` | `PingoNode` | — | תוכן הלוח השני (חובה) |
| `split` | `number` | — | מבוקר: חלקו היחסי של הלוח הראשון, `[0, 1]` |
| `defaultSplit` | `number` | `0.5` | לא־מבוקר: היחס ההתחלתי |
| `onSplitChange` | `(split: number) => void` | — | קריאה חוזרת בעת שינוי היחס |
| `direction` | `"row" \| "column"` | `"row"` | כיוון החלוקה |
| `minSplit` | `number` | `0.1` | יחס מזערי (גבול תחתון להידוק) |
| `maxSplit` | `number` | `0.9` | יחס מרבי (גבול עליון להידוק) |
| `disabled` | `boolean` | `false` | השבתת האינטראקציה עם הידית |
| `className` | `string` | — | מצורף לאחר שם המחלקה של הרכיב |

## נגישות

הידית כוללת סמנטיקת separator וחושפת לטכנולוגיות מסייעות את היחס הנוכחי (באחוזים). לאחר מיקוד בידית ניתן לכוונן עדין בצעדים של 2% באמצעות מקשי החיצים: שמאל/ימין בפריסה אופקית, למעלה/למטה בפריסה אנכית.
