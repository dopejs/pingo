---
title: SCSS / Less
description: "Написание таблиц стилей pingo на SCSS или Less: конвейер компиляции на этапе сборки, плагин Vite, границы безопасности и диагностика ошибок."
---

# SCSS / Less

CSS subset pingo (см. [руководство по стилям](/guide/styling)) во время выполнения принимает только CSS-текст или объект.
Если нужны переменные, mixin, `@use` / import и другие удобства для автора, используйте **компиляцию на этапе сборки**: SCSS/Less компилируются в CSS на стороне Node
пакетом `@dopejs/pingo-style-preprocess`, затем проходят проверку существующим `compileStyleSheet`,
и генерируется JavaScript-модуль с экспортом по умолчанию `PingoStyleSheet`.

**Sass и Less не попадают в браузерный bundle, facade или Core** — во время выполнения нет никакого препроцессора,
только уже существующий лёгкий компилятор CSS. Границы subset тоже не расширяются: селекторы потомков, `@media`,
`var()`, `calc()`, `em/rem/vw/vh` и прочее по-прежнему отклоняются существующей диагностикой — сборка завершается ошибкой, а не молча пропускает их.

## Две семантики импорта нужно разделять

### Обычные DOM-стили (нативно в Vite)

```ts
import "./site.scss";
import "./probe.less";
```

Этот путь — встроенная в Vite возможность препроцессинга CSS, на выходе **DOM CSS**, который Vite внедряет или извлекает.
Он подходит только для DOM-страниц вроде сайта документации или оболочки Storybook, **не создаёт `PingoStyleSheet`**,
и его не следует использовать для стилей внутри canvas.

### Таблицы стилей pingo (`?pingo-style`)

```ts
import { createHostedCanvasRoot } from "@dopejs/pingo";
import buttonSheet from "./button.scss?pingo-style";
import themeSheet from "./theme.less?pingo-style";

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [buttonSheet, themeSheet],
});
```

`?pingo-style` — это явная граница типов: на этапе сборки сначала выполняется препроцессинг, затем проверка по CSS subset, и сгенерированный ESM-модуль
экспортирует по умолчанию `PingoStyleSheet` и **не внедряет в DOM никакого CSS**.

## Плагин Vite

Установите пакет только для Node (требуется Node >= 22.12, Vite ^8):

```sh
pnpm add -D @dopejs/pingo-style-preprocess
```

Зарегистрируйте в `vite.config.ts`:

```ts
import { pingoStylePreprocess } from "@dopejs/pingo-style-preprocess/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    pingoStylePreprocess({
      // Необязательно: дополнительные Sass load paths / Less paths
      scssLoadPaths: ["styles"],
      lessPaths: ["styles"],
      // Необязательно: зависимости должны находиться внутри этих каталогов (по умолчанию только каталог entry и load paths)
      allowRoots: ["src", "styles"],
    }),
  ],
});
```

Объявления типов предоставляются через входную точку `./client` пакета, достаточно один раз указать её в `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["@dopejs/pingo-style-preprocess/client"]
  }
}
```

Соглашения о поведении плагина:

- Сопоставляются только файлы с точным query-флагом `pingo-style` и расширением `.scss` / `.less`; остальные файлы не затрагиваются.
- Через virtual module изолируется нативный CSS-конвейер Vite, поэтому не происходит повторного препроцессинга или внедрения DOM CSS.
- Entry и все partial/import попадают в watch graph — **изменение token или mixin запускает
  HMR и production-пересборку**, ручная очистка кэша не требуется.
- Любая диагностика уровня error приводит к сбою сборки; warning выводится с позицией в исходнике. При ошибке компиляции HMR сохраняется предыдущий
  зафиксированный модуль, а dev server сообщает об ошибке.
- Сгенерированный модуль при инициализации проверяет `CSS_SUBSET_VERSION`: если версия subset у runtime facade отличается от версии, использованной при проверке
  на этапе сборки, загрузка модуля сразу выбрасывает ошибку и не допускает смешения двух семантик.
- В средах dev, production и SSR генерируются семантически одинаковые таблицы стилей.

