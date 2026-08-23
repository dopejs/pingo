---
title: Tabs
description: Вкладки переключают набор панелей одного уровня, отрисовываются на pingo canvas.
---

# Tabs

Вкладки переключают несколько панелей содержимого одного уровня в одной области. Предпросмотр ниже отрисовывается движком pingo в реальном времени — можно щёлкать вкладки для переключения или перемещаться между ними клавишами-стрелками влево/вправо.

:::preview tabs-basic
:::

## Использование

```tsx
import { createElement } from "@dopejs/pingo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@dopejs/pingo-ui";

root.render(
  createElement(Tabs, {
    defaultValue: "account",
    children: [
      createElement(TabsList, {
        children: [
          createElement(TabsTrigger, { value: "account", children: "账户" }),
          createElement(TabsTrigger, { value: "password", children: "密码" }),
        ],
      }),
      createElement(TabsContent, {
        value: "account",
        children: createElement("text", { value: "管理你的账户信息。" }),
      }),
      createElement(TabsContent, {
        value: "password",
        children: createElement("text", { value: "修改你的登录密码。" }),
      }),
    ],
  }),
);
```

`Tabs` поддерживает как неконтролируемое (`defaultValue`), так и контролируемое (`value` + `onValueChange`) использование.

## Props

### Tabs

| Prop | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `value` | `string` | — | Контролируемый режим: `value` текущей выбранной вкладки |
| `defaultValue` | `string` | — | Неконтролируемый режим: `value` изначально выбранной вкладки |
| `onValueChange` | `(value: string) => void` | — | Колбэк при смене выбора |
| `children` | `PingoNode` | — | `TabsList` и несколько `TabsContent` (обязательно) |
| `className` | `string` | — | Добавляется после имени класса компонента |

### TabsList

| Prop | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | Список `TabsTrigger` (обязательно) |
| `className` | `string` | — | Добавляется после имени класса компонента |

### TabsTrigger

| Prop | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `value` | `string` | — | Идентификатор, связанный с соответствующим `TabsContent` (обязательно) |
| `children` | `string` | — | Текст вкладки (обязательно) |
| `className` | `string` | — | Добавляется после имени класса компонента |

### TabsContent

| Prop | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `value` | `string` | — | Идентификатор, связанный с соответствующим `TabsTrigger` (обязательно) |
| `children` | `PingoNode` | — | Содержимое панели (обязательно) |
| `className` | `string` | — | Добавляется после имени класса компонента |

## Доступность

Список вкладок имеет семантику tablist, вкладки — семантику tab и сообщают вспомогательным технологиям выбранное состояние. Клавиши-стрелки влево/вправо и Home/End перемещают между вкладками и одновременно выбирают их, фокус следует за выбором; неактивные панели скрываются через `display: none`, а не размонтируются, поэтому позиция прокрутки и состояние редактирования внутри панели сохраняются.
