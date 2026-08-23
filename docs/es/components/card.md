---
title: Card
description: Contenedor de tarjeta composable — Header, Title, Description, Content, Footer — renderizado en el canvas de pingo.
---

# Card

La tarjeta agrupa contenido relacionado en un contenedor con borde y sombra, formado por seis
huecos componibles. La vista previa de abajo se renderiza en vivo con el motor pingo y sigue el
tema del sitio al cambiar entre claro y oscuro.

:::preview card-basic
:::

## Uso

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

Todos los huecos son opcionales: compón sólo las partes que necesites. El contenido de cada hueco
se pasa tal cual, sin ningún envoltorio.

## Props

`Card`, `CardHeader`, `CardContent` y `CardFooter` aceptan props de tipo contenedor:

| Prop        | Tipo        | Valor predeterminado | Descripción                                    |
| ----------- | ----------- | -------------------- | ---------------------------------------------- |
| `children`  | `PingoNode` | —                    | Contenido del hueco (obligatorio)              |
| `className` | `string`    | —                    | Se añade tras las clases del propio componente |

`CardTitle` y `CardDescription` aceptan props de tipo texto:

| Prop        | Tipo     | Valor predeterminado | Descripción                                    |
| ----------- | -------- | -------------------- | ---------------------------------------------- |
| `children`  | `string` | —                    | Contenido de texto (obligatorio)               |
| `className` | `string` | —                    | Se añade tras las clases del propio componente |

## Accesibilidad

Card es un contenedor puramente visual y no introduce semántica adicional; el nombre legible y la
estructura de la tarjeta los aportan los títulos, botones y demás componentes colocados dentro.
Los colores del título y del cuerpo heredan el color de primer plano de la tarjeta y mantienen el
contraste en los temas claro y oscuro.
