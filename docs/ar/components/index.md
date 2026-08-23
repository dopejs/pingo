---
title: المكوّنات
description: مكتبة مكوّنات pingo لواجهة المستخدم بذهنية shadcn، تُعرَض جميعها لحظياً على لوحة الرسم.
---

# المكوّنات

`@dopejs/pingo-ui` هي مكتبة مكوّنات متوافقة مع shadcn/ui: تبقى الواجهة البرمجية ودلالات المظهر متطابقة، بينما يكون هدف العرض هو محرّك لوحة الرسم في pingo بدلاً من DOM. تتضمن صفحة كل مكوّن أدناه معاينة **بعرض لحظي** — فالمعاينة نفسها لوحة رسم مرسومة بالمحرّك، تفاعلية وتتبع تبديل المظهر.

## الاستخدام

```ts
import { createHostedCanvasRoot } from "@dopejs/pingo";
import { Button, createPingoUiStyleSheet } from "@dopejs/pingo-ui";

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [createPingoUiStyleSheet()],
});
root.render(createElement(Button, { children: "حفظ" }));
```

يجب تسجيل أوراق الأنماط المخصصة للمستخدم **بعد** ورقة أنماط pingo-ui، إذ تتجاوز القواعد ذات الأولوية المتساوية بعضها وفق ترتيب التسجيل. للاطلاع على تخصيص المظهر والعلامة التجارية راجع [دليل التنسيق](/guide/styling) و[SCSS و Less](/guide/scss-less).

اختر مكوّناً من الفهرس على اليسار للبدء.
