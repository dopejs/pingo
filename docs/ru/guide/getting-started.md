# Быстрый старт

## Установка

```sh
pnpm add @dopejs/pingo
```

Бизнес-код зависит только от одного пакета `@dopejs/pingo`. `@dopejs/pingo-host`, `@dopejs/pingo-jsx` и другие — это пакеты внутренней реализации, которые не входят в публичный контракт — [сканер миграции](/migration) отклонит их прямой импорт.

## Монтирование первого холста

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

`createHostedCanvasRoot` автоматически определяет возможности браузера и выбирает путь передачи между SharedArrayBuffer, postMessage и Canvas2D в основном потоке — вам не нужно писать ветвления для запасных вариантов. `root.mode` возвращает фактически выбранный путь.

## Использование TSX

Настройте `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@dopejs/pingo"
  }
}
```

После этого можно писать:

```tsx
function OrderRow({ index }: { index: number }) {
  return (
    <container width={480} height={32} padding={[6, 12, 6, 12]}>
      <text value={`订单 #${index}`} fontSize={13} lineHeight={20} />
    </container>
  );
}

root.render(<OrderRow index={1} />);
```

## Элементы хоста

В движке всего пять встроенных элементов, они напрямую соответствуют узлам Scene, без каскадирования CSS и селекторов:

| Элемент        | Назначение                                                         |
| -------------- | ------------------------------------------------------------------ |
| `container`    | Универсальная группировка, фон, внутренние отступы, трансформации  |
| `text`         | Текстовый прогон (shaping, перенос строк, геометрия caret из Core) |
| `scroll`       | Прокручиваемый контейнер, принадлежащий Core                       |
| `virtualList`  | Виртуальный список с окном, планируемым Core                       |
| `editableText` | Примитив редактируемого текста                                     |

`TextField` и `TextArea` — это виджеты, скомпонованные поверх `editableText` (рамка, состояние ошибки), они не вводят нового пути ввода.

## Состояние и побочные эффекты

```ts
import { signal, useEffect, useSignal, useState } from "@dopejs/pingo";

function Counter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCount((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return createElement("text", { value: `已过 ${count} 秒` });
}
```

Доступные реактивные примитивы: `signal`, `computed`, `effect`, `batch`, `untracked`, а также хуки `useState`, `useSignal`, `useMemo`, `useCallback`, `useRef`, `useEffect`.

::: warning Синхронное чтение раскладки не поддерживается
Синхронное чтение раскладки воркера в стиле `useLayoutEffect` не поддерживается — раскладка происходит по другим часам. Когда нужен результат раскладки, используйте асинхронный контракт и не пытайтесь синхронно читать геометрию во время рендеринга.
:::

## Наблюдение за состоянием работы

```ts
const root = await createHostedCanvasRoot(canvas, {
  onFrame: (report) => {
    console.log(report.commands, report.displayListBytes, report.core?.sceneNodes);
  },
  onHostError: (error) => report(error),
});
```

`onFrame` на каждом кадре предоставляет количество команд, размер DisplayList в байтах, а также со стороны Core — количество грязных областей, объём работы по раскладке и picture hash; это первичные данные для диагностики производительности. Подробнее см. [Диагностика](/diagnostics).

## Обзор возможностей

Поверх пяти встроенных элементов pingo также предлагает три уровня возможностей, ориентированных на авторов:

- [Базовые компоненты](/guide/elements): View/Text/Image, Input/TextArea, SVG/Path и другие элементы уровня движка.
- [Стили](/guide/styling): версионированное подмножество CSS — селекторы классов, интерактивные состояния, чёткие границы каскадирования и наследования; когда нужны переменные и миксины, используйте конвейер [SCSS / Less](/guide/scss-less) на этапе сборки.
- [Библиотека UI-компонентов](/components): `@dopejs/pingo-ui` — готовые компоненты, согласованные с shadcn/ui, полностью рендерятся на canvas.

## Дальнейшие шаги

- [Обзор архитектуры](/guide/architecture): как разделены обязанности между Shell и Core
- [Виртуальная прокрутка](/guide/scrolling), [Текст и редактирование](/guide/editing)
- [Playground](/playground): интерактивная живая демонстрация
