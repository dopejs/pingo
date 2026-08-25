---
title: Dropdown Menu
description: Меню действий, раскрывающееся по щелчку триггера, с поддержкой навигации с клавиатуры.
---

# Dropdown Menu

Dropdown Menu раскрывает набор пунктов действий под триггером. Превью ниже отрисовывается движком pingo в реальном времени — щёлкните триггер, чтобы открыть или закрыть меню; превью переключается между светлой и тёмной темой вместе с сайтом.

:::preview dropdown-menu-basic
:::

## Использование

```tsx
import { createElement } from "@dopejs/pingo";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@dopejs/pingo-ui";

root.render(
  createElement(DropdownMenu, {
    onValueChange: (value) => run(value),
    children: [
      createElement(DropdownMenuTrigger, {
        children: createElement(Button, { children: "打开菜单", onPress: () => {} }),
      }),
      createElement(DropdownMenuContent, {
        children: [
          createElement(DropdownMenuItem, { value: "profile", children: "个人资料" }),
          createElement(DropdownMenuItem, { value: "settings", children: "设置" }),
        ],
      }),
    ],
  }),
);
```

Trigger и Content читают состояние корневого компонента через context и обязаны быть дочерними узлами одного и того же `DropdownMenu`. После выбора пункта вызывается `onValueChange`, и меню автоматически закрывается. Открытие/закрытие по умолчанию неуправляемое (`defaultOpen`); управляемого пропа `open` у компонента нет — для полностью управляемого выбора из списка используйте Select (оба компонента используют одну реализацию).

## Props

### DropdownMenu

| Prop            | Тип                       | Значение по умолчанию | Описание                                                        |
| --------------- | ------------------------- | --------------------- | --------------------------------------------------------------- |
| `value`         | `string`                  | —                     | Текущее выбранное значение (подсвечивает соответствующий пункт) |
| `defaultOpen`   | `boolean`                 | `false`               | Начальное состояние открытия                                    |
| `onValueChange` | `(value: string) => void` | —                     | Колбэк выбора пункта меню                                       |
| `onOpenChange`  | `(open: boolean) => void` | —                     | Колбэк изменения состояния открытия                             |
| `children`      | `PingoNode`               | —                     | Trigger и Content (обязательно)                                 |
| `className`     | `string`                  | —                     | Добавляется к имени класса якорного контейнера                  |

### DropdownMenuTrigger

| Prop          | Тип         | Значение по умолчанию | Описание                                                               |
| ------------- | ----------- | --------------------- | ---------------------------------------------------------------------- |
| `children`    | `PingoNode` | —                     | Элемент-триггер; без него отображается текущее значение/текст-заглушка |
| `placeholder` | `string`    | —                     | Текст-заглушка при отсутствии выбранного значения                      |
| `className`   | `string`    | —                     | Дополнительное имя класса                                              |

### DropdownMenuContent

| Prop        | Тип         | Значение по умолчанию | Описание                  |
| ----------- | ----------- | --------------------- | ------------------------- |
| `children`  | `PingoNode` | —                     | Пункты меню (обязательно) |
| `className` | `string`    | —                     | Дополнительное имя класса |

### DropdownMenuItem

| Prop        | Тип      | Значение по умолчанию | Описание                           |
| ----------- | -------- | --------------------- | ---------------------------------- |
| `value`     | `string` | —                     | Значение пункта меню (обязательно) |
| `children`  | `string` | —                     | Отображаемый текст (обязательно)   |
| `className` | `string` | —                     | Дополнительное имя класса          |

## Доступность

Меню имеет семантику menu, пункты меню — menuitem; после открытия стрелки перемещают по пунктам, `Enter`/`Space` выбирает пункт, `Escape` закрывает меню и возвращает фокус триггеру.
