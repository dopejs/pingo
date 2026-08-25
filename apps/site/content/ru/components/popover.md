---
title: Popover
description: Всплывающая панель, привязанная к триггеру, — для дополнительной информации и лёгких действий.
---

# Popover

Popover открывает плавающую панель рядом с триггером; при прокрутке страницы панель сохраняет привязку. Превью ниже рендерится движком pingo в реальном времени — щёлкайте по триггеру, чтобы открыть и закрыть; превью переключается между светлой и тёмной темой вслед за темой сайта.

:::preview popover-basic
:::

## Использование

```tsx
import { createElement } from "@dopejs/pingo";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@dopejs/pingo-ui";

root.render(
  createElement(Popover, {
    defaultOpen: false,
    onOpenChange: (open) => {},
    children: [
      createElement(PopoverTrigger, {
        children: createElement(Button, { children: "打开浮层", onPress: () => {} }),
      }),
      createElement(PopoverContent, {
        children: createElement("text", { value: "任意内容" }),
      }),
    ],
  }),
);
```

`PopoverTrigger` и `PopoverContent` читают состояние корневого компонента через context и должны быть дочерними узлами одного и того же `Popover`. По умолчанию режим неконтролируемый (`defaultOpen`); передача `open` переключает в контролируемый режим. Панель по умолчанию привязывается снизу от триггера; с включённым обратным чтением раскладки при нехватке места она автоматически переворачивается на другую сторону.

## Примеры

### Произвольное содержимое

`children` у `PopoverContent` принимает любой `PingoNode` — можно размещать формы, списки или типографский контент.

:::preview popover-rich
:::

## Пропсы

### Popover

| Prop           | Тип                       | По умолчанию | Описание                                           |
| -------------- | ------------------------- | ------------ | -------------------------------------------------- |
| `open`         | `boolean`                 | —            | Контролируемое состояние открытия                  |
| `defaultOpen`  | `boolean`                 | `false`      | Неконтролируемое начальное состояние открытия      |
| `onOpenChange` | `(open: boolean) => void` | —            | Колбэк открытия/закрытия                           |
| `children`     | `PingoNode`               | —            | Trigger и Content (обязательно)                    |
| `className`    | `string`                  | —            | Добавляется после имени класса якорного контейнера |

### PopoverTrigger

| Prop        | Тип         | По умолчанию | Описание                     |
| ----------- | ----------- | ------------ | ---------------------------- |
| `children`  | `PingoNode` | —            | Элемент-триггер (обязателен) |
| `className` | `string`    | —            | Добавочное имя класса        |

### PopoverContent

| Prop        | Тип         | По умолчанию | Описание                        |
| ----------- | ----------- | ------------ | ------------------------------- |
| `children`  | `PingoNode` | —            | Содержимое панели (обязательно) |
| `className` | `string`    | —            | Добавочное имя класса           |

## Доступность

Триггер несёт семантику button и сообщает состояние expanded/collapsed; `Escape` закрывает панель и возвращает фокус триггеру.
