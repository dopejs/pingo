---
title: مجموعة Toggle
description: مجموعة من أزرار التبديل ثنائية الحالة، اختيار فردي أو متعدد، تدعم التنقل بمفاتيح الأسهم، وتُعرض على لوحة pingo.
---

# Toggle Group

مجموعة أزرار التبديل تجمع عدة [Toggle](/components/toggle) في مجموعة اختيار فردي أو متعدد. تُعرض المعاينة أدناه مباشرة بواسطة محرك pingo — يمكنك النقر للتبديل، والتنقل بين العناصر بمفاتيح الأسهم، والتكيف مع الوضع الفاتح والداكن لموضوع الموقع.

:::preview toggle-group-basic
:::

## الاستخدام

```tsx
import { createElement } from "@dopejs/pingo";
import { ToggleGroup, ToggleGroupItem } from "@dopejs/pingo-ui";

root.render(
  createElement(ToggleGroup, {
    type: "single",
    defaultValue: ["center"],
    onValueChange: (value) => console.log(value),
    children: [
      createElement(ToggleGroupItem, { value: "left", children: "محاذاة لليسار" }),
      createElement(ToggleGroupItem, { value: "center", children: "توسيط" }),
      createElement(ToggleGroupItem, { value: "right", children: "محاذاة لليمين" }),
    ],
  }),
);
```

ينشر `ToggleGroup` مجموعة العناصر المحددة إلى `ToggleGroupItem` عبر context، ويجب تركيب كليهما كمكوّنين باستخدام `createElement`. عند ضبط `type: "single"` يلغي الاختيار الجديد الاختيار السابق؛ أما `"multiple"` فيُضيف العناصر واحدًا تلو الآخر.

## أمثلة

### اختيار متعدد

يتيح `type="multiple"` الضغط على عدة عناصر في الوقت نفسه، مثل شريط أدوات تنسيق النص.

:::preview toggle-group-multiple
:::

## Props

### ToggleGroup

| Prop            | النوع                                | القيمة الافتراضية | الوصف                                                                                 |
| --------------- | ------------------------------------ | ----------------- | ------------------------------------------------------------------------------------- |
| `type`          | `"single" \| "multiple"`             | `"single"`        | الاختيار الفردي يلغي الاختيار السابق؛ الاختيار المتعدد يُضيف العناصر واحدًا تلو الآخر |
| `value`         | `readonly string[]`                  | —                 | مجموعة القيم المحددة المُتحكم بها                                                     |
| `defaultValue`  | `readonly string[]`                  | `[]`              | مجموعة التحديد الأولية غير المُتحكم بها                                               |
| `onValueChange` | `(value: readonly string[]) => void` | —                 | استدعاء عند تغير مجموعة التحديد                                                       |
| `children`      | `PingoNode`                          | —                 | قائمة `ToggleGroupItem` (مطلوبة)                                                      |
| `className`     | `string`                             | —                 | يُضاف بعد اسم فئة المكوّن                                                             |

### ToggleGroupItem

| Prop        | النوع     | القيمة الافتراضية | الوصف                     |
| ----------- | --------- | ----------------- | ------------------------- |
| `value`     | `string`  | —                 | قيمة العنصر (مطلوبة)      |
| `children`  | `string`  | —                 | نص العنصر (مطلوب)         |
| `disabled`  | `boolean` | `false`           | تعطيل عنصر واحد           |
| `className` | `string`  | —                 | يُضاف بعد اسم فئة المكوّن |

## إمكانية الوصول

يحمل حاوي المجموعة دلالة `group`، وترث العناصر دلالة button من Toggle مع قيمتي الدلالة `on` / `off`. تتركز معالجة لوحة المفاتيح على المجموعة: ينقل `←`/`→` التركيز إلى العنصر المجاور، ويبدّل `Enter`/`مسافة` العنصر الحالي — ولا تؤثر إضافة العناصر أو إزالتها على هذا التنقل.
