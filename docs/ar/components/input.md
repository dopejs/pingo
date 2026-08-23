---
title: Input
description: حقل إدخال نصي من سطر واحد، مدفوع بمحرر pingo ويُعرض على لوحة الرسم.
---

# Input

إدخال نصي من سطر واحد. المعاينة أدناه تُعرض مباشرة بواسطة محرك pingo — بعد النقر يمكنك فعليًا الكتابة والتحديد والحذف، مع التبديل بين الوضعين الفاتح والداكن تبعًا لسمة الموقع.

:::preview input-basic
:::

## الاستخدام

```tsx
import { createElement } from "@dopejs/pingo";
import { Input } from "@dopejs/pingo-ui";

root.render(
  createElement(Input, {
    semanticLabel: "البريد الإلكتروني",
    width: 320,
    onValueChange: (value) => console.log(value),
  }),
);
```

يحافظ `Input` داخليًا عبر الخطافات على `TextEditingController` مستقر، لذلك يجب تركيبه كمكوّن باستخدام `createElement(Input, props)`، ولا يمكن استدعاؤه مباشرة كدالة. تفاصيل التحرير موجودة في [دليل تحرير النصوص](/guide/editing).

## أمثلة

### البادئة واللاحقة وكلمة المرور

تتيح فتحات `prefix`/`suffix` وضع أيقونات أو وحدات؛ ويتيح `password` الإدخال المقنّع؛ بينما يقفل `disabled` الحقل بالكامل.

:::preview input-adornments
:::

### الاستخدام المُتحكَّم به

عند تمرير `controller` الخاص بك تدخل في وضع التحكم، وفي هذه الحالة يُتجاهل `value` بصفته قيمة أولية فقط، ويحتفظ المستدعي بوحدة التحكم مع الحفاظ على المثيل نفسه عبر عمليات العرض.

## Props

| Prop | النوع | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `value` | `string` | `""` | القيمة الأولية للاستخدام غير المُتحكَّم به؛ تُتجاهل بعد ضبط `controller` |
| `onValueChange` | `(value: string) => void` | — | يُستدعى بأحدث قيمة بعد تطبيق كل عملية تحرير |
| `controller` | `TextEditingController` | — | منفذ متقدم: وحدة تحكم دائمة يحتفظ بها المستدعي |
| `onTransaction` | `(transaction: EditTransaction) => void` | — | الاستدعاء الخام لكل عملية تحرير |
| `onSubmit` | `() => void` | — | استدعاء الإرسال (مفتاح الإدخال) |
| `disabled` | `boolean` | `false` | حالة التعطيل |
| `readOnly` | `boolean` | `false` | حالة القراءة فقط |
| `password` | `boolean` | `false` | الإدخال المقنّع |
| `inputMode` | `"decimal" \| "email" \| "none" \| "numeric" \| "search" \| "tel" \| "text" \| "url"` | `"text"` | تلميح لتخطيط لوحة المفاتيح الافتراضية |
| `className` | `string` | — | يُضاف بعد اسم فئة المكوّن |
| `width` | `number` | — | عرض ثابت (بالبكسل) |
| `semanticLabel` | `string` | — | الاسم المخصص لإمكانية الوصول |
| `prefix` | `PingoNode` | — | زخرفة أمامية، مثل أيقونة أو رمز عملة |
| `suffix` | `PingoNode` | — | زخرفة خلفية، مثل وحدة أو زر مسح |

## إمكانية الوصول

يُوفَّر اسم الحقل عبر `semanticLabel`؛ ويؤدي كل من `disabled` و`readOnly` إلى إخراج الحقل من تسلسل التحرير. الثغرات المعروفة حاليًا: لا يوجد نص عنصر نائب (placeholder) ولا نمط لحلقة التركيز.
