---
title: Command
description: لوحة أوامر قابلة للبحث والتصفية، تدعم الاختيار بلوحة المفاتيح والتأكيد بزر Enter.
---

# Command

Command هي لوحة أوامر مزودة بمربع بحث: الإدخال يصفي العناصر فورًا، ومفاتيح الأسهم تحرك المؤشر، وزر Enter يؤكد الاختيار. المعاينة أدناه تُعرض مباشرة بواسطة محرك pingo — اكتب في مربع البحث للتصفية، وتتغير مع تبديل الموقع بين الوضعين الفاتح والداكن.

:::preview command-basic
:::

## الاستخدام

```tsx
import { createElement } from "@dopejs/pingo";
import { Command } from "@dopejs/pingo-ui";

root.render(
  createElement(Command, {
    items: [
      { value: "open", label: "فتح ملف" },
      { value: "save", label: "حفظ ملف" },
    ],
    onSelect: (value) => run(value),
    onDismiss: () => closePalette(),
  }),
);
```

التصفية هي مطابقة جزئية للتسمية غير حساسة لحالة الأحرف — مطابقة غير مبهمة بشكل مقصود: استراتيجية الترتيب قرار منتج، والمكوّن لا يتخذها نيابة عن المستدعي. يستجيب `onDismiss` لمفتاح `Escape` عند عدم وجود مفتاح تنقّل مطابق، وهو مناسب لتغليف اللوحة داخل Dialog لتجربة «⌘K».

## Props

| Prop | النوع | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `items` | `readonly CommandItem[]` | — | عناصر الأوامر (مطلوب) |
| `onSelect` | `(value: string) => void` | — | استدعاء عند اختيار عنصر (نقر أو Enter) |
| `onDismiss` | `() => void` | — | استدعاء عند `Escape` |
| `placeholder` | `string` | `"بحث"` | الاسم المخصص لإمكانية الوصول لمربع البحث |
| `emptyLabel` | `string` | `"لا نتائج"` | نص التلميح عند خلو التصفية من النتائج |
| `className` | `string` | — | اسم فئة إضافي |

### CommandItem

| الحقل | النوع | الوصف |
| --- | --- | --- |
| `value` | `string` | قيمة العنصر (مطلوب) |
| `label` | `string` | نص العرض والمطابقة (مطلوب) |

## إمكانية الوصول

يتمتع الحاوي بدلالة search، والعناصر بدلالة option مع عرض حالة selected؛ تحرك مفاتيح الأسهم لأعلى ولأسفل المؤشر، ويؤكد `Enter` الاختيار، ويطلق `Escape` استدعاء `onDismiss`.
