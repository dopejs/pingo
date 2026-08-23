---
title: البطاقة
description: "حاوية بطاقة تركيبية: الترويسة والعنوان والوصف والمحتوى والتذييل، تُرسم على لوحة pingo."
---

# البطاقة

تجمع البطاقة المحتوى المرتبط في حاوية ذات حدود وظل، وتتكوّن من ست فتحات قابلة للتركيب. المعاينة أدناه تُرسم في الوقت الفعلي بواسطة محرك pingo، وتتبدّل بين الوضعين الفاتح والداكن مع سمة الموقع.

:::preview card-basic
:::

## الاستخدام

```tsx
import { createElement } from "@dopejs/pingo";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@dopejs/pingo-ui";

root.render(
  createElement(Card, {
    children: [
      createElement(CardHeader, {
        children: [
          createElement(CardTitle, { children: "إعدادات الحساب" }),
          createElement(CardDescription, { children: "إدارة تفضيلات حسابك والإشعارات." }),
        ],
      }),
      createElement(CardContent, {
        children: createElement("text", { value: "محتوى نص البطاقة." }),
      }),
      createElement(CardFooter, {
        children: createElement(Button, { children: "حفظ", onPress: () => {} }),
      }),
    ],
  }),
);
```

جميع الفتحات اختيارية، ويمكن تركيب ما تحتاجه فقط؛ يُمرَّر محتوى الفتحة كما هو دون أي تغليف.

## الخصائص

`Card` و`CardHeader` و`CardContent` و`CardFooter` تقبل خصائص من نوع الحاوية:

| الخاصية     | النوع       | القيمة الافتراضية | الوصف                     |
| ----------- | ----------- | ----------------- | ------------------------- |
| `children`  | `PingoNode` | —                 | محتوى الفتحة (مطلوب)      |
| `className` | `string`    | —                 | يُضاف بعد اسم فئة المكوّن |

`CardTitle` و`CardDescription` تقبلان خصائص من نوع النص:

| الخاصية     | النوع    | القيمة الافتراضية | الوصف                     |
| ----------- | -------- | ----------------- | ------------------------- |
| `children`  | `string` | —                 | المحتوى النصي (مطلوب)     |
| `className` | `string` | —                 | يُضاف بعد اسم فئة المكوّن |

## إمكانية الوصول

البطاقة حاوية بصرية بحتة ولا تضيف دلالات إضافية؛ الاسم المقروء للبطاقة وبنيتها توفرهما المكوّنات الموضوعة داخلها مثل العناوين والأزرار. يرث لون العنوان والنص اللون الأمامي للبطاقة، ويحافظان على التباين في الوضعين الفاتح والداكن.
