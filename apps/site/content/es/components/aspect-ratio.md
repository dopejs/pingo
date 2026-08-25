---
title: Aspect Ratio
description: Contenedor que restringe el contenido a una relación de aspecto fija, renderizado en el canvas de pingo.
---

# Aspect Ratio

Aspect Ratio mantiene el contenido con una relación de aspecto fija: la anchura la decide el
layout y la altura se calcula automáticamente según la razón. La vista previa de abajo se
renderiza en vivo con el motor pingo.

:::preview aspect-ratio-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { AspectRatio } from "@dopejs/pingo-ui";

root.render(
  createElement(AspectRatio, {
    ratio: 16 / 9,
    children: coverImage,
  }),
);
```

La anchura del componente es el 100 % del contenedor padre; `ratio` es ancho dividido entre alto,
por ejemplo `16 / 9` indica pantalla panorámica.

## Props

| Prop        | Tipo        | Valor predeterminado | Descripción                                    |
| ----------- | ----------- | -------------------- | ---------------------------------------------- |
| `ratio`     | `number`    | `1`                  | Relación de aspecto (ancho ÷ alto)             |
| `children`  | `PingoNode` | —                    | Contenido restringido (obligatorio)            |
| `className` | `string`    | —                    | Se añade tras las clases del propio componente |

## Accesibilidad

Aspect Ratio es un contenedor de layout puro y no introduce semántica adicional. Como el
subconjunto de CSS no tiene la propiedad `aspect-ratio`, el componente calcula la altura a partir
del ancho medido: el primer fotograma se renderiza primero con altura cero y la altura se fija
cuando llega la medida.
