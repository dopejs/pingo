---
title: Checkbox
description: مربع اختيار متعدد مُتحكَّم به، يمكن أن يحمل تسمية نصية، ويُعرض على لوحة pingo.
---

# Checkbox

يُستخدم مربع الاختيار المتعدد كمفتاح منطقي مستقل. تُعرض المعاينة أدناه مباشرةً بواسطة محرك pingo، وتتبع مظهر الموقع بين الوضعين الفاتح والداكن. يُعد Checkbox مكوّنًا مُتحكَّمًا به: تعرض المعاينة تركيبات ثابتة للحالات مفعّل/معطّل/موقوف، بينما يقود التفاعلَ حالةٌ يملكها الطرف المستدعي.

:::preview checkbox-basic
:::

## الاستخدام

```tsx
import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
import { Checkbox } from "@dopejs/pingo-ui";

// useSignal خطاف، ويجب أن يعمل داخل نطاق المكوّن.
function NotificationSetting(): PingoNode {
  const enabled = useSignal(false);
  return createElement(Checkbox, {
    checked: enabled.get(),
    label: "تم تفعيل الإشعارات",
    onCheckedChange: (next) => enabled.set(next),
  });
}

root.render(createElement(NotificationSetting));
```

يملك المكوّن الأب خاصية `checked`، ويتولى `onCheckedChange` تحديثها — ولا يحتفظ المكوّن نفسه بالحالة. خاصية `label` اختيارية، وعند توفيرها يُعرض النص على يمين مربع الاختيار.

## أمثلة

### التعطيل

عند تمرير `disabled` يتوقف مربع الاختيار عن الاستجابة للمؤشر ولوحة المفاتيح، وتصبح القيمة الدلالية `disabled`.

## Props

| Prop | النوع | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `checked` | `boolean` | — | حالة الاختيار (إلزامية، مُتحكَّم بها) |
| `onCheckedChange` | `(checked: boolean) => void` | — | استدعاء رجعي عند تبديل الحالة |
| `disabled` | `boolean` | `false` | حالة التعطيل |
| `label` | `string` | — | تسمية نصية على يمين مربع الاختيار |
| `className` | `string` | — | تُضاف بعد اسم فئة المكوّن |
| `semanticLabel` | `string` | — | اسم خاص بإمكانية الوصول |

## إمكانية الوصول

يحمل المكوّن دورًا دلاليًا هو `checkbox`، وتتبدل القيمة الدلالية مع الحالة بين `checked` / `unchecked` / `disabled`. يحدث التركيز تلقائيًا عند الضغط بالمؤشر. يعتمد مؤشر ✓ على تغطية محارف الخط، ويُستخدم كتنفيذ احتياطي إلى أن تصبح أصول الأيقونات جاهزة.
