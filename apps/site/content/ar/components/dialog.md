---
title: Dialog
description: مربع حوار نمطي، يقاطع التدفق للحصول على إدخال المستخدم أو تأكيده، ويُعرض على لوحة pingo.
---

# Dialog

يفتح مربع الحوار لوحة نمطية فوق المحتوى الحالي مع طبقة تعتيم. تُعرض المعاينة أدناه مباشرة بواسطة محرك pingo — النقر على طبقة التعتيم أو الضغط على `Escape` يستدعي `onOpenChange(false)`، ويتبع التبديل بين الوضعين الفاتح والداكن حسب سمة الموقع.

:::preview dialog-basic
:::

## الاستخدام

```tsx
import {
  Button,
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@dopejs/pingo-ui";

root.render(
  <Dialog open={open} onOpenChange={(next) => setOpen(next)}>
    <DialogHeader>
      <DialogTitle>تعديل الملف الشخصي</DialogTitle>
      <DialogDescription>ستتم المزامنة فورًا بعد التعديل.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button onPress={() => save()}>حفظ</Button>
    </DialogFooter>
  </Dialog>,
);
```

تملأ طبقة Dialog العائمة **الحاوية الأب الخاصة بها** (وليس إطار العرض)، لذا ثبّتها في موضع قريب من العقدة الجذرية. يُعد `open` خاصية مُتحكَّمًا بها: لا يحتفظ المكوّن بحالة الفتح/الإغلاق، وعند الإغلاق يُخطر جهة الاستدعاء عبر `onOpenChange(false)`.

## أمثلة

### الكتل المركّبة

تُعد `DialogHeader` / `DialogTitle` / `DialogDescription` / `DialogFooter` مكوّنات تخطيط وتنسيق نصي خالصة تُركَّب حسب الحاجة؛ يقبل `children` أي `PingoNode`، ويمكن وضع النماذج والقوائم داخل اللوحة.

## Props

### Dialog

| Prop           | النوع                     | القيمة الافتراضية | الوصف                            |
| -------------- | ------------------------- | ----------------- | -------------------------------- |
| `open`         | `boolean`                 | —                 | هل هو مفتوح (مطلوب، مُتحكَّم به) |
| `onOpenChange` | `(open: boolean) => void` | —                 | يُستدعى عند طلب الإغلاق/الفتح    |
| `children`     | `PingoNode`               | —                 | محتوى اللوحة (مطلوب)             |
| `className`    | `string`                  | —                 | يُضاف بعد اسم فئة الطبقة العائمة |

### DialogHeader / DialogFooter

| Prop        | النوع       | القيمة الافتراضية | الوصف                |
| ----------- | ----------- | ----------------- | -------------------- |
| `children`  | `PingoNode` | —                 | محتوى الكتلة (مطلوب) |
| `className` | `string`    | —                 | فئة إضافية           |

### DialogTitle / DialogDescription

| Prop        | النوع    | القيمة الافتراضية | الوصف                 |
| ----------- | -------- | ----------------- | --------------------- |
| `children`  | `string` | —                 | المحتوى النصي (مطلوب) |
| `className` | `string` | —                 | فئة إضافية            |

## إمكانية الوصول

تتمتع اللوحة بدلالات dialog؛ عند الفتح ينتقل التركيز إلى داخل اللوحة، وبعد الإغلاق عبر `Escape` يعود التركيز إلى العنصر المُطلق. تُسجَّل العناصر التفاعلية داخل اللوحة في دورة Tab. استخدم `DialogTitle` للعنوان (دلالات heading).
