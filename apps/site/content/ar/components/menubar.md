---
title: Menubar
description: شريط قوائم بأسلوب تطبيقات سطح المكتب، تتشارك عدة قوائم في موضع فتح واحد.
---

# Menubar

Menubar هو صف من القوائم يتشارك في موضع فتح واحد، على غرار شريط القوائم في تطبيقات سطح المكتب. المعاينة أدناه تُعرض مباشرة بواسطة محرك pingo — انقر على تبويبات مثل «ملف» و«تحرير» لفتح القائمة المقابلة وإغلاقها، مع التبديل بين الوضعين الفاتح والداكن تبعًا لسمة الموقع.

:::preview menubar-basic
:::

## الاستخدام

```tsx
import { createElement } from "@dopejs/pingo";
import { Menubar, MenubarMenu } from "@dopejs/pingo-ui";

root.render(
  createElement(Menubar, {
    onValueChange: (value) => {},
    children: [
      createElement(MenubarMenu, {
        value: "file",
        label: "ملف",
        children: createElement("text", { value: "جديد" }),
      }),
      createElement(MenubarMenu, {
        value: "edit",
        label: "تحرير",
        children: createElement("text", { value: "تراجع" }),
      }),
    ],
  }),
);
```

يقرأ `MenubarMenu` حالة شريط القوائم عبر context، ويجب أن يكون عقدة فرعية لـ `Menubar`؛ وتمثل `children` الخاصة به محتوى اللوحة المعروضة عند الفتح. الفتح والإغلاق غير مُتحكَّم بهما افتراضيًا، وبتمرير `value` يتحول الوضع إلى مُتحكَّم به (القيمة هي `value` القائمة المفتوحة حاليًا).

## أمثلة

### فتح مُتحكَّم به

مرّر `value` لتثبيت القائمة المفتوحة، وهو مفيد غالبًا للتوجيه الأولي أو مزامنة الحالة الخارجية.

:::preview menubar-open
:::

## Props

### Menubar

| Prop            | النوع                                  | القيمة الافتراضية | الوصف                                                                                    |
| --------------- | -------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------- |
| `value`         | `string`                               | —                 | مُتحكَّم به: قيمة القائمة المفتوحة حاليًا                                                |
| `onValueChange` | `(value: string \| undefined) => void` | —                 | استدعاء عند تغيير القائمة المفتوحة (`undefined` عند الإغلاق)                             |
| `children`      | `PingoNode`                            | —                 | عدد من `MenubarMenu` (مطلوب)                                                             |
| `className`     | `string`                               | —                 | اسم فئة إضافي                                                                            |
| `navigation`    | `boolean`                              | `false`           | استخدام دلالات التنقل (يُستخدم داخليًا في [NavigationMenu](/components/navigation-menu)) |

### MenubarMenu

| Prop        | النوع       | القيمة الافتراضية | الوصف                               |
| ----------- | ----------- | ----------------- | ----------------------------------- |
| `value`     | `string`    | —                 | معرف القائمة (مطلوب)                |
| `label`     | `string`    | —                 | التسمية المعروضة على الشريط (مطلوب) |
| `children`  | `PingoNode` | —                 | محتوى اللوحة عند الفتح (مطلوب)      |
| `className` | `string`    | —                 | اسم فئة إضافي                       |

## إمكانية الوصول

يتمتع شريط القوائم بدلالات menubar، وتتمتع التبويبات بدلالات menuitem وتعرض حالة expanded/collapsed؛ وتنقل مفاتيح الأسهم يمينًا ويسارًا بين القوائم، كما تتبدل عند فتح القائمة، ويغلقها `Escape` مع التركيز على التبويب الحالي.
