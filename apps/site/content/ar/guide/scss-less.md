---
title: SCSS / Less
description: كتابة أوراق أنماط pingo بـ SCSS أو Less — خطّ ترجمة وقت البناء وإضافة Vite وحدود الأمان وتشخيص الأخطاء.
---

# SCSS / Less

مجموعة CSS الفرعية في pingo (انظر [دليل الأنماط](/guide/styling)) لا تقبل وقت التشغيل سوى نصّ CSS
أو كائن. لاستخدام المتغيّرات وmixin و`@use` / import وغيرها من تجارب التأليف، الطريق هو **الترجمة
وقت البناء**: تُجمَع SCSS/Less في جهة Node عبر `@dopejs/pingo-style-preprocess` إلى CSS، ثمّ
تُتحقَّق بـ `compileStyleSheet` القائمة أصلًا، فينتج وحدة JavaScript تصدّر افتراضيًا
`PingoStyleSheet`.

**لا يدخل Sass ولا Less حزمة المتصفّح ولا الواجهة (facade) ولا النواة** — لا يوجد وقت التشغيل أيّ
معالج مسبق، بل مترجم CSS الخفيف الموجود أصلًا فقط. وحدود المجموعة الفرعية لا تتّسع بذلك: محدِّدات
السليل و`@media` و`var()` و`calc()` و`em/rem/vw/vh` وغيرها ما تزال تُرفَض بالتشخيصات القائمة،
يفشل البناء بدل أن تمرّ بصمت.

## يجب الفصل بين دلالتَي الاستيراد

### أنماط DOM العادية (Vite الأصيل)

```ts
import "./site.scss";
import "./probe.less";
```

هذا المسار هو قدرة Vite الأصيلة على المعالجة المسبقة لـ CSS، وناتجه **DOM CSS** يحقنه Vite أو
يستخرجه. لا ينطبق إلا على صفحات DOM مثل موقع التوثيق وهيكل Storybook، **ولا ينتج
`PingoStyleSheet`**، ولا تستخدمه لأنماط داخل canvas.

### أوراق أنماط pingo (‏`?pingo-style`)

```ts
import { createHostedCanvasRoot } from "@dopejs/pingo";
import buttonSheet from "./button.scss?pingo-style";
import themeSheet from "./theme.less?pingo-style";

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [buttonSheet, themeSheet],
});
```

‏`?pingo-style` حدّ نوعيّ صريح: تُعالَج مسبقًا وقت البناء ثمّ تُتحقَّق بموجب مجموعة CSS الفرعية،
والوحدة الناتجة ESM تصدّر افتراضيًا `PingoStyleSheet`، **ولا تحقن أيّ CSS في DOM**.

## إضافة Vite

ثبّت حزمة الأدوات الخاصة بـ Node فقط (تتطلّب Node >= 22.12 وVite ^8):

```sh
pnpm add -D @dopejs/pingo-style-preprocess
```

سجّلها في `vite.config.ts`:

```ts
import { pingoStylePreprocess } from "@dopejs/pingo-style-preprocess/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    pingoStylePreprocess({
      // 可选：额外的 Sass load paths / Less paths
      scssLoadPaths: ["styles"],
      lessPaths: ["styles"],
      // 可选：依赖必须落在这些目录内（默认只有 entry 所在目录与 load paths）
      allowRoots: ["src", "styles"],
    }),
  ],
});
```

تأتي تصريحات الأنواع من مدخل `./client` في الحزمة، ويكفي الرجوع إليها مرة واحدة في
`tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["@dopejs/pingo-style-preprocess/client"]
  }
}
```

اتفاقيات سلوك الإضافة:

- لا تطابق سوى علم الاستعلام الدقيق `pingo-style` مع الامتداد `.scss` / `.less`؛ ولا تتأثّر بقية
  الملفّات.
- تعزل خطّ أنابيب CSS الأصيل في Vite عبر virtual module، فلا معالجة مسبقة مكرّرة ولا حقن CSS في
  DOM.
- يدخل ملفّ الدخول (entry) وكلّ partial/import في رسم المراقبة (watch graph) — **تعديل token أو
  mixin يُطلِق HMR وإعادة البناء الإنتاجي** دون مسح يدوي للذاكرة المؤقّتة.
- أيّ تشخيص بمستوى error يُسقِط البناء؛ والتحذيرات تُخرَج بموضع المصدر. عند فشل ترجمة HMR يبقى
  آخر وحدة مُسلَّمة وتُبلِغ dev server بالخطأ.
- تتحقّق الوحدة الناتجة عند التهيئة من `CSS_SUBSET_VERSION`: إن اختلفت نسخة المجموعة الفرعية بين
  facade وقت التشغيل والتحقّق وقت البناء رمت الوحدة خطأً فور تحميلها، ولا تسمح باختلاط دلالتين.
- توليد الأنماط متماثل الدلالة في البيئات الثلاث: dev وproduction وSSR.

## واجهة ترجمة Node

