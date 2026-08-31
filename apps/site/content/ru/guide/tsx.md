---
title: TSX
description: Как писать компоненты pingo на TSX и уживаться с React в одном репозитории.
---

# Писать pingo на TSX

## Настройка

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@dopejs/pingo"
  }
}
```

`jsx` выбирает автоматический рантайм TypeScript, а `jsxImportSource` направляет его на
`jsx-runtime` от pingo, а не от React. Имя `react-jsx` — это название режима трансформации,
к React оно отношения не имеет.

## Что может быть тегом

```tsx
import { createContext, memo, Text, useState, View, type PingoNode } from "@dopejs/pingo";
import { Button } from "@dopejs/pingo-ui";

const Theme = createContext("light");

function Row({ label }: { readonly label: string }): PingoNode {
  const [count, setCount] = useState(0);
  return (
    <View width={240} padding={8}>
      <text value={`${label} ${count}`} />
      <Button onPress={() => setCount(count + 1)}>Прибавить</Button>
    </View>
  );
}

root.render(
  <Theme.Provider value="dark">
    <Row label="Клики" />
  </Theme.Provider>,
);
```

Работают все пять форм:

| Форма                                 | Пример                                                |
| ------------------------------------- | ----------------------------------------------------- |
| Встроенные элементы                   | `<container>`, `<text>`, `<scroll>`, `<editableText>` |
| Базовые компоненты                    | `<View>`, `<Text>`, `<Image>`, `<Input>`              |
| Собственные функциональные компоненты | `<Row label="…" />`                                   |
| Компоненты, обёрнутые в `memo`        | все из `@dopejs/pingo-ui`                             |
| Провайдеры контекста                  | `<Theme.Provider value={…}>`                          |

::: warning Компонент с хуками монтируют, а не вызывают
`Row({ label })` проходит проверку типов, но падает с
`hooks may only run in a function component`: хукам нужна область компонента, которую создаёт
реконсилятор. Пишите `<Row label="…" />`.
:::

Возвращаемый тип можно указывать как `PingoNode`. Он включает `undefined`, но совместимость с
JSX-тегами объявляет `JSX.ElementType` движка — переписывать сигнатуру не нужно.

## Сосуществование с React

Файлы TSX для React и для pingo в одном репозитории — обычная ситуация: оболочка на React,
а требовательные к производительности области рисует pingo.

### Механизм — объявление в заголовке файла

`jsxImportSource` действует **на уровне файла**. В первой строке файла pingo пишется:

```tsx
/** @jsxImportSource @dopejs/pingo */
```

`tsconfig.json` проекта остаётся с настройками React, и только файлы с этой строкой
используют рантайм pingo. Её понимают и `tsc`, и esbuild/Vite, и babel.

**Две другие идеи не работают** — проверено:

| Подход                                                        | Результат                                                                                                                               |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Положить в каталог `tsconfig.json` с другим `jsxImportSource` | `tsc` полностью его игнорирует, а Vite применяет — сборка и проверка типов расходятся                                                   |
| Исключить по имени файла через `exclude`                      | `exclude` влияет только на выбор корневых файлов; как только React-файл сделает `import`, файл вернётся и будет скомпилирован как React |

Чтобы имя файла действительно управляло тулчейном, нужны composite project references:
проект pingo выдаёт `.d.ts`, а проект React читает объявления, а не исходники.

Забытая строка не ломает молча — ошибка возникает при компиляции:

```
error TS2322: Type 'Element' is not assignable to type 'PingoNode'.
error TS2786: 'View' cannot be used as a JSX component.
```

### Суффикс в имени — соглашение

Когда оба вида файлов лежат в одном каталоге, стоит давать файлам pingo суффикс вроде
`scene.pingo.tsx`: в списке файлов они сразу различимы, и это пригодится для настроек по
имени, таких как `overrides` в babel. Это соглашение для людей и конфигураций, оно
**не заменяет заголовок**. Если весь каталог — pingo, сигналом служит сам каталог, а суффикс
становится шумом.

### Граница — это граница файла

В одном файле только один вид JSX, поэтому **внутри React-компонента нельзя писать теги
pingo**. Файл pingo экспортирует сцену, файл React её импортирует:

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

### Монтирование через `PingoContainer`

```tsx
// App.tsx — теги этого файла принадлежат React
import { PingoContainer } from "@dopejs/pingo/react";

import { scene } from "./scene.pingo";

export function App() {
  return <PingoContainer scene={scene("Hello")} style={{ height: 320, width: 480 }} />;
}
```

Сцена передаётся пропом `scene`, а не через children: теги этого файла принадлежат React, и
children от pingo здесь написать нельзя.

`PingoContainer` создаёт canvas сам, а не берёт ref на отрисованный React-ом. Это
**обязательно**: корень передаёт canvas в OffscreenCanvas, передача необратима, а React
StrictMode в разработке выполняет эффекты дважды — принадлежащий React canvas достался бы
второму корню и упал:

```
this canvas already transferred control to an OffscreenCanvas and cannot host
a second root; create a new canvas element per root
```

Созданный компонентом canvas исчезает вместе с отброшенным монтированием, поэтому этого не
происходит. О размерах тоже думать не нужно: корень следует за боксом собственного canvas,
достаточно задать размер контейнеру через CSS.

Когда нужен сам корень (управление прокруткой, диагностические колбэки), используйте
`onRoot`; для ошибки запуска — `onStartupError`. Ошибки времени выполнения по-прежнему идут
в `options.onHostError`.

### Два дерева не разделяют состояние

State и context React не попадают в дерево компонентов pingo, и наоборот. Это два независимых
реконсилятора. Обмен через границу — обычный поток данных: React вычисляет значение и
передаёт его как `scene`, pingo возвращает результат через колбэки событий.

## Этот репозиторий и есть пример

`apps/site` — приложение на React, и одновременно в нём лежат 73 превью компонентов,
написанные на pingo TSX. Каталог, где они соседствуют, —
[`apps/site/src/interop`](https://github.com/dopejs/pingo/tree/main/apps/site/src/interop),
и его тест выполняется под `StrictMode`.
