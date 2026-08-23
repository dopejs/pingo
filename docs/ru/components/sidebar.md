---
title: Sidebar
description: "Навигационная боковая панель продукта: группы, пункты и состояние выбора, рендерится на холсте pingo."
---

# Sidebar

Sidebar — это навигационная колонка уровня приложения, состоящая из групп (Section) и пунктов (Item), со встроенным состоянием выбора и навигацией с клавиатуры. Превью ниже рендерится движком pingo в реальном времени — щёлкайте по пунктам или переключайтесь клавишами со стрелками после установки фокуса.

:::preview sidebar-basic
:::

## Использование

```tsx
import { createElement } from "@dopejs/pingo";
import { Sidebar, SidebarItem, SidebarSection } from "@dopejs/pingo-ui";

root.render(
  createElement(Sidebar, {
    defaultValue: "stats",
    onValueChange: (value) => navigate(value),
    children: [
      createElement(SidebarSection, {
        title: "工作区",
        children: [
          createElement(SidebarItem, { value: "home", label: "首页" }),
          createElement(SidebarItem, { value: "stats", label: "统计" }),
        ],
      }),
      createElement(SidebarSection, {
        title: "系统",
        children: createElement(SidebarItem, { value: "settings", label: "设置" }),
      }),
    ],
  }),
);
```

`Sidebar` поддерживает как неконтролируемый (`defaultValue`), так и контролируемый (`value` + `onValueChange`) режимы. Ширина панели определяется токеном темы (по умолчанию 240px).

## Props

### Sidebar

| Prop | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `value` | `string` | — | Контролируемый режим: `value` текущего выбранного пункта |
| `defaultValue` | `string` | — | Неконтролируемый режим: `value` изначально выбранного пункта |
| `onValueChange` | `(value: string) => void` | — | Колбэк изменения выбора |
| `children` | `PingoNode` | — | Список `SidebarSection` (обязательно) |
| `className` | `string` | — | Добавляется к имени класса компонента |

### SidebarSection

| Prop | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `title` | `string` | — | Заголовок группы; если опущен, строка заголовка не рендерится |
| `children` | `PingoNode` | — | Список `SidebarItem` (обязательно) |
| `className` | `string` | — | Добавляется к имени класса компонента |

### SidebarItem

| Prop | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `value` | `string` | — | Уникальный идентификатор пункта (обязательно) |
| `label` | `string` | — | Текст пункта, одновременно служит доступным именем (обязательно) |
| `icon` | `PingoNode` | — | Слот перед текстом, для иконки |
| `className` | `string` | — | Добавляется к имени класса компонента |

## Доступность

Панель имеет семантику navigation; пункты имеют семантику link, используют `label` как доступное имя и сообщают состояние selected/unselected. Стрелки вверх/вниз и Home/End перемещаются между пунктами, выбор перемещается вместе с фокусом.

О настройке ширины и цветов панели см. [руководство по стилям](/guide/styling).
