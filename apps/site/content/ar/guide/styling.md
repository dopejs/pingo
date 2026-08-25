---
title: الأنماط
description: مجموعة CSS الفرعية في pingo — محدِّدات الأصناف والتتالي والأولويّة وحدود الوراثة، واتفاقيات السمات والتجاوز في pingo-ui.
---

# الأنماط

أنماط pingo هي **مجموعة CSS فرعية مُصدَرة** (الإصدار الحالي 1.6.0): يُحلَّل نصّ CSS ويُحسَب في جهة
الغلاف، والنواة لا تستهلك سوى قيم مُعيَّنة مُطبَّعة — نصّ CSS ومطابقة المحدِّدات لا يدخلان النواة
أبدًا. جدول الخصائص المدعومة الكامل في [دعم مجموعة CSS الفرعية](/guide/style-support)، وهذه الصفحة تشرح
الاستخدام والحدود.

## إنشاء أوراق الأنماط وتسجيلها

استخدم `createStyleSheet` لترجمة نصّ CSS (يرمي `StyleSheetCompileError` عند إدخال غير صالح)،
وسجّل الناتج عند إنشاء root:

```ts
import { createElement, createHostedCanvasRoot, createStyleSheet } from "@dopejs/pingo";

const sheet = createStyleSheet(
  `
  .card {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 16px;
  }
  `,
  { sourceName: "app.css" },
);

const root = await createHostedCanvasRoot(canvas, { styleSheets: [sheet] });

root.render(
  createElement("container", {
    className: "card",
    width: 320,
    children: createElement("text", { value: "你好", fontSize: 14 }),
  }),
);
```

إن لم ترغب في معالجة الاستثناءات استخدم `compileStyleSheet`: فهي لا ترمي على إدخال المؤلّف بل تعيد
diagnostics مستقرّة. يمكن أيضًا كتابة ورقة الأنماط بصيغة كائن آمنة النوع
(`PingoStyleSheetObject`)، حيث المفاتيح محدِّدات أصناف بنقطة بادئة أو بدونها، والقيم من نوع
`PingoStyle`:

```ts
const sheet = createStyleSheet({
  "card": { backgroundColor: "#ffffffff", borderRadius: 8, padding: 16 },
  "card:hover": { backgroundColor: "#f5f5f5ff" },
});
```

تُعلَّق الأصناف على العناصر عبر خاصيّة `className` (أسماء أصناف متعدّدة تفصلها مسافات ASCII)،
وتُكتَب التصريحات الداخلية عبر خاصيّة `style` (من نوع `PingoStyle`، يحلّلها الغلاف قبل دخولها
النواة).

## المحدِّدات والتتالي

المجموعة الفرعية لا تدعم سوى **محدِّدات الأصناف على العقدة نفسها**، وأصناف حالات التفاعل الأربعة:

- صنف مفرد `.card`؛ صنف مركّب `.pui-card.pui-dark` (لا تُصاب العقدة إلا إذا حملت جميع الأصناف).
- الحالات `:hover` و`:active` و`:focus` و`:focus-visible`، ويمكن تركيبها مع الأصناف مثل
  `.btn:hover`.

غير مدعوم: محدِّدات العناصر، والمُركِّبات مثل السليل/الابن، و`@media` / `@supports` /
`@keyframes`، و`var()` / `calc()`. وحدات الطول الوحيدة هي `px` و`%` (تُرفَض `em` / `rem` / `vw` /
`vh`)؛ والألوان تُكتَب hex أو `rgb()` / `rgba()` / `hsl()` / `hsla()` (تُقبَل الصيغتان القديمة
والجديدة)، وكلمات الألوان المفتاحية (مثل `red`) غير مدعومة.

قواعد التتالي متماثلة البنية مع CSS لكن أبسط:

1. **الأولويّة (specificity) = عدد الأصناف + عدد الحالات**. ‏`.pui-card.pui-dark` (2) تغلب
   `.card` (1).
2. **عند تساوي الأولويّة يحكم ترتيب المصدر (source order)**: تسري ورقة الأنماط المسجَّلة لاحقًا،
   والقاعدة الأبعد في الورقة نفسها.
3. **خاصيّة `style` الداخلية تغلب كلّ قواعد أوراق الأنماط**؛ والخصائص المباشرة على العنصر (مثل
   `width` و`backgroundColor`) أعلى أولويّة على الإطلاق وتغلب `style`.

انتبه لنتيجة القاعدة 2: أساس نجاح التجاوز هو **ترتيب تسجيل أوراق الأنماط**، ولا علاقة له بترتيب
أسماء الأصناف داخل سلسلة `className`.

## حدود الوراثة والأنماط المحسوبة

قليل من الخصائص فقط يُورَّث: `color` و`visibility` و`font-family` / `font-size` / `font-weight` /
`font-style` و`line-height` و`text-align` و`white-space` و`overflow-wrap` و`pointer-events`
و`cursor`. أمّا بقية الخصائص (بما فيها خصائص التخطيط كلّها) فتبدأ كلّ عقدة من قيمتها الابتدائية —
ما لم يُكتَب فهو غير موجود؛ لا يوجد سلوك مثل «وراثة العرض من الأب».

