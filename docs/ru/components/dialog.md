---
title: Dialog
description: Модальное диалоговое окно, прерывающее текущий сценарий для получения данных или подтверждения от пользователя; рендерится на холсте pingo.
---

# Dialog

Диалог открывает модальную панель поверх текущего содержимого вместе с затемняющей подложкой. Превью ниже рендерится движком pingo в реальном времени — клик по подложке или нажатие `Escape` вызывает `onOpenChange(false)`, а оформление переключается между светлой и тёмной темой вслед за сайтом.

:::preview dialog-basic
:::

## Использование

```tsx
import { createElement } from "@dopejs/pingo";
import {
  Button,
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@dopejs/pingo-ui";

root.render(
  createElement(Dialog, {
    open,
    onOpenChange: (next) => setOpen(next),
    children: [
      createElement(DialogHeader, {
        children: [
          createElement(DialogTitle, { children: "Редактировать профиль" }),
          createElement(DialogDescription, { children: "Изменения синхронизируются сразу." }),
        ],
      }),
      createElement(DialogFooter, {
        children: createElement(Button, { children: "Сохранить", onPress: () => save() }),
      }),
    ],
  }),
);
```

Оверлей Dialog заполняет **собственный родительский контейнер** (а не viewport), поэтому монтируйте его ближе к корневому узлу. `open` — управляемый prop: компонент не хранит состояние открытия/закрытия и при закрытии уведомляет вызывающую сторону через `onOpenChange(false)`.

## Примеры

### Составные блоки

`DialogHeader` / `DialogTitle` / `DialogDescription` / `DialogFooter` — это чисто макетные и типографические компоненты, которые комбинируются по мере необходимости; `children` принимает любой `PingoNode`, поэтому формы и списки можно размещать внутри панели.

## Props

### Dialog

| Prop           | Тип                       | По умолчанию | Описание                                    |
| -------------- | ------------------------- | ------------ | ------------------------------------------- |
| `open`         | `boolean`                 | —            | Открыто ли окно (обязательный, управляемый) |
| `onOpenChange` | `(open: boolean) => void` | —            | Вызывается при запросе закрытия/открытия    |
| `children`     | `PingoNode`               | —            | Содержимое панели (обязательный)            |
| `className`    | `string`                  | —            | Добавляется после имени класса оверлея      |

### DialogHeader / DialogFooter

| Prop        | Тип         | По умолчанию | Описание                        |
| ----------- | ----------- | ------------ | ------------------------------- |
| `children`  | `PingoNode` | —            | Содержимое блока (обязательный) |
| `className` | `string`    | —            | Дополнительный класс            |

### DialogTitle / DialogDescription

| Prop        | Тип      | По умолчанию | Описание                            |
| ----------- | -------- | ------------ | ----------------------------------- |
| `children`  | `string` | —            | Текстовое содержимое (обязательный) |
| `className` | `string` | —            | Дополнительный класс                |

## Доступность

Панель имеет семантику dialog; при открытии фокус перемещается внутрь панели, а после закрытия по `Escape` возвращается к触发 элементу. Интерактивные элементы внутри панели включаются в цикл переключения по Tab. Для заголовка используйте `DialogTitle` (семантика heading).