## Node API компиляции

Системы сборки вне Vite (CLI, codegen) могут напрямую использовать Node API:

```ts
import {
  compileLessString,
  compilePingoStyleFile,
  compileScssString,
  createStyleSheetFromLess,
  createStyleSheetFromScss,
} from "@dopejs/pingo-style-preprocess";
```

- `compileScssString(source, options)`: синхронная, поэтому **обрабатывает только исходный код без import**;
  при наличии import возвращает диагностику `file-api-required`.
- `compileLessString(source, options)`: асинхронная (`render` в Less — это Promise); относительные import разрешаются только после указания
  абсолютного пути в `sourceName`.
- `compilePingoStyleFile(filename, options)`: асинхронный файловый API, именно его использует плагин Vite;
  база для разрешения относительных путей однозначна, граф зависимостей полный.
- Серия `compile*` **не выбрасывает исключения** при ошибках автора, а возвращает `styleSheet: null` и стабильно отсортированные
  diagnostics; `createStyleSheetFromScss` / `createStyleSheetFromLess` — это удобные обёртки, которые выбрасывают исключения:
  ошибки автора единообразно выбрасывают `StylePreprocessError` с сохранением всех diagnostics.

Возвращаемый `StylePreprocessResult` содержит `cssText`, `styleSheet`, `diagnostics` и
`dependencies` (полный список файлов зависимостей, можно использовать для собственного watch).

## Source map и диагностика ошибок

Каждая диагностика несёт метку этапа:

| `stage`       | Источник                                                                              |
| ------------- | ------------------------------------------------------------------------------------- |
| `"scss"`      | Исключение компиляции Sass (синтаксическая ошибка, неопределённая переменная и т. п.) |
| `"less"`      | Отклонение компиляции Less                                                            |
| `"pingo-css"` | Диагностика `compileStyleSheet` о выходе результата за пределы CSS subset             |

Оба компилятора включают source map, и позиция диагностики pingo CSS **по возможности проецируется обратно на исходный
файл SCSS/Less со строкой и столбцом** (`sourceLocation`); если проецирование невозможно, сохраняется сгенерированная позиция
(`generatedLocation`) и имя entry — исходная позиция не подделывается. Диагностики стабильно сортируются по сгенерированной позиции и code,
поэтому вывод в CI и snapshot воспроизводимы.

## Границы безопасности

Препроцессор выполняет код автора на этапе сборки, поэтому по умолчанию ограничения ужесточены:

- **Sass**: не открываются custom importer, custom function или Node package importer;
  принимаются только зависимости `file:`.
- **Less**: жёстко задан `javascriptEnabled: false`, плагины не передаются, при предварительном сканировании отклоняется `@plugin`;
  импорт по HTTP(S) или по протокол-относительным путям запрещён.
- **Общие ограничения**: после canonicalize зависимости обязаны находиться внутри allow roots (каталог entry + явные
  load paths); побег через symlink, не-файловые зависимости и удалённые зависимости一律 отклоняются. Скомпилированный CSS сначала проходит
  предел в 1 048 576 кодовых единиц и только потом проверку subset; для entry, количества зависимостей и суммарного объёма зависимостей заданы явные
  бюджеты, превышение даёт стабильную ошибку сборки.
- Версии компиляторов фиксируются lockfile, для CSS, diagnostics и списка зависимостей fixtures создаются
  reproducibility snapshot; обновление Sass/Less требует явной проверки различий в выводе.

Эти ограничения действуют только на инструментальную цепочку `?pingo-style`; обычные `.scss` / `.less` для DOM по-прежнему подчиняются собственной
конфигурации Vite.

## Функции цвета

Препроцессоры часто выводят функции цвета, поэтому subset поддерживает `rgb()` / `rgba()` / `hsl()` / `hsla()`
(как legacy-форму с запятыми, так и современную форму со space/slash) и унифицирует их в 8-битный RGBA. Вывод за пределами этого набора —
`color(display-p3 ...)`, пользовательские CSS-свойства, `calc()` — по-прежнему приводит к сбою сборки.
