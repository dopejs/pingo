---
title: Компоненты
description: Библиотека нативных UI-компонентов pingo в духе shadcn, целиком рендерится на canvas в реальном времени.
---

# Компоненты

`@dopejs/pingo-ui` — библиотека компонентов, выровненная по shadcn/ui: API и семантика скинов
совпадают, а целью рендеринга служит движок pingo canvas, а не DOM. Каждая страница компонента ниже
содержит превью с **живым рендерингом** — само превью является canvas, нарисованным движком: оно
интерактивно и следует за сменой темы.

## Использование

```ts
import { createHostedCanvasRoot } from "@dopejs/pingo";
import { Button, createPingoUiStyleSheet } from "@dopejs/pingo-ui";

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [createPingoUiStyleSheet()],
});
root.render(createElement(Button, { children: "保存" }));
```

Пользовательские таблицы стилей должны регистрироваться **после** таблицы стилей pingo-ui: правила
с одинаковым приоритетом переопределяются в порядке регистрации. О темах и фирменной кастомизации
см. [руководство по стилям](/guide/styling) и [SCSS и Less](/guide/scss-less).

Выберите компонент в оглавлении слева, чтобы начать.
