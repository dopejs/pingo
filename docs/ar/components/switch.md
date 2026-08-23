---
title: Switch
description: مفتاح تحكم مُدار لتفعيل الإعدادات المنطقية بشكل فوري، يُرسم على لوحة pingo.
---

# Switch

يُستخدم المفتاح للإعدادات المنطقية التي تسري فورًا. المعاينة التالية تُرسم مباشرةً بواسطة محرك pingo، وتتبع سمة الموقع في التبديل بين الوضعين الفاتح والداكن. يُعد Switch مكوّنًا مُدارًا: تعرض المعاينة تركيبات ثابتة لحالات التشغيل/الإيقاف/التعطيل، بينما يتحكم بالتفاعل الحالةُ التي يحتفظ بها الطرف المستدعي.

:::preview switch-basic
:::

## الاستخدام

```tsx
import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
import { Switch } from "@dopejs/pingo-ui";

// useSignal هو hook، يجب تنفيذه داخل نطاق المكوّن.
function AirplaneMode(): PingoNode {
  const on = useSignal(false);
  return createElement(Switch, {
    checked: on.get(),
    semanticLabel: "وضع الطيران",
    onCheckedChange: (next) => on.set(next),
  });
}

root.render(createElement(AirplaneMode));
```

يحتفظ المكوّن الأب بقيمة `checked`، ويتولى `onCheckedChange` تحديثها — ولا يخزّن المكوّن نفسه الحالة.

## أمثلة

### التعطيل

عند تمرير `disabled` يتوقف المفتاح عن الاستجابة للمؤشر ولوحة المفاتيح، وتصبح القيمة الدلالية `disabled`.

## Props

| Prop              | النوع                        | القيمة الافتراضية | الوصف                           |
| ----------------- | ---------------------------- | ----------------- | ------------------------------- |
| `checked`         | `boolean`                    | —                 | حالة المفتاح (مطلوبة، مُدارة)   |
| `onCheckedChange` | `(checked: boolean) => void` | —                 | دالة الاستدعاء عند تبديل الحالة |
| `disabled`        | `boolean`                    | `false`           | حالة التعطيل                    |
| `className`       | `string`                     | —                 | تُضاف بعد اسم فئة المكوّن       |
| `semanticLabel`   | `string`                     | —                 | الاسم الخاص بإمكانية الوصول     |

## إمكانية الوصول

يحمل المكوّن الدور الدلالي `switch`، وتتبدل القيمة الدلالية مع الحالة بين `on` / `off` / `disabled`. يكتسب التركيز تلقائيًا عند الضغط بالمؤشر. لا يحتوي المفتاح على نص مرئي، لذا احرص دائمًا على توفير `semanticLabel`.
