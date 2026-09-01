---
title: Typography
description: Componentes tipográficos para títulos, texto y citas, renderizados sobre el canvas de pingo.
---

# Typography

Un conjunto tipográfico: los títulos `H1`–`H4`, el párrafo `P`, y además `Lead`, `Large`,
`Small`, `Muted`, `Blockquote` e `InlineCode`. La vista previa la renderiza el motor de
pingo en tiempo real y sigue el cambio de tema claro/oscuro del sitio.

:::preview typography-scale
:::

## Uso

```tsx
import { H1, Lead, P } from "@dopejs/pingo-ui";

root.render(
  <View style={{ flexDirection: "column" }}>
    <H1>Motor de renderizado</H1>
    <Lead>Escribe TSX sobre un canvas, sin generar DOM.</Lead>
    <P>Un párrafo de texto.</P>
  </View>,
);
```

::: warning No son contenedores que envuelven
La tipografía de shadcn aplica estilos a elementos `h1`/`p` reales y deja que la cascada
lleve el tamaño de letra por todo el subárbol. En pingo las métricas de texto **se
resuelven por nodo y no se heredan**: envolver un texto en `H1` no lo agranda. Cada
componente es un nodo de texto y `children` solo acepta una cadena.
:::

## Ejemplos

### Títulos y texto

`H1`–`H4` corresponden a los cuatro tamaños de título de shadcn; `P` es el párrafo de
16px/24px. La vista previa de arriba los muestra en orden.

### Cita y código en línea

`Blockquote` es una caja con una regla a la izquierda e `InlineCode` es un fragmento con
fondo. Ambos son dos capas —la caja lleva el borde y el relleno, el nodo de texto lleva el
tamaño y el grosor— por la razón del aviso anterior.

:::preview typography-blocks
:::

### Separar el nivel anunciado del escalón visual

`H1` se reporta como nivel 1 por defecto. Cuando el esquema de la página exige empezar en
nivel 2 pero visualmente quieres el tamaño de `H1`, usa `level`:

```tsx
<H1 level={2}>Visualmente H1, en el esquema de segundo nivel</H1>
```

## Props

### Títulos (`H1` / `H2` / `H3` / `H4`)

| Prop        | Tipo                         | Por defecto               | Descripción                             |
| ----------- | ---------------------------- | ------------------------- | --------------------------------------- |
| `children`  | `string`                     | —                         | Texto del título (obligatorio)          |
| `level`     | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | el escalón del componente | Sobrescribe el nivel que se reporta     |
| `className` | `string`                     | —                         | Se añade tras las clases del componente |

### El resto

`P`, `Lead`, `Large`, `Small`, `Muted`, `Blockquote` e `InlineCode` solo aceptan
`children: string` y `className`.

| Componente   | Tamaño / interlineado | Uso                             |
| ------------ | --------------------- | ------------------------------- |
| `P`          | 16 / 24               | Párrafo de texto                |
| `Lead`       | 20 / 28               | Párrafo introductorio, atenuado |
| `Large`      | 18 / 28               | Texto un escalón enfatizado     |
| `Small`      | 14 / 20               | Texto secundario                |
| `Muted`      | 14 / 20               | Texto de apoyo atenuado         |
| `Blockquote` | 16 / 24               | Cita con regla a la izquierda   |
| `InlineCode` | 14 / 20               | Código en línea con fondo       |

## Accesibilidad

`H1`–`H4` llevan semántica `heading` y exportan `aria-level`. **Un encabezado sin nivel lo
anuncian como nivel 2 la mayoría de los lectores de pantalla**, así que H1 y H4 sonarían
igual: el nivel forma parte de estos componentes, no es opcional.

Los demás son texto puro y sin rol: el cuerpo no debería hacer que un lector de pantalla se
detenga en cada párrafo. Si necesitas darles significado, colócalos dentro de un contenedor
con `semanticRole` en vez de dar un rol al párrafo.
