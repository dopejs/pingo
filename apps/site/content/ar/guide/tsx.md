---
title: TSX
description: كتابة مكوّنات pingo بـ TSX، والتعايش مع React داخل المستودع نفسه.
---

# كتابة pingo بـ TSX

## الإعداد

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@dopejs/pingo"
  }
}
```

يختار `jsx` زمن التشغيل التلقائي في TypeScript، ويوجّهه `jsxImportSource` إلى `jsx-runtime`
الخاص بـ pingo بدلًا من الخاص بـ React. والاسم `react-jsx` هو اسم وضع التحويل ولا علاقة له
بـ React.

## ما الذي يصلح وسمًا

```tsx
import { createContext, memo, Text, useState, View, type PingoNode } from "@dopejs/pingo";
import { Button } from "@dopejs/pingo-ui";

const Theme = createContext("light");

function Row({ label }: { readonly label: string }): PingoNode {
  const [count, setCount] = useState(0);
  return (
    <View width={240} padding={8}>
      <text value={`${label} ${count}`} />
      <Button onPress={() => setCount(count + 1)}>زيادة</Button>
    </View>
  );
}

root.render(
  <Theme.Provider value="dark">
    <Row label="عدد النقرات" />
  </Theme.Provider>,
);
```

الأشكال الخمسة كلّها صالحة:

| الشكل                        | مثال                                                  |
| ---------------------------- | ----------------------------------------------------- |
| العناصر المدمجة              | `<container>`، `<text>`، `<scroll>`، `<editableText>` |
| المكوّنات الأساسية           | `<View>`، `<Text>`، `<Image>`، `<Input>`              |
| مكوّناتك الدالّية            | `<Row label="…" />`                                   |
| المكوّنات المغلّفة بـ `memo` | جميع مكوّنات `@dopejs/pingo-ui`                       |
| مزوّدات السياق               | `<Theme.Provider value={…}>`                          |

::: warning المكوّن الذي يستخدم الخطافات يُركَّب ولا يُستدعى
يمرّ `Row({ label })` من فحص الأنواع لكنه يفشل بـ
`hooks may only run in a function component`؛ فالخطافات تحتاج نطاق المكوّن الذي ينشئه
المُوفِّق. اكتبها `<Row label="…" />`.
:::

يمكن أن يكون نوع الإرجاع `PingoNode`. هو يشمل `undefined`، لكن توافقه مع وسوم JSX يعلنه
`JSX.ElementType` في المحرّك، فلا حاجة إلى تغيير التوقيع.

## التعايش مع React

وجود ملفات TSX لـ React وأخرى لـ pingo في مستودع واحد أمر معتاد: الهيكل بـ React، والمناطق
الحسّاسة للأداء يرسمها pingo.

### الآلية هي الإعلان في رأس الملف

يعمل `jsxImportSource` **على مستوى الملف**. اكتب في أول سطر من ملف pingo:

```tsx
/** @jsxImportSource @dopejs/pingo */
```

يبقى `tsconfig.json` الخاص بالمشروع على إعداد React، ولا يستخدم زمن تشغيل pingo إلا الملفات
التي تحمل هذا السطر. ويعترف به كلٌّ من `tsc` و esbuild/Vite و babel.

**الفكرتان الأخريان لا تصمدان**، وهذا مقيس:

| الطريقة                                                      | النتيجة                                                                                                     |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| وضع `tsconfig.json` في المجلد بقيمة `jsxImportSource` مختلفة | يتجاهله `tsc` تمامًا بينما يطبّقه Vite، فتختلف نتيجة البناء عن نتيجة فحص الأنواع                            |
| الاستبعاد بالاسم عبر `exclude`                               | لا يؤثّر `exclude` إلا في اختيار الملفات الجذرية؛ وبمجرّد أن يستوردها ملف React تعود وتُترجم على أنها React |

ولكي يقود اسم الملف سلسلة الأدوات فعلًا يلزم composite project references: مشروع pingo يُصدر
`.d.ts` ومشروع React يقرأ التصريحات لا المصادر.

نسيان هذا السطر لا يكسر بصمت، بل يفشل عند الترجمة:

```
error TS2322: Type 'Element' is not assignable to type 'PingoNode'.
error TS2786: 'View' cannot be used as a JSX component.
```

### لاحقة الاسم اصطلاح

حين يجتمع النوعان في مجلد واحد، امنح ملفات pingo لاحقة مثل `scene.pingo.tsx`: تُميَّز فورًا في
قائمة الملفات، وتفيد الإعدادات القائمة على الأسماء مثل `overrides` في babel. هي اصطلاح للبشر
وللإعدادات، و**لا تُغني عن رأس الملف**. وإذا كان المجلد كلّه pingo فالمجلد نفسه هو الإشارة،
وتصبح اللاحقة ضجيجًا.

### الحدّ هو حدّ الملف

للملف الواحد نوع JSX واحد، لذا **لا يمكن كتابة وسوم pingo داخل مكوّن React**. ملف pingo يصدّر
المشهد، وملف React يستورده:

```tsx
/** @jsxImportSource @dopejs/pingo */
// scene.pingo.tsx
import { Text, View, type PingoNode } from "@dopejs/pingo";

