# נגישות ויכולת בדיקה

## בארכיטקטורה מהיום הראשון

תוכן של canvas אינו נראה לקוראי מסך מעצם טבעו. pingo אינו מתייחס לנגישות כשכבה שמולבשת אחרי ההשקה:
הליבה מתחזקת עץ סמנטי (role / label / value / bounds / focusable), ו-`@dopejs/pingo-a11y` ממפה אותו
באופן מצטבר לעץ DOM צללי ממוקם אבסולוטית לצד ה-canvas.

רכיבי הצל שקופים חזותית אך קיימים בעץ הנגישות ובסדר המעבר ב-Tab; מיקוד בהם מועבר להפעלת העריכה של המנוע,
כך שמשתמשי מקלדת יכולים באמת להפעיל את שדות הקלט שבתוך ה-canvas.

## הצהרת סמנטיקה

```tsx
<container semanticRole="region" semanticLabel="לוח תשלום">
  <text value="תשלום" semanticRole="heading" semanticLabel="תשלום" />
  {TextField({ semanticLabel: "נמען", value, revision })}
</container>
```

ל-`editableText` יש סמנטיקת textbox כברירת מחדל. ערך של שדה סיסמה **לעולם אינו** נכנס לעץ הסמנטי.

## בדיקות E2E מבוססות סמנטיקה

מכיוון שהעץ הסמנטי משתקף ל-DOM אמיתי, בדיקות E2E יכולות לבחור לפי תפקיד ושם במקום להשוות פיקסלים:

```ts
import { getByRole, queryAllByRole } from "@dopejs/pingo";

const email = getByRole(document.body, "textbox", { name: "נמען" });
email.focus(); // מועבר להפעלת העריכה של המנוע
expect(queryAllByRole(document.body, "textbox")).toHaveLength(2);
```

תצלומי פיקסלים נשמרים, אך כ**ראיה משלימה** לנכונות הרינדור ולא כטענה היחידה. הבחירה הזו מונעת מבדיקות
ממשק ליפול בהמוניהן בכל פעם שרינדור הגופנים או ההחלקה משתנים.

## לטעון על מה שצויר בפועל

העץ הסמנטי עונה מה הצומת הזה, לא אם הפריים הזה באמת צייר את המחרוזת. ביניהם עומדים
נראוּת, סדר ציור, וירטואליזציה ומטמון תת-העצים, ופקודות נתיב הציור הראשי אינן נושאות
את המחרוזת כלל. `onPaintedText` משלים את החצי השני:

```ts
let painted: PaintedTextSnapshot | undefined;
const root = await createHostedCanvasRoot(canvas, {
  onPaintedText: (snapshot) => (painted = snapshot),
});

// העץ הסמנטי אומר שהכפתור קיים; הגשוש אומר שהוא צויר בפריים הזה.
getByRole(document.body, "button", { name: "שמירה" });
expect(painted?.records.some((record) => record.text === "שמירה")).toBe(true);
```

התצלום מגיע פעם בכל פריים, ו-`root.paintedText()` מחזיר את האחרון. כל רשומה נותנת
`nodeId`, `text`, ראשית בקואורדינטות מכשיר `origin`, ערוץ ציור `channel` ו-
`originClipped`. בלי `onPaintedText` המנוע כלל אינו מחשב אותו, ופריים עולה בדיוק כמו
בלי היכולת הזאת.

שני גבולות שכדאי לזכור: המדווח הוא מה ש**Core פלט**, לא מה שנשאר גלוי אחרי ההרצה --
חיתוך לפי אזור התצוגה קורה בקצה האחורי. ושדה סיסמה מדווח על המסכה `•`, כי זה מה
שמצויר.

## מעקב אחר העץ הסמנטי

```ts
const root = await createHostedCanvasRoot(canvas, {
  onSemantics: (nodes) => inspect(nodes),
  accessibility: true, // פעיל כברירת מחדל; false מכבה את עץ הצל
});
```

כל צומת מספק `nodeId`, `role`, `label`, `value`, `bounds` בקואורדינטות עולם, `focusable`, `focused`
והדגל `password`. באבחון הפריים, `dirtySemanticsNodes` מאפשר לעקוב אחר תדירות ההשבתה הסמנטית.

## הסמכת פלטפורמה

האוטומציה מכסה את ייצוא העץ הסמנטי, את המיפוי לעץ הצל, את הבוררים לפי תפקיד ותווית ואת חוזה המקלדת.
**מטריצת ההתנהגות של קוראי מסך אמיתיים (VoiceOver, NVDA, TalkBack) שייכת להסמכת פלטפורמה**, נמדדת בנפרד
ואינה נחשבת תנאי לסיום העבודה ההנדסית. הקו הזה מונע הצגת מסקנות לא מאומתות על מכשירים כהבטחת תמיכה.

ב[הדגמת הסמנטיקה ב-Playground](/he/playground#/semantics) אפשר לקרוא ישירות את העץ הסמנטי הנוכחי.
