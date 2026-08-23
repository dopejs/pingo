---
title: Sheet
description: لوحة تنزلق من أي حافة للشاشة، مناسبة للمحتوى الثانوي مثل التصفية والتفاصيل.
---

# Sheet

تنزلق Sheet بلوحة من حافة الحاوية، وتُستخدم غالبًا للمحتوى الثانوي الذي لا يقطع التدفق الرئيسي مثل شروط التصفية والأشرطة الجانبية للتفاصيل. يتم رسم المعاينة التالية في الوقت الفعلي بواسطة محرك pingo، وتتبع الموقع في التبديل بين الوضعين الفاتح والداكن.

:::preview sheet-basic
:::

## الاستخدام

```tsx
import { createElement } from "@dopejs/pingo";
import { Sheet } from "@dopejs/pingo-ui";

root.render(
  createElement(Sheet, {
    open,
    onOpenChange: (next) => setOpen(next),
    side: "right",
    children: createElement("text", { value: "محتوى اللوحة" }),
  }),
);
```

تملأ الطبقة العائمة الحاوية الأب الخاصة بها، لذا يُرجى تركيبها في موضع قريب من عقدة الجذر. `open` هو prop مُتحكَّم به؛ عند النقر على القناع أو الضغط على `Escape` يُطلب الإغلاق عبر `onOpenChange(false)`. يمكن إعادة استخدام كتل العنوان/الأزرار داخل اللوحة من `DialogHeader` و`DialogTitle` و`DialogDescription` و`DialogFooter`.

## أمثلة

### الاتجاه

يدعم `side` القيم `"left"` و`"right"` و`"top"` و`"bottom"`، والقيمة الافتراضية هي `"right"`. عند الحاجة إلى الحافتين العلوية والسفلية فقط، يُرجى استخدام [Drawer](/components/drawer) الأوضح دلاليًا.

## Props

يرث `DialogProps` (`open`، `onOpenChange`، `children`، `className`)، وبالإضافة إلى ذلك:

| Prop | النوع | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `side` | `"left" \| "right" \| "top" \| "bottom"` | `"right"` | الحافة التي تنزلق منها اللوحة |

## إمكانية الوصول

تتمتع اللوحة بدلالة complementary؛ عند الفتح ينتقل التركيز إلى داخل اللوحة، وبعد الإغلاق بـ `Escape` يعود التركيز إلى العنصر المُطلِق.
