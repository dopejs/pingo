---
title: Progress
description: شريط تقدم يعرض نسبة اكتمال المهمة، يُعرض على لوحة pingo.
---

# Progress

يعرض Progress تقدمًا محددًا عبر مسار معبأ، كما في التنزيل أو الرفع أو المهام متعددة الخطوات. المعاينة أدناه تُعرض لحظيًا بواسطة محرك pingo وتتبع المظهر الفاتح/الداكن للموقع.

:::preview progress-basic
:::

## الاستخدام

```tsx
import { createElement } from "@dopejs/pingo";
import { Progress } from "@dopejs/pingo-ui";

root.render(createElement(Progress, { value: 60 }));
```

يرث عرض المسار الحاوية الأصل، لذا ضع Progress داخل حاوية بعرض ثابت للتحكم في طول الشريط:

```tsx
createElement("container", {
  width: 320,
  children: createElement(Progress, { value: 60 }),
});
```

## أمثلة

### قيمة قصوى مخصصة

القيمة الافتراضية لـ `max` هي 100. عند تمريرها تُحسب نسبة التعبئة وفق `value / max`، وتُقيَّد دائمًا بين 0 و100:

```tsx
createElement(Progress, { value: 3, max: 10 }); // 30%
```

## Props

| Prop | النوع | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `value` | `number` | — | التقدم الحالي (مطلوب)، يُقيَّد عند تجاوز الحدود |
| `max` | `number` | `100` | القيمة القصوى، تُعامل القيم الأقل من 1 على أنها 1 |
| `className` | `string` | — | يُضاف بعد اسم فئة المكوّن |

## إمكانية الوصول

Progress عنصر بصري بحت ولا يحمل دورًا دلاليًا. إذا كان التقدم حاسمًا لإكمال المهمة، فأرفق بجانبه نصًا يوضح النسبة الحالية أو اسم المرحلة.
