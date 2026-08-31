---
title: Accordion
description: أكورديون رأسي يوسّع عنصرًا واحدًا في كل مرة، يُعرض على لوحة pingo.
---

# Accordion

ينظّم الأكورديون المحتوى المرتبط في مجموعات رأسية قابلة للتوسيع والطي، بحيث يُوسَّع عنصر واحد فقط في كل مرة. تُعرض المعاينة أدناه مباشرةً بواسطة محرك pingo — يمكنك النقر على العناوين للتبديل، أو استخدام مفاتيح الأسهم لتحريك التركيز وEnter/المسافة للتوسيع.

:::preview accordion-basic
:::

## الاستخدام

```tsx
import { Accordion, AccordionItem } from "@dopejs/pingo-ui";

root.render(
  <Accordion defaultOpenValue="intro">
    <AccordionItem value="intro" title="ما هو pingo-ui؟">
      <text value="مكتبة مكوّنات تُعرض على لوحة pingo." />
    </AccordionItem>
    <AccordionItem value="theme" title="هل يدعم الوضع الداكن؟">
      <text value="نعم، يتبع السمة ويتبدل تلقائيًا." />
    </AccordionItem>
  </Accordion>,
);
```

يدعم `Accordion` كلا النمطين: غير المُتحكَّم به (`defaultOpenValue`) والمُتحكَّم به (`openValue` + `onValueChange`).

## Props

### Accordion

| Prop               | النوع                                  | القيمة الافتراضية | الوصف                                                           |
| ------------------ | -------------------------------------- | ----------------- | --------------------------------------------------------------- |
| `openValue`        | `string`                               | —                 | مُتحكَّم به: قيمة `value` للعنصر الموسّع حاليًا                 |
| `defaultOpenValue` | `string`                               | —                 | غير مُتحكَّم به: قيمة `value` للعنصر الموسّع مبدئيًا            |
| `onValueChange`    | `(value: string \| undefined) => void` | —                 | استدعاء عند تغيّر العنصر الموسّع؛ يكون `undefined` عند طيّ الكل |
| `children`         | `PingoNode`                            | —                 | قائمة `AccordionItem` (مطلوبة)                                  |
| `className`        | `string`                               | —                 | يُضاف بعد اسم فئة المكوّن                                       |

### AccordionItem

| Prop        | النوع       | القيمة الافتراضية | الوصف                              |
| ----------- | ----------- | ----------------- | ---------------------------------- |
| `value`     | `string`    | —                 | المعرّف الفريد للعنصر (مطلوب)      |
| `title`     | `string`    | —                 | عنوان المُشغِّل (مطلوب)            |
| `children`  | `PingoNode` | —                 | المحتوى الظاهر بعد التوسيع (مطلوب) |
| `className` | `string`    | —                 | يُضاف بعد اسم فئة المكوّن          |

## إمكانية الوصول

تنقل مفاتيح الأسهم (أعلى/أسفل) التركيز بين العناوين دون تغيير حالة التوسيع، وينقل Home/End إلى الأول/الأخير؛ ويبدّل Enter أو المسافة التوسيع — بما يتوافق مع متطلبات WAI-ARIA لفصل التركيز عن التحديد. تُخفى منطقة المحتوى عند الطي باستخدام `display: none` بدلًا من إزالتها، فتبقى حالة التوسيع محفوظة.
