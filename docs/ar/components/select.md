---
title: Select
description: قائمة منسدلة مركّبة تدعم التنقل بلوحة المفاتيح وتُعرض على لوحة pingo.
---

# Select

تتكوّن القائمة المنسدلة من `Select` و`SelectTrigger` و`SelectContent` و`SelectItem`. تُعرض المعاينة أدناه مباشرةً بواسطة محرك pingo — القائمة مفتوحة بالفعل، ويمكنك التنقل باستخدام مفاتيح الأسهم، والتأكيد بمفتاح Enter، كما تتبع تبديل السمة الفاتحة/الداكنة للموقع.

:::preview select-basic
:::

## الاستخدام

```tsx
import { createElement } from "@dopejs/pingo";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@dopejs/pingo-ui";

root.render(
  createElement(Select, {
    value: "pingo-ui",
    onValueChange: (value) => console.log(value),
    children: [
      createElement(SelectTrigger, { placeholder: "اختر حزمة" }),
      createElement(SelectContent, {
        children: [
          createElement(SelectItem, { value: "pingo", children: "@dopejs/pingo" }),
          createElement(SelectItem, { value: "pingo-ui", children: "@dopejs/pingo-ui" }),
        ],
      }),
    ],
  }),
);
```

تتعاون جميع الأجزاء عبر context، ويجب تركيبها جميعًا كمكوّنات باستخدام `createElement`. يعرض الزناد `value` المحدد حاليًا؛ وعند عدم وجود تحديد يعرض `placeholder`.

## أمثلة

### الفتح الافتراضي

`defaultOpen` يجعل القائمة مفتوحة في البداية (كما في المعاينة أعلاه)؛ و`onOpenChange` يستمع إلى الفتح والإغلاق.

## Props

### Select

| Prop | النوع | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `value` | `string` | — | القيمة المحددة، تُعرض على الزناد |
| `defaultOpen` | `boolean` | `false` | الفتح الأولي |
| `onValueChange` | `(value: string) => void` | — | رد نداء تغيّر التحديد (تُغلق تلقائيًا بعد التحديد) |
| `onOpenChange` | `(open: boolean) => void` | — | رد نداء الفتح والإغلاق |
| `children` | `PingoNode` | — | الزناد والمحتوى (مطلوب) |
| `className` | `string` | — | يُضاف بعد اسم فئة المكوّن |

### SelectTrigger

| Prop | النوع | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | محتوى زناد مخصص؛ عند غيابه يُعرض القيمة المحددة أو النص البديل |
| `placeholder` | `string` | — | النص البديل عند عدم وجود تحديد |
| `className` | `string` | — | يُضاف بعد اسم فئة المكوّن |

### SelectContent

| Prop | النوع | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | قائمة `SelectItem` (مطلوب) |
| `className` | `string` | — | يُضاف بعد اسم فئة المكوّن |

### SelectItem

| Prop | النوع | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `value` | `string` | — | قيمة الخيار (مطلوب) |
| `children` | `string` | — | نص الخيار (مطلوب) |
| `className` | `string` | — | يُضاف بعد اسم فئة المكوّن |

## إمكانية الوصول

يحمل الزناد دلالات button ويتنقل بين `expanded` / `collapsed`؛ ويحمل المحتوى دلالات menu. تحرّك مفاتيح الأسهم التمييز، ويؤكّد `Enter`/`مسافة` التحديد، ويغلق `Esc` القائمة؛ وبعد التحديد يعود التركيز إلى الزناد.
