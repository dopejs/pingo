---
title: Card
description: "מיכל כרטיס מורכב: Header, Title, Description, Content, Footer, מרונדר על קנבס של pingo."
---

# Card

כרטיס מאגד תוכן קשור במיכל אחד עם מסגרת וצל, ומורכב משישה אזורי תוכן ניתנים להרכבה. התצוגה המקדימה שלהלן מרונדרת בזמן אמת על ידי מנוע pingo, ועוקבת אחר ערכת הנושא של האתר במעבר בין מצב בהיר לכהה.

:::preview card-basic
:::

## שימוש

```tsx
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@dopejs/pingo-ui";

root.render(
  <Card>
    <CardHeader>
      <CardTitle>הגדרות חשבון</CardTitle>
      <CardDescription>נהל את העדפות החשבון וההתראות שלך.</CardDescription>
    </CardHeader>
    <CardContent>
      <text value="תוכן גוף הכרטיס." />
    </CardContent>
    <CardFooter>
      <Button onPress={() => {}}>שמור</Button>
    </CardFooter>
  </Card>,
);
```

כל אזורי התוכן הם אופציונליים — יש להרכיב רק את החלקים הדרושים; תוכן אזורי התוכן מועבר כפי שהוא, ללא כל עטיפה.

## Props

`Card`, `CardHeader`, `CardContent`, `CardFooter` מקבלים props מסוג מיכל:

| Prop        | סוג         | ברירת מחדל | תיאור                     |
| ----------- | ----------- | ---------- | ------------------------- |
| `children`  | `PingoNode` | —          | תוכן אזור התוכן (חובה)    |
| `className` | `string`    | —          | מצורף לאחר שם מחלקת הרכיב |

`CardTitle`, `CardDescription` מקבלים props מסוג טקסט:

| Prop        | סוג      | ברירת מחדל | תיאור                     |
| ----------- | -------- | ---------- | ------------------------- |
| `children`  | `string` | —          | תוכן טקסטואלי (חובה)      |
| `className` | `string` | —          | מצורף לאחר שם מחלקת הרכיב |

## נגישות

Card הוא מיכל ויזואלי בלבד, ואינו מוסיף סמנטיקה נוספת; השם הקריא והמבנה של הכרטיס ניתנים על ידי הרכיבים הפנימיים המוצבים בו, כגון כותרות וכפתורים. צבעי הכותרת והטקסט יורשים את צבע החזית של הכרטיס, ושומרים על ניגודיות הן בערכת הנושא הבהירה והן בכהה.
