---
title: Collapsible
description: منطقة محتوى واحدة قابلة للطي والفتح، تُعرض على لوحة pingo.
---

# Collapsible

يُعد Collapsible العنصر الأساسي المفرد في Accordion: مشغّل واحد يتحكم في فتح أو طي كتلة محتوى، وهو مناسب للحالات التي تحتاج فيها إلى منطقة طي واحدة فقط. تُعرض المعاينة أدناه مباشرة بواسطة محرك pingo — انقر على المشغّل للتبديل.

:::preview collapsible-basic
:::

## الاستخدام

```tsx
import { createElement } from "@dopejs/pingo";
import { Collapsible } from "@dopejs/pingo-ui";

root.render(
  createElement(Collapsible, {
    trigger: "خيارات متقدمة",
    defaultOpen: true,
    children: createElement("text", { value: "محتوى المنطقة القابلة للطي." }),
  }),
);
```

يدعم كلاً من النمط غير المُتحكَّم فيه (`defaultOpen`) والنمط المُتحكَّم فيه (`open` + `onOpenChange`).

## أمثلة

### التعطيل

عند تمرير `disabled`، يتوقف المشغّل عن الاستجابة للمؤشر ولوحة المفاتيح، وتُطبَّق أنماط التعطيل.

:::preview collapsible-disabled
:::

## Props

| Prop           | النوع                     | القيمة الافتراضية | الوصف                                   |
| -------------- | ------------------------- | ----------------- | --------------------------------------- |
| `trigger`      | `string`                  | —                 | نص المشغّل (مطلوب)                      |
| `children`     | `PingoNode`               | —                 | المحتوى الذي يظهر بعد الفتح (مطلوب)     |
| `open`         | `boolean`                 | —                 | مُتحكَّم فيه: حالة الفتح الحالية        |
| `defaultOpen`  | `boolean`                 | `false`           | غير مُتحكَّم فيه: حالة الفتح الابتدائية |
| `onOpenChange` | `(open: boolean) => void` | —                 | رد النداء عند تغيّر حالة الفتح          |
| `disabled`     | `boolean`                 | `false`           | تعطيل المشغّل                           |
| `className`    | `string`                  | —                 | يُضاف بعد اسم فئة المكوّن               |

## إمكانية الوصول

يتمتع المشغّل بدلالات العنصر button، ويكشف لحالات التقنيات المساعدة expanded/collapsed؛ ويعمل مفتاحا Enter والمسافة على تبديل الفتح. عند طي المحتوى يُخفى باستخدام `display: none` بدلاً من إلغاء تحميله، مما يحافظ على موضع التمرير الداخلي وحالة التحرير.
