---
title: "الرسومات المتجهة: Path و SVG"
description: مسارات Path المتجهة ومجموعة فرعية من مستندات SVG — صياغة d، وقياس viewBox، والتحديد، وأيقونات currentColor.
---

# الرسومات المتجهة: Path و SVG

تُعد الرسومات المتجهة في pingo قدرة أساسية في محرك الرسم: فالمسارات تُخزَّن كمورد غير قابل للتغيير في جانب Core، لذا فإن رسم الأيقونة نفسها 50 مرة لا يُنشئ سوى هندسة واحدة. هناك مدخلان: `Path` يقبل مقطع بيانات مسار SVG مباشرة؛ و`Svg` يقبل مستندًا كاملًا محللًا عبر `createSvg` / `loadSvg`. تُعرض المعاينة أدناه مباشرة بواسطة المحرك، ويتبع لون الأيقونة سمة الموقع.

:::preview elements-svg-icon
:::

## Path: محيط منفرد

```tsx
import { createElement, Path, View } from "@dopejs/pingo";

createElement(View, {
  style: { color: "#3157dfff" }, // يُرسم المحيط بلون العقدة، ويُورَّث مثل النص
  children: createElement(Path, {
    d: "M20 6 9 17l-5-5",
    viewBox: [0, 0, 24, 24],
    width: 24,
    height: 24,
    strokeWidth: 2,
  }),
});
```

- يدعم `d` صياغة مسار SVG الكاملة (`M L H V C S Q T A Z` والصيغ النسبية بالأحرف الصغيرة)؛ يُحوَّل القوس `A` إلى منحنيات بيزيه تكعيبية عند التحليل، ولا يحتاج Core إلى نوع منحنٍ منفصل.
- `viewBox` هو صندوق فضاء المؤلف، ويُقاس ليتسع داخل صندوق العقدة عند الرسم — المورد نفسه يعمل مباشرة في عقد بحجم 16px و48px دون حاجة المستدعي إلى أي تحويل.
- عند عدم تمرير `strokeWidth` يُملأ المحيط؛ وعند تمرير قيمة غير صفرية يُحدَّد بهذا العرض (بنهايات وزوايا دائرية).
- يُدمج `geometryTransform` في نقاط الهندسة قبل الترميز (في مستند SVG، تحريك المجموعة يحرك الشكل لا الصندوق الذي يحتويه)، وهو أمر مختلف عن `transform` البصري للعقدة.

:::preview elements-path
:::

## Svg: مجموعة فرعية من المستند

تستخدم `createSvg(markup)` محللًا مكتوبًا يدويًا بدلًا من `DOMParser` — يحتاج المحرك إلى إنتاج هندسة متطابقة تمامًا في المتصفح وWorker واختبارات الفروق دون واجهة رسومية، بينما `DOMParser` غير متوفر في Worker. تمثل المجموعة الفرعية ما تتضمنه مجموعات الأيقونات فعليًا:

- عناصر الأشكال: `path` `circle` `ellipse` `rect` `line` `polyline` `polygon`؛
- العناصر البنيوية: `svg` `g` `title` `desc` `defs` `metadata`؛
- الخصائص: `fill` `stroke` `stroke-width` `fill-rule` `transform`
  (`translate`/`scale`/`rotate`/`matrix`، ولا يُعد skew ضمن المجموعة الفرعية).

تُرفض العناصر خارج المجموعة الفرعية **بالاسم** مع رمي `PingoSvgError` — يعرف المستدعي بوضوح ما فقده، بدلًا من مواجهة صندوق فارغ. كما تُرفض ألوان CSS المسماة أيضًا: فجدول ألوان جزئي قد يجعل بعض المستندات تعمل بينما يتحول بعضها الآخر إلى الأسود بصمت. الألوان السداسية العشرية و`none` و`transparent` و`currentColor` كلها ضمن المجموعة الفرعية؛ يُفسَّر `currentColor` بوصفه «يرث لون العقدة»، لذا يمكن للأيقونة تغيير لونها مع السمة مثل النص (وهو النهج المتبع في المعاينة).

يفرد مكوِّن `Svg` المستند إلى **عقدة path لكل شكل**، وتُكدَّس الأشكال فوق بعضها بتموضع مطلق؛ الشكل الذي يُملأ ويُحدَّد معًا يصبح عقدتين — فالملء والتحديد عمليتا طلاء مختلفتان، وليستا نصفين لعقدة واحدة.

```ts
import { createSvg, loadSvg, Svg } from "@dopejs/pingo";

const icon = createSvg(`<svg viewBox="0 0 24 24" stroke="currentColor" …>…</svg>`);
createElement(Svg, { source: icon, width: 24, height: 24, style: { color: "#3157df" } });

const remote = await loadSvg("/assets/logo.svg");
```

عند الحاجة إلى وصول برمجي، تمنحك `PingoSvg.shapes` لكل شكل قيم `d` و`transform` والملء/التحديد و`fillRule`؛ كما يمكن لـ `shapeData(name, attributes)` تحويل عنصر شكل مفرد إلى بيانات path مكافئة.

## Props (Path)

| Prop | النوع | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `d` | `string` | — | بيانات مسار SVG (مطلوبة، صياغة مسار فقط وليست مستندًا) |
| `viewBox` | `readonly [number, number, number, number]` | — | صندوق فضاء المؤلف، يُقاس ليتسع داخل صندوق العقدة |
| `strokeWidth` | `number` | — | يُحدَّد بدلًا من الملء عند تمرير قيمة غير صفرية |
| `fillRule` | `"nonzero" \| "evenodd"` | `"nonzero"` | قاعدة الملء |
| `geometryTransform` | `readonly [number, number, number, number, number, number]` | مصفوفة الوحدة | تحويل يُدمج في الهندسة قبل الترميز |

## Props (Svg)

| Prop | النوع | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `source` | `PingoSvg` | — | المستند المحلل عبر `createSvg` / `loadSvg` (مطلوب) |

يرث كلاهما [CommonProps](/api) (`width`/`height` والأحداث وخصائص الدلالات وما إلى ذلك).

## إمكانية الوصول

الرسومات المتجهة بحد ذاتها لا تحمل دلالات. الأيقونات التزيينية لا تحتاج إلى وسم؛ أما أزرار الأيقونات القابلة للنقر فامنحها `semanticRole: "button"` و`semanticLabel`، انظر [إمكانية الوصول](/guide/accessibility).
