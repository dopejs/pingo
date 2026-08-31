---
title: Icon Button
description: כפתור הנושא רק סמל, חייב לספק שם נגיש, מרונדר על גבי קנבס pingo.
---

# Icon Button

כפתורי סמלים משמשים לפעולות קומפקטיות ללא תווית טקסט. התצוגה המקדימה שלהלן מרונדרת בזמן אמת על ידי מנוע pingo — ניתן ללחוץ, למקד, ולעקוב אחר מעבר הנושא של האתר בין מצב בהיר לכהה.

:::preview icon-button-basic
:::

## שימוש

```tsx
import { IconButton } from "@dopejs/pingo-ui";

root.render(
  <IconButton
    icon={<text value="★" />}
    semanticLabel="מועדפים"
    variant="outline"
    onPress={() => toggleFavorite()}
  />,
);
```

`icon` הוא משבצת (slot) העוברת הלאה כפי שהיא, ומקבלת כל `PingoNode` — גופן סמלים, SVG או גליף טקסטואלי, כולם אפשריים. מכיוון שאין טקסט גלוי לעין, `semanticLabel` הוא שדה חובה.

## דוגמאות

### וריאנטים

`variant` מתואם לחלוטין עם [Button](/components/button): `default`, `secondary`, `outline`, `ghost`, `destructive`.

### מגבלות ידועות

`size` תומך ב־`default`, `sm`, `lg`, אבל בערכת העיצוב הנוכחית לא נכתבו כללים מורכבים עבור `sm`/`lg` בווריאנט הסמל, גודל הסמל ידרוס את שינויי הגודל, ול־`sm`/`lg` אין עדיין אפקט חזותי.

## Props

| Prop            | סוג                                                                 | ברירת מחדל  | תיאור                                      |
| --------------- | ------------------------------------------------------------------- | ----------- | ------------------------------------------ |
| `icon`          | `PingoNode`                                                         | —           | משבצת סמל, מועברת כפי שהיא (חובה)          |
| `semanticLabel` | `string`                                                            | —           | שם נגיש (חובה)                             |
| `variant`       | `"default" \| "secondary" \| "outline" \| "ghost" \| "destructive"` | `"default"` | וריאנט חזותי                               |
| `size`          | `"default" \| "sm" \| "lg"`                                         | `"default"` | גודל (`sm`/`lg` עדיין לא בתוקף, ראו למעלה) |
| `disabled`      | `boolean`                                                           | `false`     | מצב מושבת                                  |
| `onPress`       | `() => void`                                                        | —           | קריאה חוזרת להפעלה באמצעות מצביע/מקלדת     |
| `className`     | `string`                                                            | —           | מצורף לאחר שם המחלקה של הרכיב              |

## נגישות

לכפתור סמלים אין טקסט גלוי, קוראי מסך יכולים להסתמך רק על `semanticLabel`, ולכן ה־prop הזה הוא חובה. הכפתור כולל סמנטיקה של button ותמיכה בהפעלה באמצעות מקלדת.
