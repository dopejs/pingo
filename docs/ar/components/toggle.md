---
title: Toggle
description: زر تبديل ثنائي الحالة يُستخدم للتبديل الفوري مثل الخط العريض والمائل، ويُعرض على لوحة pingo.
---

# Toggle

زر تبديل ثنائي الحالة، يُضغط مرة واحدة فيبقى مفعّلاً، ويُضغط مرة أخرى فينطفئ. المعاينة أدناه تُعرض لحظيًا بواسطة محرك pingo — يمكنك النقر لتبديل الحالة، كما يتبع السمة الفاتحة/الداكنة للموقع.

:::preview toggle-basic
:::

## الاستخدام

```tsx
import { createElement } from "@dopejs/pingo";
import { Toggle } from "@dopejs/pingo-ui";

root.render(
  createElement(Toggle, {
    children: "加粗",
    defaultPressed: true,
    onPressedChange: (pressed) => console.log(pressed),
  }),
);
```

يحتفظ `Toggle` بالحالة داخليًا عبر الخطافات، ويجب تركيبه كمكوّن باستخدام `createElement`. عند تمرير `pressed` يدخل في الوضع المُتحكَّم به؛ وإلا فاستخدم `defaultPressed` ليجعل المكوّن يحتفظ بحالته ذاتيًا.

## أمثلة

### التعطيل

عند تمرير `disabled` يتوقف الزر عن الاستجابة للمؤشر ولوحة المفاتيح، ولا يستقبل التفعيل عبر Enter/المسافة.

## Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` | `string` | — | نص الزر (مطلوب) |
| `pressed` | `boolean` | — | حالة الضغط المُتحكَّم بها |
| `defaultPressed` | `boolean` | `false` | حالة الضغط الأولية غير المُتحكَّم بها |
| `onPressedChange` | `(pressed: boolean) => void` | — | استدعاء عند تبديل الحالة |
| `disabled` | `boolean` | `false` | حالة التعطيل |
| `className` | `string` | — | يُضاف بعد اسم فئة المكوّن |

## إمكانية الوصول

يحمل المكوّن دلالات زر، وتتبدل القيمة الدلالية مع الحالة بين `on` / `off`. عند الضغط بالمؤشر يكتسب التركيز تلقائيًا، ويمكن التفعيل بكل من `Enter` و`المسافة`.
