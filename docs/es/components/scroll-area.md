---
title: Scroll Area
description: Contenedor de desplazamiento con barra de desplazamiento dibujada, renderizado sobre el canvas de pingo.
---

# Scroll Area

Scroll Area desplaza contenido demasiado largo dentro de una vista de tamaño fijo y dibuja una barra de desplazamiento acorde al tema. La vista previa a continuación se renderiza en tiempo real mediante el motor pingo: prueba a desplazarte sobre la lista.

:::preview scroll-area-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { ScrollArea } from "@dopejs/pingo-ui";

root.render(
  createElement(ScrollArea, {
    children: items.map((item) => createElement("text", { value: item })),
  }),
);
```

El componente ocupa el 100 % del ancho y alto del contenedor padre, por lo que necesita un contenedor padre con dimensiones definidas; la barra de desplazamiento solo aparece cuando el contenido supera la vista.

## Props

| Prop | Tipo | Valor predeterminado | Descripción |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | Contenido desplazable (obligatorio) |
| `hideScrollbar` | `boolean` | `false` | Oculta la barra de desplazamiento dibujada (la capacidad de desplazamiento se mantiene) |
| `className` | `string` | — | Se añade después del nombre de clase del componente |

## Accesibilidad

El comportamiento de desplazamiento lo proporciona el núcleo del motor y la vista conserva la capacidad de recibir foco y de desplazarse con el teclado. La barra de desplazamiento se calcula a partir de la geometría medida de la vista y del contenido; al arrastrar con rapidez, el control deslizante de la barra puede ir un fotograma por detrás.

Consulta el comportamiento de desplazamiento del motor en la [guía de desplazamiento](/guide/scrolling).
