---
title: قائمة منسدلة
description: قائمة إجراءات تتوسع عند النقر على عنصر التشغيل، مع دعم التنقل بلوحة المفاتيح.
---

# قائمة منسدلة

توسّع القائمة المنسدلة مجموعة من عناصر الإجراءات أسفل عنصر التشغيل. تُعرض المعاينة أدناه مباشرةً بواسطة محرك pingo — انقر على عنصر التشغيل للفتح والإغلاق، وتتبع سمة الموقع للتبديل بين الوضعين الفاتح والداكن.

:::preview dropdown-menu-basic
:::

## الاستخدام

```tsx
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@dopejs/pingo-ui";

root.render(
  <DropdownMenu onValueChange={(value) => run(value)}>
    <DropdownMenuTrigger>
      <Button onPress={() => {}}>打开菜单</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem value="profile">个人资料</DropdownMenuItem>
      <DropdownMenuItem value="settings">设置</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>,
);
```

يقرأ كل من Trigger وContent حالة المكوّن الجذر عبر السياق، ويجب أن يكونا عقدتين فرعيتين داخل نفس `DropdownMenu`. بعد اختيار عنصر، يُستدعى `onValueChange` وتُغلق القائمة تلقائيًا. يكون الفتح والإغلاق غير مضبوطين افتراضيًا (`defaultOpen`)، ولا يوفّر المكوّن خاصية `open` مضبوطة — إذا كنت بحاجة إلى قائمة اختيار مضبوطة بالكامل، استخدم Select (يتشارك الاثنان نفس التنفيذ).

## الخصائص

### DropdownMenu

| الخاصية         | النوع                     | القيمة الافتراضية | الوصف                                        |
| --------------- | ------------------------- | ----------------- | -------------------------------------------- |
| `value`         | `string`                  | —                 | القيمة المحددة حاليًا (تُبرز العنصر المقابل) |
| `defaultOpen`   | `boolean`                 | `false`           | حالة الفتح أو الإغلاق الأولية                |
| `onValueChange` | `(value: string) => void` | —                 | دالة تُستدعى عند اختيار عنصر من القائمة      |
| `onOpenChange`  | `(open: boolean) => void` | —                 | دالة تُستدعى عند تغيّر حالة الفتح أو الإغلاق |
| `children`      | `PingoNode`               | —                 | عنصرا Trigger وContent (مطلوب)               |
| `className`     | `string`                  | —                 | يُضاف بعد اسم فئة حاوية الارتساء             |

### DropdownMenuTrigger

| الخاصية       | النوع       | القيمة الافتراضية | الوصف                                                    |
| ------------- | ----------- | ----------------- | -------------------------------------------------------- |
| `children`    | `PingoNode` | —                 | عنصر التشغيل؛ عند غيابه يُعرض النص الحالي أو النص البديل |
| `placeholder` | `string`    | —                 | النص البديل عند عدم وجود قيمة محددة                      |
| `className`   | `string`    | —                 | اسم فئة إضافي                                            |

### DropdownMenuContent

| الخاصية     | النوع       | القيمة الافتراضية | الوصف                 |
| ----------- | ----------- | ----------------- | --------------------- |
| `children`  | `PingoNode` | —                 | عناصر القائمة (مطلوب) |
| `className` | `string`    | —                 | اسم فئة إضافي         |

### DropdownMenuItem

| الخاصية     | النوع    | القيمة الافتراضية | الوصف                     |
| ----------- | -------- | ----------------- | ------------------------- |
| `value`     | `string` | —                 | قيمة عنصر القائمة (مطلوب) |
| `children`  | `string` | —                 | النص المعروض (مطلوب)      |
| `className` | `string` | —                 | اسم فئة إضافي             |

## إمكانية الوصول

تتمتع القائمة بدلالة menu، وعناصرها بدلالة menuitem؛ بعد الفتح، يمكن التنقل بالأسهم لأعلى ولأسفل، والاختيار بـ `Enter`/`Space`، والإغلاق بـ `Escape` مع إعادة التركيز إلى عنصر التشغيل.
