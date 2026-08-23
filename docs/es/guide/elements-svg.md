---
title: "Gráficos vectoriales: Path y SVG"
description: Contornos vectoriales con Path y el subconjunto de documentos SVG — sintaxis d, escalado con viewBox, trazo e iconos con currentColor.
---

# Gráficos vectoriales: Path y SVG

Los gráficos vectoriales de pingo son una capacidad de primera clase pintada por el motor: las
rutas existen como recursos inmutables en el lado del Core, y dibujar el mismo icono 50 veces
sigue usando una sola geometría. Hay dos entradas: `Path` acepta directamente datos de path SVG;
`Svg` acepta un documento completo parseado con `createSvg` / `loadSvg`. Las vistas previas de
abajo se renderizan en vivo con el motor, y el color de los iconos sigue el tema del sitio.

:::preview elements-svg-icon
:::

## Path: un único contorno

```tsx
import { createElement, Path, View } from "@dopejs/pingo";

createElement(View, {
  style: { color: "#3157dfff" }, // el contorno se pinta en el color del nodo y se hereda como el texto
  children: createElement(Path, {
    d: "M20 6 9 17l-5-5",
    viewBox: [0, 0, 24, 24],
    width: 24,
    height: 24,
    strokeWidth: 2,
  }),
});
```

- `d` admite la sintaxis completa de path SVG (`M L H V C S Q T A Z` y sus formas relativas en
  minúscula); los arcos `A` se convierten a bézier cúbicas al parsear, así que el Core no necesita
  un tipo de curva aparte.
- `viewBox` es la caja del espacio de autor y al pintar se escala a la caja del nodo: el mismo
  recurso sirve directamente en nodos de 16 px y de 48 px, sin conversiones por parte del
  llamador.
- Sin `strokeWidth` se rellena el contorno; con un valor distinto de cero se traza con ese ancho
  (cap/join redondeados).
- `geometryTransform` se hornea en los puntos de la geometría antes de la codificación (en un
  documento SVG, la transformación de un grupo mueve la figura y no la caja en la que está), y es
  otra cosa distinta del `transform` visual del nodo.

:::preview elements-path
:::

## Svg: subconjunto de documentos

`createSvg(markup)` usa un parser escrito a mano en lugar de `DOMParser`: el motor debe producir
geometría idéntica en el navegador, en el Worker y en las pruebas diferenciales headless, y
`DOMParser` no existe en el Worker. El subconjunto es justo lo que los conjuntos de iconos
contienen en la práctica:

- Elementos de forma: `path` `circle` `ellipse` `rect` `line` `polyline` `polygon`;
- Elementos de estructura: `svg` `g` `title` `desc` `defs` `metadata`;
- Atributos: `fill` `stroke` `stroke-width` `fill-rule` `transform`
  (`translate`/`scale`/`rotate`/`matrix`; skew no está en el subconjunto).

Los elementos fuera del subconjunto se **rechazan por nombre** lanzando `PingoSvgError`: el
llamador sabe con exactitud qué se perdió, en lugar de enfrentarse a una caja en blanco. Los
colores CSS con nombre también se rechazan: una media tabla de colores dejaría unos documentos
correctos y otros en negro sin avisar. Los colores hexadecimales, `none`, `transparent` y
`currentColor` sí están en el subconjunto; `currentColor` se resuelve como «heredar el color del
nodo», de modo que los iconos pueden cambiar de color con el tema igual que el texto (como hace la
vista previa).

El componente `Svg` expande el documento en **un nodo path por forma**, superponiendo las formas
con posicionamiento absoluto; una forma que se rellena y se traza se convierte en dos nodos: el
relleno y el trazo son dos pintados, no dos mitades de un mismo nodo.

```ts
import { createSvg, loadSvg, Svg } from "@dopejs/pingo";

const icon = createSvg(`<svg viewBox="0 0 24 24" stroke="currentColor" …>…</svg>`);
createElement(Svg, { source: icon, width: 24, height: 24, style: { color: "#3157df" } });

const remote = await loadSvg("/assets/logo.svg");
```

Para acceso programático, `PingoSvg.shapes` da para cada forma su `d`, `transform`, relleno/trazo
y `fillRule`; `shapeData(name, attributes)` convierte un único elemento de forma en los datos de
path equivalentes.

## Props (Path)

| Prop                | Tipo                                                        | Valor predeterminado | Descripción                                                             |
| ------------------- | ----------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------- |
| `d`                 | `string`                                                    | —                    | Datos de path SVG (obligatorio; sólo sintaxis de ruta, no un documento) |
| `viewBox`           | `readonly [number, number, number, number]`                 | —                    | Caja del espacio de autor, escalada a la caja del nodo                  |
| `strokeWidth`       | `number`                                                    | —                    | Distinto de cero: trazar en lugar de rellenar                           |
| `fillRule`          | `"nonzero" \| "evenodd"`                                    | `"nonzero"`          | Regla de relleno                                                        |
| `geometryTransform` | `readonly [number, number, number, number, number, number]` | matriz identidad     | Transformación horneada en la geometría antes de la codificación        |

## Props (Svg)

| Prop     | Tipo       | Valor predeterminado | Descripción                                                  |
| -------- | ---------- | -------------------- | ------------------------------------------------------------ |
| `source` | `PingoSvg` | —                    | Documento parseado con `createSvg` / `loadSvg` (obligatorio) |

Ambos heredan las [CommonProps](/api) (`width`/`height`, eventos, props semánticas, etc.).

## Accesibilidad

Los gráficos vectoriales no tienen semántica por sí mismos. Los iconos decorativos no necesitan
anotación; a un botón de icono clicable dale `semanticRole: "button"` y `semanticLabel`, véase
[accesibilidad](/guide/accessibility).
