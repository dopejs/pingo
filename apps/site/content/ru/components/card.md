---
title: Card
description: "Композиционный контейнер-карточка: Header, Title, Description, Content, Footer; рендерится на холсте pingo."
---

# Card

Карточка объединяет связанный контент в контейнере с рамкой и тенью и состоит из шести комбинируемых слотов. Превью ниже рендерится движком pingo в реальном времени и переключается между светлой и тёмной темой вслед за темой сайта.

:::preview card-basic
:::

## Использование

```tsx
import { createElement } from "@dopejs/pingo";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@dopejs/pingo-ui";

root.render(
  createElement(Card, {
    children: [
      createElement(CardHeader, {
        children: [
          createElement(CardTitle, { children: "账户设置" }),
          createElement(CardDescription, { children: "管理你的账户偏好与通知。" }),
        ],
      }),
      createElement(CardContent, {
        children: createElement("text", { value: "卡片正文内容。" }),
      }),
      createElement(CardFooter, {
        children: createElement(Button, { children: "保存", onPress: () => {} }),
      }),
    ],
  }),
);
```

Все слоты необязательны — комбинируйте только нужные части; содержимое слотов передаётся как есть, без обёрток.

## Пропсы

`Card`, `CardHeader`, `CardContent`, `CardFooter` принимают контейнерные пропсы:

| Prop        | Тип         | По умолчанию | Описание                                  |
| ----------- | ----------- | ------------ | ----------------------------------------- |
| `children`  | `PingoNode` | —            | Содержимое слота (обязательно)            |
| `className` | `string`    | —            | Добавляется после имени класса компонента |

`CardTitle`, `CardDescription` принимают текстовые пропсы:

| Prop        | Тип      | По умолчанию | Описание                                  |
| ----------- | -------- | ------------ | ----------------------------------------- |
| `children`  | `string` | —            | Текстовое содержимое (обязательно)        |
| `className` | `string` | —            | Добавляется после имени класса компонента |

## Доступность

Card — чисто визуальный контейнер, он не вводит дополнительной семантики; читаемое имя и структуру карточки задают размещённые внутри заголовки, кнопки и другие компоненты. Цвета заголовка и основного текста наследуют цвет переднего плана карточки и сохраняют контраст в светлой и тёмной темах.
