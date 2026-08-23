---
title: "Widgets: مكونات محرك بدون أنماط"
description: "@dopejs/pingo-widgets يوفر TextField وTextArea وPressable وButton كمكونات على مستوى المحرك بدون أنماط، بالإضافة إلى الحدود مع @dopejs/pingo-ui."
---

# Widgets: مكونات محرك بدون أنماط

`@dopejs/pingo-widgets` هي الطبقة التركيبية الأولى فوق المحرك: فهي تجمع
[البدائيات القابلة للتحرير](/guide/elements-editing) مع التركيز والأحداث الأصلية في مكونات قابلة للاستخدام، مع زخرفة**بسيطة**
(حدود، حالة خطأ)، دون افتراض أي نظام تصميم. لا يعتمد منطق الأعمال على هذه الحزمة الداخلية مباشرة — بل تُعاد جميع الصادرات عبر
`@dopejs/pingo`. المعاينة أدناه تُعرض وتُحدث مباشرة ويمكن الكتابة فيها.

:::preview widgets-textfield
:::

## الصادرات والتسمية

| الصادر | الوصف |
| --- | --- |
| `TextField` | إدخال سطر واحد: حدود + زخرفة حالة الخطأ، يجمع داخليًا بدائية `editableText` فقط |
| `TextArea` | نسخة متعددة الأسطر؛ Enter ينشئ سطرًا جديدًا، ويُترك الإرسال لنموذج المضيف |
| `Pressable` | سطح تفعيل قابل للتركيز: View + تركيز + click/tap أصلي |
| `Button` | تركيبة ملائمة لزر نصي من `Pressable` + `Text` |

ملاحظة حول التسمية: `TextArea` في `@dopejs/pingo` تشير إلى هذا المكوّن المزخرف؛ بينما تُصدَّر البدائية**متعددة الأسطر** باسم
`UnstyledTextArea` (وبالمثل `TextAreaProps` لها الاسم المستعار `UnstyledTextAreaProps`).

## TextField وTextArea

الزخرفة الافتراضية هي حدود بسماكة 1px وحشوة داخلية 8px؛ وعند تمرير سلسلة `error` تتحول إلى حدود بلون الخطأ، ويُعرض
تحت الحقل وصف خطأ بدور `alert`. عقد التحكم (`value` + `revision` + `onTransaction`) مطابق تمامًا
[للعناصر القابلة للتحرير](/guide/elements-editing) — لا يقدم المكوّن مسار إدخال جديدًا.

```tsx
import { createElement, TextField } from "@dopejs/pingo";

createElement(TextField, {
  value,
  revision,
  semanticLabel: "المستلم",
  width: 320,
  error: value === "" ? "لا يمكن ترك المستلم فارغًا" : undefined,
  onTransaction: (t) => apply(t),
});
```

### Props (TextField)

| Prop | النوع | الافتراضي | الوصف |
| --- | --- | --- | --- |
| `value` | `string` | `""` | النص المُتحكم به |
| `revision` | `number \| bigint` | `0n` | المراجعة الموثوقة للقيمة المُتحكم بها |
| `controller` | `TextEditingController` | — | controller محلي؛ حصري مع `value`/`revision` |
| `readOnly` | `boolean` | — | للقراءة فقط |
| `password` | `boolean` | — | وضع كلمة المرور (النص الصريح لا يدخل DisplayList ولا قيمة إمكانية الوصول) |
| `maxGraphemes` | `number` | — | الحد الأقصى للوحدات الخطية (grapheme) |
| `inputMode` | `EditableInputMode` | — | تلميح لتخطيط لوحة المفاتيح الافتراضية |
| `width` | `number` | `240` | العرض الكلي بما فيه الحدود |
| `height` | `number` | `lineHeight × rows + 16` | الارتفاع الكلي بما فيه الحدود |
| `fontSize` | `number` | `14` | حجم الخط |
| `lineHeight` | `number` | `round(fontSize × 1.5)` | ارتفاع السطر |
| `color` | `Color` | `#1f2329ff` | لون النص |
| `backgroundColor` | `Color` | `#ffffffff` | لون خلفية الحقل |
| `borderColor` | `Color` | `#c0c4ccff` | لون الحدود |
| `errorColor` | `Color` | `#d03050ff` | لون حدود ووصف حالة الخطأ |
| `error` | `string` | — | غير فارغ يعني حالة خطأ: حدود بلون الخطأ + وصف خطأ أسفله |
| `onTransaction` | `(t: EditTransaction) => void` | — | معاودة معاملة التحرير الأساسية (Core) |
| `onSubmit` | `() => void` | — | إرسال عند Enter في السطر الواحد |
| `semanticLabel` | `string` | — | اسم إمكانية الوصول (الدور ثابت دائمًا `textbox`) |

يضيف `TextArea` إلى ذلك خاصية `rows` (الافتراضي `3`)، تُستخدم لحساب الارتفاع الافتراضي.

## Pressable وButton

لا يقدم `Pressable` نوع عقدة Scene جديدًا: فهو مجرد `View` بدلالة `button`، يكتسب التركيز تلقائيًا عند الضغط،
ويربط click/tap الأصلي بـ `onPress`. تُحدد الأنماط بالكامل بواسطة `style` و`children`،
وعند `disabled` تُخفَّض الشفافية وتُزال الأحداث.

| Prop | النوع | الافتراضي | الوصف |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | المحتوى (في Button يكون `string \| number` وإلزاميًا) |
| `disabled` | `boolean` | `false` | حالة التعطيل |
| `onPress` | `() => void` | — | معاودة التفعيل |
| `className` | `string` | — | اسم الفئة (للربط بأوراق الأنماط) |
| `style` | `PingoStyle` | — | أنماط سطرية |
| `width` / `height` | `number` | — | الأبعاد |
| `semanticLabel` | `string` | يأخذ `Button` قيمة `children` | اسم إمكانية الوصول |

يقبل `Button` إضافةً إلى ذلك `color` و`fontSize` (يمرران إلى النص الداخلي).

## الحدود مع @dopejs/pingo-ui

تجيب الطبقتان عن سؤالين مختلفين:

- **widgets** —— صحة السلوك: معاملات التحرير، التركيز، الأدوار الدلالية، الزخرفة الدنيا. لا تتضمن أي رأي تصميمي،
  ويمكن تجاوز جميع الألوان وأحجام الخطوط.
- **@dopejs/pingo-ui** —— نظام التصميم: مكونات كاملة بذهنية shadcn (متغيرات، أحجام، سمات، أوراق أنماط)،
  تجمع داخليًا widgets و`@dopejs/pingo-editing` وخطافات runtime، دون أي تعديل على المحرك.

توصية الاختيار: إذا أردت نظام تصميم جاهزًا، استخدم [مكونات pingo-ui](/components) مباشرة؛ وإذا كانت لديك لغة تصميم خاصة
لكنك لا تريد التعامل مع تفاصيل معاملات التحرير، استخدم widgets كأساس؛ وللتخصيص الكامل (مثل HUD الألعاب)، استخدم
[العناصر الأساسية](/guide/elements) البدائية مباشرة.

## إمكانية الوصول

يأتي `TextField` / `TextArea` بدور `textbox` مدمج، ويكون وصف `error` بدور `alert`؛
و`Pressable` / `Button` بدور `button`، ويُكشف `disabled` عبر `semanticValue`.
تعتمد الأسماء كلها على `semanticLabel` — لا تحذفها عندما لا يوجد label مرئي. انظر [إمكانية الوصول](/guide/accessibility) للتفاصيل.
