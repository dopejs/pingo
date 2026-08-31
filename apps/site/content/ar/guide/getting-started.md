# البدء السريع

## التثبيت

```sh
pnpm add @dopejs/pingo
```

تعتمد الأعمال على حزمة واحدة فقط هي `@dopejs/pingo`. تُعد الحزم مثل `@dopejs/pingo-host` و`@dopejs/pingo-jsx` حزم تنفيذ داخلية، وليست جزءًا من العقد العام — سيرفض [ماسح الترحيل](/guide/migration) استيرادها مباشرة.

## تركيب أول لوحة رسم

```ts
import { createElement, createHostedCanvasRoot } from "@dopejs/pingo";

const canvas = document.querySelector<HTMLCanvasElement>("#app")!;
canvas.width = 800;
canvas.height = 600;

const root = await createHostedCanvasRoot(canvas);

root.render(
  createElement("container", {
    width: 800,
    height: 600,
    backgroundColor: "#ffffffff",
    padding: 24,
    children: createElement("text", {
      value: "Hello pingo",
      fontSize: 24,
      lineHeight: 32,
      color: "#1f2329ff",
    }),
  }),
);
```

يكتشف `createHostedCanvasRoot` تلقائيًا قدرات المتصفح، ويختار مسار النقل بين SharedArrayBuffer وpostMessage وCanvas2D في الخيط الرئيسي، فلا تحتاج إلى كتابة فروع للاحتياط. يعيد `root.mode` المسار المختار فعليًا.

## استخدام TSX

اضبط `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@dopejs/pingo"
  }
}
```

بعد ذلك يمكنك الكتابة:

```tsx
function OrderRow({ index }: { index: number }) {
  return (
    <container width={480} height={32} padding={[6, 12, 6, 12]}>
      <text value={`الطلب #${index}`} fontSize={13} lineHeight={20} />
    </container>
  );
}

root.render(<OrderRow index={1} />);
```

## عناصر المضيف

يمتلك المحرك خمسة عناصر مدمجة فقط، وهي تقابل عُقد Scene مباشرة، ولا توجد طبقات CSS أو محددات:

| العنصر         | الاستخدام                                            |
| -------------- | ---------------------------------------------------- |
| `container`    | تجميع عام، خلفية، حشوة، تحويلات                      |
| `text`         | تشغيل النص (التشكيل، الالتفاف، هندسة المؤشر من Core) |
| `scroll`       | حاوية قابلة للتمرير يملكها Core                      |
| `virtualList`  | قائمة افتراضية بتخطيط نافذة من Core                  |
| `editableText` | بدائية نص قابلة للتحرير                              |

`TextField` و`TextArea` هما ودجتان مركبتان فوق `editableText` (حدود، حالة خطأ)، ولا تقدمان مسار إدخال جديدًا.

## الحالة والتأثيرات الجانبية

```ts
import { signal, useEffect, useSignal, useState } from "@dopejs/pingo";

function Counter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCount((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return createElement("text", { value: `مرت ${count} ثانية` });
}
```

بدائيات الاستجابة المتاحة: `signal` و`computed` و`effect` و`batch` و`untracked`، بالإضافة إلى الخطافات `useState` و`useSignal` و`useMemo` و`useCallback` و`useRef` و`useEffect`.

::: warning لا توجد قراءة تخطيط متزامنة
قراءة التخطيط المتزامنة من Worker بأسلوب `useLayoutEffect` غير مدعومة — يحدث التخطيط على ساعة أخرى. استخدم العقود غير المتزامنة عند الحاجة إلى نتائج التخطيط، ولا تحاول قراءة الهندسة بشكل متزامن أثناء الرسم.
:::

## مراقبة حالة التشغيل

```ts
const root = await createHostedCanvasRoot(canvas, {
  onFrame: (report) => {
    console.log(report.commands, report.displayListBytes, report.core?.sceneNodes);
  },
  onHostError: (error) => report(error),
});
```

يقدم `onFrame` في كل إطار عدد الأوامر وعدد بايتات DisplayList وعدّادات المناطق المتسخة على جانب Core وحجم عمل التخطيط وpicture hash، وهي بيانات مباشرة لاستكشاف مشكلات الأداء. للمزيد انظر [التشخيص](/guide/diagnostics).

## جولة في القدرات

فوق العناصر الخمسة المدمجة، يقدم pingo ثلاث طبقات من القدرات الموجهة للمؤلفين:

- [المكونات الأساسية](/guide/elements): عناصر على مستوى المحرك مثل View/Text/Image وInput/TextArea وSVG/Path.
- [التنسيق](/guide/styling): مجموعة CSS فرعية مُدارة بالإصدارات — محددات الفئة وحالات التفاعل وحدود واضحة للتتالي والوراثة؛ عند الحاجة إلى المتغيرات وmixin استخدم [خط أنابيب SCSS / Less](/guide/scss-less) في وقت البناء.
- [مكتبة مكونات واجهة المستخدم](/components): `@dopejs/pingo-ui`، مكونات جاهزة متوافقة مع shadcn/ui، تُرسم جميعها على canvas.

## الخطوات التالية

- [نظرة عامة على البنية](/guide/architecture): كيف يتقاسم Shell وCore العمل
- [التمرير والافتراضية](/guide/scrolling)، [النص والتحرير](/guide/editing)
- [Playground](/playground): عرض توضيحي تفاعلي مباشر