أنظمة البناء غير Vite (CLI وcodegen) يمكنها استخدام واجهة Node مباشرة:

```ts
import {
  compileLessString,
  compilePingoStyleFile,
  compileScssString,
  createStyleSheetFromLess,
  createStyleSheetFromScss,
} from "@dopejs/pingo-style-preprocess";
```

- ‏`compileScssString(source, options)`: متزامنة، لذا **لا تعالج سوى شيفرة بلا import**؛ عند
  وجود import تعيد تشخيص `file-api-required`.
- ‏`compileLessString(source, options)`: غير متزامنة (‏`render` في Less هي Promise)؛ ولا تحلّ
  import النسبية إلا بعد تزويدها بـ `sourceName` بمسار مطلق.
- ‏`compilePingoStyleFile(filename, options)`: واجهة ملفّات غير متزامنة، وهي ما تسلكه إضافة Vite،
  أساس التحليل النسبي واضح ورسم التبعيّات كامل.
- سلسلة `compile*` **لا ترمي استثناءات** على أخطاء إدخال المؤلّف، بل تعيد `styleSheet: null` مع
  diagnostics مرتّبة بثبات؛ أمّا `createStyleSheetFromScss` / `createStyleSheetFromLess` فغلافان
  مريحان يرميان `StylePreprocessError` الموحّد على أخطاء المؤلّف مع الاحتفاظ بكلّ التشخيصات.

يحوي `StylePreprocessResult` المعاد الحقول `cssText` و`styleSheet` و`diagnostics` و`dependencies`
(قائمة ملفّات التبعيّة الكاملة، تصلح لبناء مراقبة خاصّة).

## Source map وتشخيص الأخطاء

كلّ تشخيص يحمل علامة مرحلة:

| `stage`       | المصدر                                                    |
| ------------- | --------------------------------------------------------- |
| `"scss"`      | استثناء ترجمة Sass (خطأ صياغة، متغيّر غير معرَّف، إلخ)    |
| `"less"`      | رفض (rejection) ترجمة Less                                |
| `"pingo-css"` | تشخيص `compileStyleSheet` لناتج يتجاوز مجموعة CSS الفرعية |

كلا المترجمَين يفعّل source map، وتُنقَل مواضع توليد تشخيصات pingo CSS **بأقصى جهد إلى ملفّ
SCSS/Less الأصلي وسطره وعموده** (`sourceLocation`)؛ وعند تعذّر النقل يُحتفَظ بموضع التوليد
(`generatedLocation`) واسم ملفّ الدخول دون اختلاق موضع أصلي. تُرتَّب التشخيصات بثبات بحسب موضع
التوليد وcode، فتكون مخرجات CI ولقطات snapshot قابلة للتكرار.

## حدود الأمان

ينفّذ المعالج المسبق شيفرة المؤلّف وقت البناء، لذا تُشدَّد الإعدادات افتراضيًا:

- **Sass**: لا تُفتَح custom importer ولا custom function ولا Node package importer؛ لا تُقبَل
  سوى تبعيّات `file:`.
- **Less**: يُثبَّت `javascriptEnabled: false`، ولا تُمرَّر plugins، ويفحص المسح المسبق رفضًا
  لـ `@plugin`؛ ولا يُسمَح باستيراد HTTP(S) أو استيراد نسبيّ البروتوكول.
- **قيود مشتركة**: بعد التقنين (canonicalize) يجب أن تقع التبعيّات داخل allow roots (دليل ملفّ
  الدخول + load paths الصريحة)؛ يُرفَض الإفلات عبر symlink والتبعيّات غير الملفّية والتبعيّات
  البعيدة رفضًا قاطعًا. يمرّ CSS المترجَم أوّلًا بحدّ أقصى 1,048,576 وحدة ترميز قبل تحقّق المجموعة
  الفرعية؛ ولملفّ الدخول وعدد التبعيّات وإجمالي بايتاتها ميزانيّات صريحة، ويتجاوزها ينتج خطأ بناء
  مستقرًّا.
- تُثبَّت نسخ المترجمات عبر lockfile، وتُؤخَذ لقطات reproducibility لـ CSS والتشخيصات وقوائم
  التبعيّات في fixtures؛ ترقية Sass/Less تتطلّب مراجعة صريحة لفروق الناتج.

هذه القيود تحصر خطّ أدوات `?pingo-style` فقط؛ أمّا ملفّات `.scss` / `.less` الخاصة بـ DOM العادي
فتتبع إعدادات Vite نفسها.

## دوالّ الألوان

كثيرًا ما تُخرِج المعالجات المسبقة دوالّ ألوان، لذا تدعم المجموعة الفرعية `rgb()` / `rgba()` /
`hsl()` / `hsla()` (بصيغتَي الفواصل القديمة وspace/slash الحديثة)، وتُوحَّد كلّها إلى RGBA بـ
8 بتّات. أمّا الناتج الخارج عن هذه المجموعة — `color(display-p3 ...)` وخصائص CSS المخصّصة
و`calc()` — فيظلّ يُسقِط البناء.
