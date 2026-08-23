---
title: زر أيقونة
description: زر يحمل أيقونة فقط، يجب توفير اسم لإمكانية الوصول، ويُعرض على لوحة pingo.
---

# زر أيقونة

يُستخدم زر الأيقونة للعمليات المدمجة التي لا تحتوي على تسمية نصية. المعاينة أدناه تُعرض مباشرة بواسطة محرك pingo — يمكن النقر عليها وتركيزها ومتابعة تبديل السمة بين الفاتح والداكن.

:::preview icon-button-basic
:::

## الاستخدام

```tsx
import { createElement } from "@dopejs/pingo";
import { IconButton } from "@dopejs/pingo-ui";

root.render(
  createElement(IconButton, {
    icon: createElement("text", { value: "★" }),
    semanticLabel: "مفضلة",
    variant: "outline",
    onPress: () => toggleFavorite(),
  }),
);
```

`icon` هي خانة تمرير شفافة تقبل أي `PingoNode` — خط أيقونات أو SVG أو محارف نصية. ونظرًا لعدم وجود نص مرئي، فإن `semanticLabel` مطلوب.

## أمثلة

### الأنماط

`variant` متوافق تمامًا مع [Button](/components/button): `default` و`secondary` و`outline` و`ghost` و`destructive`.

### قيود معروفة

يدعم `size` القيم `default` و`sm` و`lg`، لكن السطح الحالي لا يتضمن قواعد مركّبة لنمط الأيقونة في حالتي `sm`/`lg`، لذا سيتجاوز حجم الأيقونة معدِّل الحجم، ولا يوجد أثر بصري حاليًا لـ `sm`/`lg`.

## Props

| Prop | النوع | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `icon` | `PingoNode` | — | خانة الأيقونة، تُمرَّر كما هي (مطلوب) |
| `semanticLabel` | `string` | — | اسم إمكانية الوصول (مطلوب) |
| `variant` | `"default" \| "secondary" \| "outline" \| "ghost" \| "destructive"` | `"default"` | النمط المرئي |
| `size` | `"default" \| "sm" \| "lg"` | `"default"` | الحجم (`sm`/`lg` غير فعّال حاليًا، انظر أعلاه) |
| `disabled` | `boolean` | `false` | حالة التعطيل |
| `onPress` | `() => void` | — | رد نداء التفعيل بالمؤشر/لوحة المفاتيح |
| `className` | `string` | — | تُضاف بعد اسم فئة المكوّن |

## إمكانية الوصول

لا يحتوي زر الأيقونة على نص مرئي، لذا يعتمد قارئ الشاشة على `semanticLabel` فقط، ولهذا فإن هذه الخاصية مطلوبة. يتمتع الزر بدلالات button ودعم التفعيل بلوحة المفاتيح.
