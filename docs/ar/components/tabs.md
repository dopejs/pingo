---
title: Tabs
description: تتنقل علامات التبويب بين مجموعة من اللوحات من المستوى نفسه، وتُعرض على لوحة pingo.
---

# Tabs

تتنقل علامات التبويب بين عدة لوحات محتوى من المستوى نفسه داخل المساحة ذاتها. تُعرض المعاينة أدناه مباشرةً بواسطة محرك pingo — يمكنك النقر على علامة تبويب للتبديل، أو استخدام مفاتيح الأسهم يمينًا ويسارًا للتنقل بين العلامات.

:::preview tabs-basic
:::

## الاستخدام

```tsx
import { createElement } from "@dopejs/pingo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@dopejs/pingo-ui";

root.render(
  createElement(Tabs, {
    defaultValue: "account",
    children: [
      createElement(TabsList, {
        children: [
          createElement(TabsTrigger, { value: "account", children: "الحساب" }),
          createElement(TabsTrigger, { value: "password", children: "كلمة المرور" }),
        ],
      }),
      createElement(TabsContent, {
        value: "account",
        children: createElement("text", { value: "إدارة معلومات حسابك." }),
      }),
      createElement(TabsContent, {
        value: "password",
        children: createElement("text", { value: "تغيير كلمة مرور تسجيل الدخول." }),
      }),
    ],
  }),
);
```

يدعم `Tabs` كلا الأسلوبين: غير المُتحكَّم به (`defaultValue`) والمُتحكَّم به (`value` + `onValueChange`).

## Props

### Tabs

| Prop | النوع | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `value` | `string` | — | مُتحكَّم به: قيمة `value` لعلامة التبويب المحددة حاليًا |
| `defaultValue` | `string` | — | غير مُتحكَّم به: قيمة `value` لعلامة التبويب المحددة مبدئيًا |
| `onValueChange` | `(value: string) => void` | — | استدعاء عند تغيُّر التحديد |
| `children` | `PingoNode` | — | `TabsList` وعدد من `TabsContent` (مطلوب) |
| `className` | `string` | — | يُضاف بعد اسم فئة المكوِّن |

### TabsList

| Prop | النوع | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | قائمة من `TabsTrigger` (مطلوب) |
| `className` | `string` | — | يُضاف بعد اسم فئة المكوِّن |

### TabsTrigger

| Prop | النوع | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `value` | `string` | — | المعرّف المرتبط بعنصر `TabsContent` المقابل (مطلوب) |
| `children` | `string` | — | نص علامة التبويب (مطلوب) |
| `className` | `string` | — | يُضاف بعد اسم فئة المكوِّن |

### TabsContent

| Prop | النوع | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `value` | `string` | — | المعرّف المرتبط بعنصر `TabsTrigger` المقابل (مطلوب) |
| `children` | `PingoNode` | — | محتوى اللوحة (مطلوب) |
| `className` | `string` | — | يُضاف بعد اسم فئة المكوِّن |

## إمكانية الوصول

تتمتع قائمة العلامات بدلالات tablist، وتتمتع العلامات بدلالات tab وتكشف حالة التحديد للتقنيات المساعدة. تنتقل مفاتيح الأسهم يمينًا ويسارًا وزرا Home/End بين العلامات مع تحديدها في الوقت نفسه، ويتحرك التركيز مع الاختيار؛ وتُخفى اللوحات غير النشطة باستخدام `display: none` بدلًا من إلغاء تحميلها، فيبقى موضع التمرير وحالة التحرير داخل اللوحة محفوظين.
