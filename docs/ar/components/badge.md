---
title: Badge
description: شارة حالة صغيرة غير تفاعلية تُعرض على لوحة pingo.
---

# Badge

Badge هي شارة حالة غير تفاعلية تُستخدم لتوضيح الحالة أو التصنيف أو العدد، مثل «مدير» أو «Beta». المعاينة أدناه تُعرض في الوقت الفعلي بواسطة محرك pingo، وتتبع الموقع في التبديل بين الوضعين الفاتح والداكن.

:::preview badge-variants
:::

## الاستخدام

```tsx
import { createElement } from "@dopejs/pingo";
import { Badge } from "@dopejs/pingo-ui";

root.render(createElement(Badge, { children: "Beta" }));
```

## أمثلة

### الأنماط

تغطي أربعة أنماط الدلالات الشائعة: `default` (إبراز)، و`secondary` (تخفيف)، و`destructive` (خطأ/خطر)، و`outline` (حدود). تظهر في المعاينة بالترتيب.

```tsx
createElement(Badge, { children: "للقراءة فقط", variant: "secondary" });
```

### الدمج مع مكونات أخرى

تُستخدم Badge غالبًا كعنصر trailing في صفوف القوائم أو البطاقات، بالدمج مع `Avatar` و`ListRow`:

```tsx
createElement(ListRow, {
  title: "张三",
  leading: createElement(Avatar, { fallback: "张", size: 32 }),
  trailing: createElement(Badge, { children: "مدير" }),
  onPress: () => {},
});
```

## Props

| Prop | النوع | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `children` | `string` | — | نص الشارة (مطلوب) |
| `variant` | `"default" \| "secondary" \| "destructive" \| "outline"` | `"default"` | النمط البصري |
| `semanticLabel` | `string` | — | اسم إمكانية الوصول؛ عند الحذف تُستخدم الدلالة الافتراضية |
| `className` | `string` | — | يُضاف بعد اسم فئة المكوّن |

## إمكانية الوصول

لا تستجيب Badge للمؤشر أو لوحة المفاتيح، وهي عنصر عرض خالص. عندما لا يكفي النص لنقل المعنى (مثل شارة رقم مجردة)، استخدم `semanticLabel` لتقديم وصف كامل.
