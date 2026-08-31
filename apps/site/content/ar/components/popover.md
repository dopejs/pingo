---
title: Popover
description: لوحة عائمة مثبتة بجوار عنصر التحفيز، تُستخدم لتوفير معلومات تكميلية وعمليات خفيفة.
---

# Popover

يفتح Popover لوحة عائمة بجوار عنصر التحفيز، وتبقى اللوحة مثبتة عند تمرير الصفحة. تُعرض المعاينة أدناه مباشرةً بواسطة محرك pingo — انقر على عنصر التحفيز للفتح والإغلاق، وتتبع الوضع الفاتح/الداكن لسمة الموقع.

:::preview popover-basic
:::

## الاستخدام

```tsx
import { Button, Popover, PopoverContent, PopoverTrigger } from "@dopejs/pingo-ui";

root.render(
  <Popover defaultOpen={false} onOpenChange={(open) => {}}>
    <PopoverTrigger>
      <Button onPress={() => {}}>打开浮层</Button>
    </PopoverTrigger>
    <PopoverContent>
      <text value="任意内容" />
    </PopoverContent>
  </Popover>,
);
```

يقرأ `PopoverTrigger` و `PopoverContent` حالة المكوّن الجذر عبر السياق (context)، ويجب أن يكونا عقدتين فرعيتين لنفس `Popover`. الوضع الافتراضي غير مضبوط (`defaultOpen`)، وعند تمرير `open` يتحول إلى وضع مضبوط. تُثبت اللوحة افتراضيًا أسفل عنصر التحفيز؛ وبعد تفعيل إعادة قراءة التخطيط، تنقلب تلقائيًا إلى الجانب الآخر عند عدم توفر مساحة كافية.

## أمثلة

### محتوى مخصص

يقبل `children` الخاص بـ `PopoverContent` أي `PingoNode`، ويمكن وضع نماذج أو قوائم أو محتوى تنسيقي.

:::preview popover-rich
:::

## Props

### Popover

| Prop           | النوع                     | القيمة الافتراضية | الوصف                                   |
| -------------- | ------------------------- | ----------------- | --------------------------------------- |
| `open`         | `boolean`                 | —                 | حالة الفتح/الإغلاق المضبوطة             |
| `defaultOpen`  | `boolean`                 | `false`           | حالة الفتح/الإغلاق الأولية غير المضبوطة |
| `onOpenChange` | `(open: boolean) => void` | —                 | رد نداء عند تغير الفتح/الإغلاق          |
| `children`     | `PingoNode`               | —                 | Trigger و Content (مطلوب)               |
| `className`    | `string`                  | —                 | يُضاف بعد اسم فئة حاوية الارتساء        |

### PopoverTrigger

| Prop        | النوع       | القيمة الافتراضية | الوصف                |
| ----------- | ----------- | ----------------- | -------------------- |
| `children`  | `PingoNode` | —                 | عنصر التحفيز (مطلوب) |
| `className` | `string`    | —                 | اسم فئة إضافي        |

### PopoverContent

| Prop        | النوع       | القيمة الافتراضية | الوصف                |
| ----------- | ----------- | ----------------- | -------------------- |
| `children`  | `PingoNode` | —                 | محتوى اللوحة (مطلوب) |
| `className` | `string`    | —                 | اسم فئة إضافي        |

## إمكانية الوصول

يمتلك عنصر التحفيز دلالات زر ويعرض حالة موسع/مطوي (expanded/collapsed)؛ ويغلق مفتاح `Escape` اللوحة ويعيد التركيز إلى عنصر التحفيز.
