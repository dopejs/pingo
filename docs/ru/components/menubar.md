---
title: Menubar
description: Панель меню приложения в десктопном стиле, где несколько меню делят один слот открытого состояния.
---

# Menubar

Menubar — ряд меню, делящих один слот открытого состояния, как в меню десктопных приложений. Превью ниже рендерится движком pingo в реальном времени — щелчок по ярлыкам «Файл», «Правка» и т. п. открывает и закрывает соответствующие меню, а тема переключается между светлой и тёмной вместе с сайтом.

:::preview menubar-basic
:::

## Использование

```tsx
import { createElement } from "@dopejs/pingo";
import { Menubar, MenubarMenu } from "@dopejs/pingo-ui";

root.render(
  createElement(Menubar, {
    onValueChange: (value) => {},
    children: [
      createElement(MenubarMenu, {
        value: "file",
        label: "文件",
        children: createElement("text", { value: "新建" }),
      }),
      createElement(MenubarMenu, {
        value: "edit",
        label: "编辑",
        children: createElement("text", { value: "撤销" }),
      }),
    ],
  }),
);
```

`MenubarMenu` читает состояние панели меню через context, поэтому должен быть дочерним узлом `Menubar`; его `children` — содержимое панели, показываемое при открытии. Открытие по умолчанию неконтролируемое; передача `value` переключает в контролируемый режим (значение — `value` текущего открытого меню).

## Примеры

### Контролируемое открытие

Передача `value` фиксирует открытое меню; обычно используется для начального онбординга или синхронизации с внешним состоянием.

:::preview menubar-open
:::

## Props

### Menubar

| Prop | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `value` | `string` | — | Контролируемый: значение текущего открытого меню |
| `onValueChange` | `(value: string \| undefined) => void` | — | Колбэк смены открытого меню (при закрытии — `undefined`) |
| `children` | `PingoNode` | — | Несколько `MenubarMenu` (обязательно) |
| `className` | `string` | — | Дополнительный класс |
| `navigation` | `boolean` | `false` | Использовать семантику навигации (используется внутри [NavigationMenu](/components/navigation-menu)) |

### MenubarMenu

| Prop | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `value` | `string` | — | Идентификатор меню (обязательно) |
| `label` | `string` | — | Ярлык, отображаемый на панели (обязательно) |
| `children` | `PingoNode` | — | Содержимое панели при открытии (обязательно) |
| `className` | `string` | — | Дополнительный класс |

## Доступность

Панель меню имеет семантику menubar, ярлыки — семантику menuitem с экспонируемым состоянием expanded/collapsed; клавиши со стрелками влево/вправо перемещают между меню, при открытом меню также переключают его, `Escape` закрывает меню и возвращает фокус на текущий ярлык.
