---
title: "العناصر القابلة للتحرير: Input وTextArea"
description: بدائيات النصّ القابل للتحرير الأصيلة في المحرّك — عقد معاملات revision المتحكَّم بها وجسر إدخال EditContext وكلمات المرور والقراءة فقط.
---

# العناصر القابلة للتحرير: Input وTextArea

‏`Input` و`TextArea` (تُصدَّر في `@dopejs/pingo` باسم `UnstyledTextArea`، انظر أدناه) بدائيتا نصّ
قابل للتحرير أصيلتان في المحرّك: المؤشّر النصّي والتحديد وتركيب IME والحافظة والتراجع والإعادة كلّها
من تنفيذ النواة، **ولا حاجة إلى تغطية canvas بأيّ عنصر إدخال HTML**. المعاينة أدناه حقيقية قابلة
للكتابة — انقر للتركيز وجرّب طريقة إدخال صينية والسحب للتحديد وCtrl+Z.

:::preview elements-input
:::

## الاستخدام

النمط المتحكَّم به: `value` + `revision` متزايد بانتظام، مع تأكيد المعاملات القادمة من النواة في
`onTransaction`:

```tsx
import { createElement, Input, type EditTransaction } from "@dopejs/pingo";

let value = "订单备注";
let revision = 1n;

function applyDelta(current: string, transaction: EditTransaction): string {
  const delta = transaction.delta;
  return delta === undefined
    ? current
    : current.slice(0, delta.range.start) + delta.text + current.slice(delta.range.end);
}

createElement(Input, {
  value,
  revision,
  semanticLabel: "订单备注",
  onTransaction: (transaction) => {
    value = applyDelta(value, transaction);
    revision = transaction.revision;
  },
});
```

للحالة المحلّية البحتة يمكن إغفال `value` / `revision` واستخدام `TextEditingController` بدلًا منهما
(في سياق hooks استخدم `useTextEditingController`)؛ `controller` متنافٍ مع `value`/`revision`.

## عقد معاملات revision

ملكيّة الحالة صريحة: **الغلاف يملك بيانات العمل، والنواة تملك الحالة اللحظية لجلسة التحرير النشطة.**

1. يصل الإدخال إلى النواة فيتحقّق من مطابقة `base_revision` للجلسة الحالية؛
2. بعد النجاح **يُطبَّق ويُعاد رسمه فورًا** — لا تحتاج كلّ ضغطة مفتاح إلى دورة كاملة عبر خطّ أنابيب
   العرض؛
3. تُصدِر النواة عكسيًا `EditTransaction` مُصدَرة؛
4. يؤكّد الغلاف (يحدّث `value` / `revision` لديه)، أو يرسل عند فشل تحقّق العمل قيمة مصحَّحة بـ
   `revision` جديد. ولن تطمس revision منتهية الصلاحية إدخالًا أحدث في النواة أبدًا؛ وتأكيد revision
   نفسها لا يفرّغ مكدّس التراجع.

حقول `EditTransaction`:

| الحقل          | النوع                                                       | الوصف                                                                                              |
| -------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `nodeId`       | `number`                                                    | عقدة التحرير التي أنتجت المعاملة                                                                   |
| `baseRevision` | `bigint`                                                    | ‏revision التي بُنيت عليها المعاملة                                                                |
| `revision`     | `bigint`                                                    | ‏revision الجديدة بعد المعاملة                                                                     |
| `delta`        | `{ range: { start, end }, text }`                           | فرق النصّ؛ الإزاحات UTF-16 مواءَمة لـ EditContext/InputEvent. معاملات التحديد الصرفة بلا هذا الحقل |
| `selection`    | `{ anchor, focus, anchorAffinity, focusAffinity }`          | التحديد بعد المعاملة                                                                               |
| `composition`  | `{ start, end }`                                            | مجال تركيب IME الجاري                                                                              |
| `kind`         | `"edit" \| "composition" \| "external" \| "undo" \| "redo"` | فئة المعاملة                                                                                       |

## جسر الإدخال: EditContext والوكيل التراجعي

يتّصل الخيط الرئيسي بخدمة إدخال النصّ في نظام التشغيل حسب الأولوية:

1. **EditContext** — يرتبط بالـ canvas ويستقبل النصّ والتحديد والتركيب، ويُبلِغ طريقة الإدخال بـ
   control وselection وحدود المحارف، فتلتصق نافذة المرشّحات بالمؤشّر النصّي.
2. **وكيل إدخال يديره المحرّك** — عند تعذّر EditContext يحتفظ المضيف بعنصر `textarea` مخفيّ
   **واحد** شامل يعالج `beforeinput` والتركيب ولوحة المفاتيح البرمجية والحافظة معالجةً موحّدة.

هذا تنفيذ تراجع خاصّ بالمنصّة لا نموذج مكوّنات EmbedDOM: لا يوجد في Scene عنصر DOM يقابل كلّ عقدة
تحرير واحدًا بواحد. ويجتاز المساران مجموعة اختبارات عقد سلوك التحرير نفسها.

## تعدّد الأسطر: بدائية TextArea

تشارك بدائية `TextArea` مع `Input` نظام `editableText` الفرعي نفسه، والفرق الوحيد أنّ ثابت
`multiline` مثبَّت من المكوّن. Enter يدرج سطرًا جديدًا دون إطلاق `onSubmit`؛ ومفاتيح الأسهم
أعلى/أسفل تحفظ العمود المرغوب (desired-x) عند الانتقال بين الأسطر.

:::preview elements-textarea
:::

## الخصائص (Input / UnstyledTextArea)

يتشارك كلاهما `EditableTextProps` (‏`multiline` غير مكشوفة بل يثبّتها المكوّن):

| Prop            | النوع                          | القيمة الافتراضية | الوصف                                                                                            |
| --------------- | ------------------------------ | ----------------- | ------------------------------------------------------------------------------------------------ |
| `value`         | `string`                       | —                 | النصّ المتحكَّم به                                                                               |
| `revision`      | `number \| bigint`             | —                 | ‏revision المرجعية للقيمة المتحكَّم بها؛ القيمة المنتهية الصلاحية لا تطمس إدخالًا أحدث في النواة |
| `controller`    | `TextEditingController`        | —                 | متحكّم محلّي مستقرّ؛ متنافٍ مع `value`/`revision`                                                |
| `readOnly`      | `boolean`                      | `false`           | قراءة فقط                                                                                        |
| `password`      | `boolean`                      | `false`           | وضع كلمة المرور (انظر أدناه)                                                                     |
| `maxGraphemes`  | `number`                       | —                 | الحدّ الأقصى للعناقيد الحرفية                                                                    |
| `inputMode`     | `EditableInputMode`            | `"text"`          | تلميح لوحة المفاتيح البرمجية: `decimal` `email` `none` `numeric` `search` `tel` `text` `url`     |
| `onTransaction` | `(t: EditTransaction) => void` | —                 | ردّ نداء معاملات تحرير النواة                                                                    |
| `onSubmit`      | `() => void`                   | —                 | إرسال بـ Enter في السطر الواحد؛ Enter في تعدّد الأسطر محجوز للسطر الجديد                         |

يرث مظهر النصّ من `TextProps`: ‏`color` و`fontSize` و`fontWeight` و`lineHeight` و`fontFamily`
و`font`؛ والمقاسات و`padding` و`backgroundColor` والإطارات (قناة `style`) وغيرها من
[CommonProps](/api).

## إمكانية الوصول والخصوصية

- عقد التحرير تحمل دلالة `textbox` ذاتًا؛ وفّر الاسم بـ `semanticLabel` (مهمّ خصوصًا عند غياب label
  مرئيّ).
- محتوى كلمة المرور لا يُرسَم إلا بمحارف مقنّعة داخل النواة: النصّ الصريح لا يدخل DisplayList ولا
  التسجيل وإعادة التشغيل ولا devtools ولا قيم إمكانية الوصول، وهدف كلمة المرور لا يكتب إلى
  الحافظة.

التصميم الأعمق (نموذج مواضع النصّ وحدود bidi ومصفوفة اختبارات العقد) في
[النصّ والتحرير](/guide/editing).
