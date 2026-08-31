---
title: مجموعة الاختيار
description: مجموعة خيارات أحادية الاختيار، تدعم التنقل بأسهم لوحة المفاتيح، وتُعرض على لوحة رسم pingo.
---

# مجموعة الاختيار

تُستخدم مجموعة الاختيار لاختيار عنصر واحد من مجموعة خيارات متبادلة. تُعرض المعاينة أدناه مباشرةً بواسطة محرك pingo — يمكنك النقر على الخيارات أو استخدام أسهم لوحة المفاتيح لتحريك التحديد، كما تتبع المظهر الفاتح/الداكن للموقع.

:::preview radio-group-basic
:::

## الاستخدام

```tsx
import { RadioGroup, RadioGroupItem } from "@dopejs/pingo-ui";

root.render(
  <RadioGroup defaultValue="b" onValueChange={(value) => console.log(value)}>
    <RadioGroupItem value="a" label="选项 A" />
    <RadioGroupItem value="b" label="选项 B" />
    <RadioGroupItem value="c" label="选项 C" />
  </RadioGroup>,
);
```

تنشر `RadioGroup` القيمة الحالية إلى `RadioGroupItem` عبر context، لذا يجب تركيب كليهما كمكوّنين باستخدام JSX. عند تمرير `value` يدخل المكوّن في الوضع المُتحكَّم به؛ وإلا فاستخدم `defaultValue` ليتولى المكوّن حالته بنفسه.

## أمثلة

### التعطيل

تمرير `disabled` إلى `RadioGroup` يعطّل المجموعة بأكملها، وتصبح القيمة الدلالية للعنصر الواحد `disabled`.

## Props

### RadioGroup

| Prop            | النوع                     | القيمة الافتراضية | الوصف                                     |
| --------------- | ------------------------- | ----------------- | ----------------------------------------- |
| `value`         | `string`                  | —                 | القيمة المحددة المُتحكَّم بها             |
| `defaultValue`  | `string`                  | —                 | القيمة المحددة الأولية غير المُتحكَّم بها |
| `onValueChange` | `(value: string) => void` | —                 | استدعاء عند تغيّر التحديد                 |
| `disabled`      | `boolean`                 | `false`           | تعطيل المجموعة بأكملها                    |
| `children`      | `PingoNode`               | —                 | قائمة عناصر `RadioGroupItem` (مطلوبة)     |
| `className`     | `string`                  | —                 | تُضاف بعد اسم فئة المكوّن                 |

### RadioGroupItem

| Prop        | النوع    | القيمة الافتراضية | الوصف                     |
| ----------- | -------- | ----------------- | ------------------------- |
| `value`     | `string` | —                 | قيمة الخيار (مطلوبة)      |
| `label`     | `string` | —                 | نص الخيار                 |
| `className` | `string` | —                 | تُضاف بعد اسم فئة المكوّن |

## إمكانية الوصول

يحمل حاوي المجموعة دلالة `radiogroup`، ويحمل العنصر الواحد دلالة `radio` ويتنقل بين `checked` / `unchecked` / `disabled`. وفقًا لمعيار WAI-ARIA: بغض النظر عن اتجاه التخطيط، يمكن استخدام مجموعتي أسهم الاتجاه لتحريك التحديد ومزامنة التركيز.