export function scene(label: string): PingoNode {
  return (
    <View width={240} height={80} padding={12}>
      <Text value={label} />
    </View>
  );
}
```

### التركيب عبر `PingoContainer`

```tsx
// App.tsx —— وسوم هذا الملف تخصّ React
import { PingoContainer } from "@dopejs/pingo/react";

import { scene } from "./scene.pingo";

export function App() {
  return <PingoContainer scene={scene("Hello")} style={{ height: 320, width: 480 }} />;
}
```

يصل المشهد عبر الخاصية `scene` لا عبر children، لأن وسوم هذا الملف تخصّ React فلا يمكن كتابة
children من pingo فيه.

ينشئ `PingoContainer` عنصر canvas بنفسه بدل أن يدَع React يرسمه ثم يأخذ إليه مرجعًا. وهذا
**ضروري**: يحوّل الجذر الـ canvas إلى OffscreenCanvas، والتحويل نهائي، وReact StrictMode ينفّذ
التأثيرات مرّتين في بيئة التطوير — فينتقل canvas الذي يملكه React إلى جذر ثانٍ ويفشل:

```
this canvas already transferred control to an OffscreenCanvas and cannot host
a second root; create a new canvas element per root
```

أمّا الـ canvas الذي ينشئه المكوّن فيزول مع التركيب المهمَل، فلا تقع المشكلة. والحجم أيضًا لا
يحتاج عناية: الجذر يتتبّع صندوق الـ canvas الخاص به، ويكفي تحديد حجم الحاوية عبر CSS.

إن احتجت الجذر نفسه (التحكّم بالتمرير، ردود التشخيص) فاستخدم `onRoot`، ولفشل الإقلاع
`onStartupError`. أمّا أخطاء وقت التشغيل فتصل كما كانت إلى `options.onHostError`.

### الشجرتان لا تتشاركان الحالة

لا تصل حالة React ولا سياقه إلى شجرة مكوّنات pingo، والعكس كذلك؛ فهما مُوفِّقان مستقلّان.
والتواصل عبر الحدّ تدفّق بيانات عادي: React يحسب القيمة ويمرّرها بوصفها `scene`، و pingo يعيد
النتائج عبر ردود الأحداث.

## هذا المستودع نفسه هو المثال

`apps/site` تطبيق React، وفيه في الوقت نفسه 73 معاينة مكوّن مكتوبة بـ pingo TSX. والمجلد الذي
يجتمعان فيه هو
[`apps/site/src/interop`](https://github.com/dopejs/pingo/tree/main/apps/site/src/interop)،
واختباره يعمل تحت `StrictMode`.
