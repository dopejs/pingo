---
title: التقويم
description: تقويم شهري بنمط shadcn، بشبكة ثابتة من ستة صفوف، وتُمثَّل التواريخ بأجزاء السنة والشهر واليوم لتجنّب انزياح المناطق الزمنية.
---

# التقويم

تقويم شهري بنمط shadcn. يُمثَّل التاريخ بثلاثة أجزاء `{ year, month, day }` (يبدأ `month` من 1)، فلا ينزاح التاريخ في أي منطقة زمنية؛ والشبكة ثابتة بستة صفوف، فلا يتغير ارتفاع المكوّن عند التنقل بين الأشهر. تُعرض المعاينة أدناه مباشرةً عبر محرك pingo — يمكنك النقر لاختيار تاريخ، واستخدام الأسهم للتنقل بين الأشهر، والتبديل بين الوضعين الفاتح والداكن تبعًا لسمة الموقع.

:::preview calendar-basic
:::

## الاستخدام

حالة التحديد **مُتحكَّم بها**: النقر على تاريخ يُطلق `onSelect`، وعليك كتابة `value` من جديد. أما الشهر فيمكن إدارته داخليًا في المكوّن (`defaultMonth`)، أو التحكم به كليًا عبر `month` و`onMonthChange`.

```tsx
import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
import { Calendar, type CalendarDate } from "@dopejs/pingo-ui";

function DateField(): PingoNode {
  const selected = useSignal<CalendarDate>({ year: 2026, month: 8, day: 22 });
  return createElement(Calendar, {
    defaultMonth: { year: 2026, month: 8, day: 1 },
    value: selected.get(),
    onSelect: (date) => selected.set(date),
  });
}
```

## أمثلة

### تعطيل التواريخ

يُحدد `isDisabled` لكل تاريخ ما إذا كان قابلًا للتحديد؛ والتواريخ المعطّلة لا تستجيب للمؤشر ولا للوحة المفاتيح. المثال التالي يعطّل عطلات نهاية الأسبوع:

:::preview calendar-disabled
:::

## الخصائص

### CalendarProps

| Prop | النوع | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `value` | `CalendarDate` | — | التاريخ المحدد (مُتحكَّم به) |
| `month` | `CalendarDate` | — | الشهر المعروض (مُتحكَّم به)؛ عند حذفه تُدار الحالة داخليًا |
| `defaultMonth` | `CalendarDate` | `value` ?? يناير 2026 | الشهر الابتدائي في الوضع غير المُتحكَّم به |
| `onSelect` | `(date: CalendarDate) => void` | — | نداء عند النقر على تاريخ |
| `onMonthChange` | `(month: CalendarDate) => void` | — | نداء عند التنقل بين الأشهر (يُطلق في الوضعين المُتحكَّم به وغير المُتحكَّم به) |
| `weekdayLabels` | `readonly string[]` | `["日","一","二","三","四","五","六"]` | ترويسة أيام الأسبوع، بدءًا من الأحد |
| `monthLabel` | `(month: CalendarDate) => string` | صيغة `"أغسطس 2026"` | عنوان شهر مخصص |
| `isDisabled` | `(date: CalendarDate) => boolean` | — | تعطيل تواريخ معينة |
| `className` | `string` | — | يُضاف بعد اسم فئة المكوّن |

### CalendarDate

| الحقل | النوع | الوصف |
| --- | --- | --- |
| `year` | `number` | السنة |
| `month` | `number` | الشهر، 1–12 |
| `day` | `number` | اليوم، 1–31 |

تُصدَّر أيضًا داخل الحزمة دوال نقية مثل `daysInMonth` و`monthGrid` و`shiftMonth` و`sameDate`، لتسهيل كتابة منطق تواريخ مخصص.

## إمكانية الوصول

يحمل التقويم ككل دلالة `group`؛ وأسهم التنقل بين الأشهر لها اسم وصول "previous month" / "next month"، وخلايا التاريخ لها دلالة button، والتاريخ المحدد يحمل القيمة الدلالية `selected`. على لوحة المفاتيح يمكن لـ `PageUp` / `PageDown` التنقل بين الأشهر من أي موضع في الشبكة، فلا يعلق مستخدمو لوحة المفاتيح في الشهر الحالي. للمزيد راجع [دليل إمكانية الوصول](/guide/accessibility).