كلّ خاصيّة تُعلِن في schema وحيد المصدر نطاق إبطالها (تخطيط/رسم/إصابة/دلالة). تغيير `opacity` لا
يُطلِق إعادة تخطيط، وتغيير `width` يفعل؛ وهذه هي آلية نموذج الإبطال نفسها في
[البنية](/guide/architecture).

### الخصائص المُصرَّح بها في حالات التفاعل مقيَّدة

في قواعد الحالات (مثل `.btn:hover`) لا يُسمَح إلا بخصائص الرسم: `background-color` و`color`
و`opacity` و`border-*-color` لكلّ جانب و`border-radius` و`box-shadow` و`visibility` و`transform` /
`transform-origin` و`pointer-events` و`cursor`. كتابة خصائص تخطيط داخل قاعدة حالة تُرفَض وقت
الترجمة — تبديل الحالة لا يجوز أن يُطلِق تغييرًا في التخطيط.

## الانحرافات الرئيسية عن CSS

المجموعة الفرعية لا تستهدف توافق CSS الكامل عمدًا، وأهمّ الانحرافات (القائمة الكاملة في
[دعم مجموعة CSS الفرعية](/guide/style-support)):

- كتلة الاحتواء لـ `position: absolute` هي **العقدة الأب** لا أقرب سلف positioned؛ ولا يوجد
  `position: relative`، والإزاحة البصرية تُنفَّذ بـ `transform`.
- لا يوجد `flex-wrap`: حاوية flex سطر واحد، وما يفيض عن المحور الرئيسي يُقتَطع أو يُمرَّر.
- عنصر flex ليس له حدّ أدنى تلقائي للحجم ويمكن ضغطه إلى 0 (يكافئ كتابة `min-width: 0` في
  المتصفّح)؛ و`min-width: auto` / `min-height: auto` تفشل ترجمتهما مباشرة.
- عندما يكون حجم المحور الرئيسي غير محدَّد تُحسَب النسب المئوية `0` لا `auto` كما في CSS.
- يدعم `box-shadow` الظلال الخارجية فقط وبحدّ أقصى 4 طبقات لكلّ عقدة، ويُرفَض `inset`.
- يعيد `z-index` ترتيب الإخوة بثبات فقط، ولا يوجد stacking context.

## اتفاقيات السمات والتجاوز في pingo-ui

أسلوب مكتبة `@dopejs/pingo-ui` مجرّد ورقة أنماط مترجمة بالآلية أعلاه:

```ts
import { createHostedCanvasRoot, createStyleSheet } from "@dopejs/pingo";
import { createPingoUiStyleSheet } from "@dopejs/pingo-ui";

const myOverrides = createStyleSheet(`
  .pui-button { border-radius: 4px; }
`);

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [createPingoUiStyleSheet(), myOverrides], // 顺序不能反
});
```

- **تُنشِئ `createPingoUiStyleSheet()` ورقة مستقلّة غير قابلة للتغيير لكلّ root**.
- **يجب تسجيل ورقة المستخدم بعد ورقة pingo-ui**: عند تساوي الأولويّة يحكم ترتيب المصدر، فيسري ما
  كُتِب لاحقًا. خاصيّة `className` على المكوّن تُلحَق بعد أصناف المكوّن نفسه (مثل
  `pui-input pui-input--disabled mine`)، لكنّ نجاح التجاوز يتوقّف فقط على ترتيب التسجيل أعلاه.
- لرفع أولويّة التجاوز استخدم صنفًا مركّبًا لزيادة specificity (مثل `.pui-button.mine`) بدل
  الاعتماد على موضع الكتابة.

### السمتان الفاتحة والداكنة

```ts
import { setTheme, useTheme } from "@dopejs/pingo-ui";

setTheme("dark"); // 所有订阅组件自动重渲染
useTheme(); // 在组件 render 内读取并订阅
```

السمة signal على مستوى الوحدة: استدعاء `useTheme()` داخل render للمكوّن يشترك تلقائيًا، و`setTheme`
يُطلِق إعادة عرض كلّ المكوّنات المشترِكة. تُنفَّذ السمة الداكنة عبر صنف مركّب — في السمة الداكنة
يحمل المكوّن الصنف العلاميّ `pui-dark` فتُصيب قواعد الأسلوب المركّبة `.pui-x.pui-dark` (مثل
`.pui-card.pui-dark`).

**تخصيص العلامة التجارية سلوك وقت البناء**: لإنشاء preset جديد تجاوز الرموز (tokens) بـ
`@use "@dopejs/pingo-ui/styles/tokens" with ($primary: ...)`، ثمّ أعد ترجمة أسلوب المكوّنات عبر
إضافة Vite في `@dopejs/pingo-style-preprocess` — تغيير لون العلامة = إعادة بناء، ولا يمكن تبديله وقت
التشغيل. وألوان قيم الرموز بدورها لا تُكتَب إلا hex أو `rgb()` / `rgba()` / `hsl()` / `hsla()`.
خطّ أنابيب SCSS/Less في [دليل SCSS / Less](/guide/scss-less).
