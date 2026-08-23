---
title: قائمة التنقل
description: شريط قوائم بنمط تنقل الموقع، سلوكه متطابق مع Menubar ودلالته للتنقل.
---

# قائمة التنقل

قائمة التنقل هي النسخة ذات الدلالة التنقلية من [Menubar](/components/menubar): نفس صف المشغلات ولوحة التوسيع، لكنها تعرض دلالات التنقل خارجياً، وهي مناسبة للتنقل الرئيسي للموقع. يتم عرض المعاينة التالية لحظياً بواسطة محرك pingo، وتتبع سمة الموقع في التبديل بين الفاتح والداكن.

:::preview navigation-menu-basic
:::

## الاستخدام

```tsx
import { createElement } from "@dopejs/pingo";
import { MenubarMenu, NavigationMenu } from "@dopejs/pingo-ui";

root.render(
  createElement(NavigationMenu, {
    onValueChange: (value) => {},
    children: [
      createElement(MenubarMenu, {
        value: "products",
        label: "المنتجات",
        children: createElement("text", { value: "محرك العرض" }),
      }),
      createElement(MenubarMenu, {
        value: "docs",
        label: "المستندات",
        children: createElement("text", { value: "البدء السريع" }),
      }),
    ],
  }),
);
```

تعيد العناصر استخدام `MenubarMenu`. الفتح والإغلاق غير مضبوطين افتراضياً، ويمرير `value` يحوله إلى الوضع المضبوط. سلوك التفاعل (التنقل بلوحة المفاتيح، مشاركة موضع الفتح) مطابق تماماً لـ Menubar.

## Props

يقبل `NavigationMenu` جميع props الخاصة بـ `MenubarProps` باستثناء `navigation`:

| Prop            | النوع                                  | القيمة الافتراضية | الوصف                                                    |
| --------------- | -------------------------------------- | ----------------- | -------------------------------------------------------- |
| `value`         | `string`                               | —                 | مضبوط: قيمة القائمة المفتوحة حالياً                      |
| `onValueChange` | `(value: string \| undefined) => void` | —                 | استدعاء تغيير القائمة المفتوحة (`undefined` عند الإغلاق) |
| `children`      | `PingoNode`                            | —                 | عدة `MenubarMenu` (مطلوب)                                |
| `className`     | `string`                               | —                 | اسم فئة إضافي                                            |

انظر props العناصر في [Menubar](/components/menubar#menubarmenu).

## إمكانية الوصول

تمتلك الحاوية دلالة navigation، وتمتلك التسميات دلالة menuitem وتعرض حالة expanded/collapsed؛ تنتقل مفاتيح الأسهم لليسار واليمين بين العناصر، ويغلق `Escape` ويركز على التسمية الحالية.
