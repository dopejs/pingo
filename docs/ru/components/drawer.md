---
title: Drawer
description: Выдвижная панель, въезжающая с верхнего или нижнего края, подходит для мобильных действий снизу.
---

# Drawer

Выдвижная панель — это панель, въезжающая с горизонтального края, — эквивалент [Sheet](/components/sheet), у которого `side` принимает только `"top" | "bottom"`. Превью ниже отрисовывается движком pingo в реальном времени и переключается между светлой и тёмной темой вместе с сайтом.

:::preview drawer-basic
:::

## Использование

```tsx
import { createElement } from "@dopejs/pingo";
import { Drawer } from "@dopejs/pingo-ui";

root.render(
  createElement(Drawer, {
    open,
    onOpenChange: (next) => setOpen(next),
    side: "bottom",
    children: createElement("text", { value: "抽屉内容" }),
  }),
);
```

Оверлей заполняет собственный родительский контейнер, поэтому монтируйте его ближе к корню. `open` — управляемый проп; щелчок по подложке или нажатие `Escape` запрашивает закрытие через `onOpenChange(false)`. Блоки заголовка и кнопок внутри панели можно собирать из `DialogHeader`, `DialogTitle`, `DialogDescription` и `DialogFooter`.

## Примеры

### Направление

`side` поддерживает `"top"` и `"bottom"`, по умолчанию `"bottom"`.

## Props

Наследует `DialogProps` (`open`, `onOpenChange`, `children`, `className`), а также:

| Prop   | Тип                 | Значение по умолчанию | Описание                         |
| ------ | ------------------- | --------------------- | -------------------------------- |
| `side` | `"top" \| "bottom"` | `"bottom"`            | Край, с которого въезжает панель |

## Доступность

Панель имеет семантику complementary; при открытии фокус перемещается в панель, а после закрытия по `Escape` возвращается к элементу-триггеру.
