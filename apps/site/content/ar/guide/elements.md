---
title: "العناصر الأساسية: View وText وImage"
description: حاوية View وتخطيط flex، ورسم النصّ مع Text، والصور النقطية مع Image وخطوط PingoFont الصريحة.
---

# العناصر الأساسية: View وText وImage

عناصر المضيف في pingo تقابل عقد Scene مباشرة، بلا كلفة تتالي CSS أو مطابقة محدِّدات (قدرة الأنماط
في [الأنماط](/guide/styling)). تغطّي هذه الصفحة العناصر الثلاثة الأكثر أساسية: الصندوق العامّ
`View` والنصّ `Text` والصورة النقطية `Image`. المعاينات أدناه يرسمها محرّك pingo لحظيًا وتتبع سمة
الموقع بين الفاتح والداكن.

:::preview elements-layout
:::

## View والتخطيط

`View` صندوق تجميع عامّ (يقابل عنصر المضيف `container`) ولا يُدخِل نوعًا جديدًا من عقد Scene:

- ‏`width` / `height` / `minWidth` / `maxWidth` / `padding` / `backgroundColor` / `opacity` /
  `transform` خصائص مباشرة، ويقبل `padding` عددًا أو رباعية `[上, 右, 下, 左]`.
- ‏`flexDirection` و`justifyContent` و`alignItems` والإطارات والزوايا المدوّرة تمرّ عبر قناة
  `style` الداخلية (مجموعة CSS الفرعية المُعيَّنة، انظر [الأنماط](/guide/styling)).
- تُعبَّر المسافات بين الأبناء صراحةً بحاويات ثابتة المقاس؛ وهكذا تُنفَّذ مساعِدات `row` /
  `column` في المعاينة.

## الاستخدام

```tsx
import { Text, View } from "@dopejs/pingo";

root.render(
  <View
    width={420}
    padding={16}
    backgroundColor="#ffffffff"
    style={{ flexDirection: "column", borderRadius: 10 }}
  >
    <Text value="标题" fontSize={24} lineHeight={32} fontWeight={700} />
    <View height={8} />
    <Text value="正文" fontSize={14} lineHeight={22} />
  </View>,
);
```

## Text: مقطع نصّي

تشكيل النصّ والتفافه وقياسه كلّها من عمل النواة — الاختلاط بين الصينية والإنجليزية والرموز
التعبيرية ومحارف التركيب لا يحتاج مشاركة الغلاف. يُعطى المحتوى بـ `value` أو بـ `children`
نصّية.

:::preview elements-text
:::

### الخصائص (Text)

| Prop         | النوع              | القيمة الافتراضية | الوصف                                                             |
| ------------ | ------------------ | ----------------- | ----------------------------------------------------------------- |
| `value`      | `string`           | —                 | محتوى النصّ (واحد منه مع `children`)                              |
| `children`   | `string \| number` | —                 | محتوى النصّ                                                       |
| `color`      | `Color`            | `#000000ff`       | لون النصّ، قابل للوراثة                                           |
| `fontSize`   | `number`           | —                 | حجم الخطّ (بكسلات منطقية)                                         |
| `lineHeight` | `number`           | —                 | ارتفاع السطر (بكسلات منطقية)                                      |
| `fontWeight` | `number`           | —                 | وزن الخطّ                                                         |
| `fontFamily` | `string`           | —                 | عائلة خطوط CSS                                                    |
| `font`       | `PingoFont`        | —                 | خطّ صريح غير قابل للتغيير؛ الإدخال غير المدعوم يتراجع ككتلة واحدة |

يرث `Text` أيضًا جميع [CommonProps](/api) (المقاسات وpadding والأحداث و`semanticRole` /
`semanticLabel` وغيرها).

## Image: الصور النقطية

خاصيّة `source` في `Image` هي `PingoImage` — **صورة نقطية RGBA8 غير قابلة للتغيير** يحتفظ بها
الغلاف وتُضمَّن تزامنيًا كمورد Scene عند حدود التسليم (commit). تُنشَأ بـ `createImage` التي تنسخ
البكسلات وتتحقّق منها:

```tsx
import { createImage, Image } from "@dopejs/pingo";

const icon = createImage(pixels, 96, 96, { label: "应用图标" });
<Image source={icon} width={48} height={48} />;
```

دون `width` / `height` تأخذ العقدة مقاس الصورة بالبكسل؛ ومعهما تُقاس الصورة إلى صندوق العقدة.
‏`label` هو الاسم المخصّص لإمكانية الوصول، وتركه فارغًا يعني صورة زخرفية.

:::preview elements-image
:::

اختيار البكسلات بدل البايتات المرمّزة مقصود: معاملات الموارد تسري تزامنيًا عند حدود التسليم، بينما
يتطلّب أيّ ترميز فكّ تشفير غير متزامن. الصور المصغّرة في القوائم تلائم هذا المسار؛ أمّا الصور
الكبيرة فينبغي أن تسلك مسار الترميز مع staging غير متزامن.

## الخطوط: PingoFont وloadFont

تقبل خاصيّة `font` في `Text` والعناصر القابلة للتحرير خطّ SFNT صريحًا غير قابل للتغيير
(TTF/OTF/TTC) تشكّله النواة حتميًا. تستقبل `createFont` بايتات SFNT المفكوكة؛ وتضيف `loadFont`
التحميل عبر الشبكة وفكّ ترميز WOFF/WOFF2:

```tsx
import { loadFont } from "@dopejs/pingo";

const inter = await loadFont("/fonts/Inter-Regular.woff2", {
  fallbackFamily: "sans-serif",
});
<Text value="Hello" font={inter} fontSize={16} />;
```

‏`PingoFontOptions`: ‏`faceIndex` (فهرس الوجه في مجموعة TTC، الافتراضي `0`) و`fallbackFamily`
(عائلة CSS المستخدمة عند تراجع مسار الخطّ الصريح كلّه، الافتراضي `"sans-serif"`). فشل التحميل يرمي
`PingoFontLoadError` بـ `code` مستقرّ (مثل `fetch-failed` و`decode-failed` و`unsupported-format`).

## إمكانية الوصول

‏`semanticRole` و`semanticLabel` خاصيّتان مشتركتان بين جميع العناصر: العناوين والأزرار والمناطق
يجب أن تُوسَم دلاليًا على العنصر، واسم `Image` يأتي من `label` في `createImage`. تُعكَس اللقطة
الدلالية إلى شجرة DOM ظلّية بجوار canvas، للتفاصيل انظر [إمكانية الوصول](/guide/accessibility).
