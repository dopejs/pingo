---
title: Drawer
description: لوحة درج تنزلق من الحافة العلوية أو السفلية، مناسبة للعمليات السفلية بأسلوب الجوال.
---

# Drawer

الدرج هو لوحة تنزلق من الحافة الأفقية — وهو مكافئ لـ [Sheet](/components/sheet) حيث `side` يأخذ فقط `"top" | "bottom"`. المعاينة أدناه تُعرض مباشرة بواسطة محرك pingo وتتبع تبديل السمة الفاتحة/الداكنة في الموقع.

:::preview drawer-basic
:::

## الاستخدام

```tsx
import { Drawer } from "@dopejs/pingo-ui";

root.render(
  <Drawer open={open} onOpenChange={(next) => setOpen(next)} side="bottom">
    <text value="محتوى الدرج" />
  </Drawer>,
);
```

تملأ الطبقة العائمة الحاوية الأم الخاصة بها، لذا يُرجى تثبيتها بالقرب من عقدة الجذر. `open` هو prop مُتحكم به؛ النقر على القناع أو الضغط على `Escape` سيطلب الإغلاق عبر `onOpenChange(false)`. يمكن إعادة استخدام كتل `DialogHeader` و`DialogTitle` و`DialogDescription` و`DialogFooter` لمنطقة العنوان/الأزرار داخل اللوحة.

## أمثلة

### الاتجاه

يدعم `side` القيمتين `"top"` و`"bottom"`، والقيمة الافتراضية هي `"bottom"`.

## Props

يرث `DialogProps` (`open`، `onOpenChange`، `children`، `className`)، بالإضافة إلى:

| Prop   | النوع               | القيمة الافتراضية | الوصف                        |
| ------ | ------------------- | ----------------- | ---------------------------- |
| `side` | `"top" \| "bottom"` | `"bottom"`        | الحافة التي ينزلق منها الدرج |

## إمكانية الوصول

تتمتع اللوحة بدلالة complementary؛ عند الفتح ينتقل التركيز إلى داخل اللوحة، وبعد الإغلاق عبر `Escape` يعود التركيز إلى العنصر المُطلق.
