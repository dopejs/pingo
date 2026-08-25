---
title: TopBar
description: مكوّن جزيئي لشريط التطبيق العلوي، يتكوّن من عنوان وفتحات أمامية وخلفية، ويُعرض على لوحة pingo.
---

# TopBar

TopBar هو جزيء منتج خاص بـ pingo: يجمع العنوان مع فتحتي `leading` (الشعار، الرجوع) و`actions` (الأزرار، الصورة الرمزية) في سطر واحد لشريط التطبيق العلوي. يشغل عمود العنوان دائمًا المساحة المتبقية (`flexGrow`)، مما يدفع الإجراءات إلى أقصى اليمين — دون أي قياس. تُعرض المعاينة أدناه بواسطة محرك pingo في الوقت الفعلي، وتتبع تبديل المظهر بين الفاتح والداكن للموقع.

:::preview topbar-basic
:::

علاقة التركيب مع مكوّنات shadcn الأساسية: لا يوفر TopBar في حد ذاته أزرارًا أو صورًا رمزية، بل يحدد **الهيكل التخطيطي**؛ تقبل فتحتا `leading` و`actions` أي `PingoNode`، وعادةً ما تُركّب مع مكوّنات أساسية مثل [Button](/components/button) وIconButton وAvatar. تُمرَّر عدة إجراءات ملفوفة في حاوية ذات `flexDirection: "row"`.

## الاستخدام

```tsx
import { createElement } from "@dopejs/pingo";
import { Avatar, Button, TopBar } from "@dopejs/pingo-ui";

root.render(
  createElement(TopBar, {
    title: "لوحة التحكم",
    leading: createElement(Avatar, { fallback: "P", size: 28 }),
    actions: createElement(Button, {
      children: "جديد",
      variant: "outline",
      onPress: () => create(),
    }),
  }),
);
```

## أمثلة

### بدون عنوان

عند حذف `title`، سيظل عمود العنوان يُعرض (عمود مرن فارغ)، وتبقى الإجراءات مدفوعة إلى أقصى اليمين؛ وهذا مناسب لأشرطة الأدوات التي تحتوي على منطقة عمليات فقط.

```tsx
createElement(TopBar, {
  actions: createElement(Button, { children: "تصدير", onPress: () => {} }),
});
```

## Props

| Prop        | النوع       | القيمة الافتراضية | الوصف                                                     |
| ----------- | ----------- | ----------------- | --------------------------------------------------------- |
| `title`     | `string`    | —                 | نص العنوان؛ عند حذفه يُعرض عمود مرن فارغ                  |
| `leading`   | `PingoNode` | —                 | الفتحة الأمامية، لوضع الشعار أو زر الرجوع                 |
| `actions`   | `PingoNode` | —                 | الفتحة الخلفية، تُدفع إلى أقصى اليمين بواسطة عمود العنوان |
| `className` | `string`    | —                 | يُضاف بعد اسم فئة المكوّن                                 |

## إمكانية الوصول

يتمتع TopBar بدور دلالي `banner`؛ وعند توفير `title`، يحمل نص العنوان دور `heading`. تكون خصائص إمكانية الوصول للمكوّنات داخل الفتحات (مثل `semanticLabel` في IconButton) مسؤولية كل مكوّن على حدة.
