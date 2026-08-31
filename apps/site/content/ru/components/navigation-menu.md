---
title: Navigation Menu
description: Панель меню в стиле навигации сайта, с поведением Menubar и семантикой навигации.
---

# Navigation Menu

Navigation Menu — вариант [Menubar](/components/menubar) с семантикой навигации: та же строка триггеров и раскрывающиеся панели, но наружу экспонируется семантика navigation, что подходит для главной навигации сайта. Превью ниже рендерится движком pingo в реальном времени и переключается между светлой и тёмной темой вместе с сайтом.

:::preview navigation-menu-basic
:::

## Использование

```tsx
import { MenubarMenu, NavigationMenu } from "@dopejs/pingo-ui";

root.render(
  <NavigationMenu onValueChange={(value) => {}}>
    <MenubarMenu value="products" label="产品">
      <text value="渲染引擎" />
    </MenubarMenu>
    <MenubarMenu value="docs" label="文档">
      <text value="快速开始" />
    </MenubarMenu>
  </NavigationMenu>,
);
```

Пункты переиспользуют `MenubarMenu`. Открытие по умолчанию неконтролируемое; передача `value` переключает в контролируемый режим. Поведение взаимодействия (клавиатурная навигация, общий слот открытого состояния) полностью совпадает с Menubar.

## Props

`NavigationMenu` принимает все пропсы из `MenubarProps`, кроме `navigation`:

| Prop            | Тип                                    | По умолчанию | Описание                                                 |
| --------------- | -------------------------------------- | ------------ | -------------------------------------------------------- |
| `value`         | `string`                               | —            | Контролируемый: значение текущего открытого меню         |
| `onValueChange` | `(value: string \| undefined) => void` | —            | Колбэк смены открытого меню (при закрытии — `undefined`) |
| `children`      | `PingoNode`                            | —            | Несколько `MenubarMenu` (обязательно)                    |
| `className`     | `string`                               | —            | Дополнительный класс                                     |

Пропсы пунктов см. в [Menubar](/components/menubar#menubarmenu).

## Доступность

Контейнер имеет семантику navigation, ярлыки — семантику menuitem с экспонируемым состоянием expanded/collapsed; клавиши со стрелками влево/вправо перемещают между пунктами, `Escape` закрывает меню и возвращает фокус на текущий ярлык.
