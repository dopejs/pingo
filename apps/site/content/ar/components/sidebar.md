---
title: Sidebar
description: "شريط التنقل الجانبي للمنتج: المجموعات والعناصر وحالة التحديد، يُعرض على لوحة pingo."
---

# Sidebar

شريط التنقل الجانبي `Sidebar` هو عمود تنقل على مستوى التطبيق، يتكون من مجموعات (Section) وعناصر (Item)، مع دعم مدمج لحالة التحديد والتنقل بلوحة المفاتيح. تُعرض المعاينة أدناه مباشرة بواسطة محرك pingo — انقر على عنصر أو ركّز عليه ثم استخدم مفاتيح الأسهم للتبديل.

:::preview sidebar-basic
:::

## الاستخدام

```tsx
import { Sidebar, SidebarItem, SidebarSection } from "@dopejs/pingo-ui";

root.render(
  <Sidebar defaultValue="stats" onValueChange={(value) => navigate(value)}>
    <SidebarSection title="مساحة العمل">
      <SidebarItem value="home" label="الرئيسية" />
      <SidebarItem value="stats" label="الإحصائيات" />
    </SidebarSection>
    <SidebarSection title="النظام">
      <SidebarItem value="settings" label="الإعدادات" />
    </SidebarSection>
  </Sidebar>,
);
```

يدعم `Sidebar` كلاً من الوضع غير المُتحكَّم به (`defaultValue`) والوضع المُتحكَّم به (`value` + `onValueChange`). يُحدَّد عرض الشريط الجانبي بواسطة متغيرات السمة (القيمة الافتراضية 240px).

## Props

### Sidebar

| Prop            | النوع                     | القيمة الافتراضية | الوصف                                               |
| --------------- | ------------------------- | ----------------- | --------------------------------------------------- |
| `value`         | `string`                  | —                 | مُتحكَّم به: قيمة `value` للعنصر المحدد حاليًا      |
| `defaultValue`  | `string`                  | —                 | غير مُتحكَّم به: قيمة `value` للعنصر المحدد مبدئيًا |
| `onValueChange` | `(value: string) => void` | —                 | دالة تُستدعى عند تغيير التحديد                      |
| `children`      | `PingoNode`               | —                 | قائمة عناصر `SidebarSection` (مطلوبة)               |
| `className`     | `string`                  | —                 | تُضاف بعد اسم فئة المكوّن                           |

### SidebarSection

| Prop        | النوع       | القيمة الافتراضية | الوصف                                         |
| ----------- | ----------- | ----------------- | --------------------------------------------- |
| `title`     | `string`    | —                 | عنوان المجموعة؛ لا يُعرض سطر العنوان عند حذفه |
| `children`  | `PingoNode` | —                 | قائمة عناصر `SidebarItem` (مطلوبة)            |
| `className` | `string`    | —                 | تُضاف بعد اسم فئة المكوّن                     |

### SidebarItem

| Prop        | النوع       | القيمة الافتراضية | الوصف                                                |
| ----------- | ----------- | ----------------- | ---------------------------------------------------- |
| `value`     | `string`    | —                 | المعرّف الفريد للعنصر (مطلوب)                        |
| `label`     | `string`    | —                 | نص العنصر، ويُستخدم أيضًا كاسم قابلية الوصول (مطلوب) |
| `icon`      | `PingoNode` | —                 | خانة أمامية للأيقونة                                 |
| `className` | `string`    | —                 | تُضاف بعد اسم فئة المكوّن                            |

## إمكانية الوصول

يتمتع الشريط الجانبي بدلالات navigation؛ وتتمتع العناصر بدلالات link، وتستخدم `label` كاسم قابلية الوصول وتعرض حالة selected/unselected. تتحرك مفاتيح الأسهم لأعلى ولأسفل وزرا Home/End بين العناصر، ويتحرك التحديد مع التركيز معًا.

لتخصيص عرض الشريط الجانبي والألوان، راجع [دليل الأنماط](/guide/styling).
