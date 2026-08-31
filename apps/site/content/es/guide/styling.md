---
title: Estilos
description: "El subconjunto de CSS de pingo: selectores de clase, cascada y especificidad, límites de la herencia, y las convenciones de tema y sobreescritura de pingo-ui."
---

# Estilos

Los estilos de pingo son un **subconjunto de CSS versionado** (actualmente 1.6.0): el texto CSS
se parsea y calcula en la Shell, y el Core sólo consume valores tipados normalizados; el texto CSS
y la coincidencia de selectores nunca entran en el Core. La tabla completa de propiedades
soportadas está en [soporte del subconjunto de CSS](/guide/style-support); esta página cubre el uso y
los límites.

## Crear y registrar hojas de estilo

Compila texto CSS con `createStyleSheet` (lanza `StyleSheetCompileError` ante entrada inválida) y
regístralo al crear el root:

```tsx
import { createHostedCanvasRoot, createStyleSheet } from "@dopejs/pingo";

const sheet = createStyleSheet(
  `
  .card {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 16px;
  }
  `,
  { sourceName: "app.css" },
);

const root = await createHostedCanvasRoot(canvas, { styleSheets: [sheet] });

root.render(
  <container className="card" width={320}>
    <text value="你好" fontSize={14} />
  </container>,
);
```

Si no quieres manejar excepciones puedes usar `compileStyleSheet`: no lanza ante entrada del autor
y devuelve diagnostics estables. La hoja de estilo también puede escribirse en forma de objeto
tipado (`PingoStyleSheetObject`), cuyas claves son selectores de clase con o sin punto inicial y
cuyos valores son `PingoStyle`:

```ts
const sheet = createStyleSheet({
  "card": { backgroundColor: "#ffffffff", borderRadius: 8, padding: 16 },
  "card:hover": { backgroundColor: "#f5f5f5ff" },
});
```

Los elementos reciben clases mediante la prop `className` (varios nombres de clase separados por
espacios ASCII) y declaraciones en línea mediante la prop `style` (`PingoStyle`, parseada por la
Shell antes de llegar al Core).

## Selectores y cascada

El subconjunto sólo admite **selectores de clase sobre el mismo nodo**, más cuatro pseudoclases de
estado interactivo:

- Clase simple `.card`; clase compuesta `.pui-card.pui-dark` (sólo coincide si el nodo tiene todas
  las clases).
- Los estados `:hover`, `:active`, `:focus`, `:focus-visible`, combinables con clases, p. ej.
  `.btn:hover`.

No se admiten: selectores de elemento, combinadores de descendiente/hijo, `@media` / `@supports` /
`@keyframes`, `var()` / `calc()`. Las únicas unidades de longitud son `px` y `%` (`em` / `rem` /
`vw` / `vh` se rechazan); los colores se escriben en hex o con `rgb()` / `rgba()` / `hsl()` /
`hsla()` (se aceptan ambas sintaxis, la antigua y la nueva); las palabras clave de color (como
`red`) no están soportadas.

Las reglas de cascada son isomorfas a las de CSS pero más simples:

1. **Especificidad = número de clases + número de estados.** `.pui-card.pui-dark` (2) gana a
   `.card` (1).
2. **A igual especificidad manda el orden de fuente**: ganan las hojas registradas más tarde y,
   dentro de una misma hoja, las reglas posteriores.
3. **La prop `style` en línea vence a cualquier regla de hoja de estilo**; las props directas del
   elemento (como `width`, `backgroundColor`) tienen la máxima prioridad y vencen a `style`.

Ojo con el corolario del punto 2: que una sobreescritura funcione depende del **orden de registro
de las hojas de estilo**, no del orden de las clases dentro de la cadena `className`.

## Herencia y límites del estilo calculado

Sólo unas pocas propiedades se heredan: `color`, `visibility`, `font-family` / `font-size` /
`font-weight` / `font-style`, `line-height`, `text-align`, `white-space`, `overflow-wrap`,
`pointer-events`, `cursor`. Todas las demás (incluidas todas las de layout) parten del valor
inicial en cada nodo: si no se escribe, no existe; no hay nada parecido a «heredar el ancho del
padre».

Cada propiedad declara su dominio de invalidación (layout / pintado / hit testing / semántica) en
el schema de fuente única. Cambiar `opacity` no dispara reflow; cambiar `width` sí. Es el mismo
mecanismo que el modelo de invalidación de la [arquitectura](/guide/architecture).

### Propiedades restringidas en declaraciones de estado interactivo

En las reglas de estado (como `.btn:hover`) sólo se permiten propiedades de pintado:
`background-color`, `color`, `opacity`, los `border-*-color` de cada lado, `border-radius`,
`box-shadow`, `visibility`, `transform` / `transform-origin`, `pointer-events`, `cursor`. Escribir
propiedades de layout en una regla de estado se rechaza en tiempo de compilación: un cambio de
estado no puede disparar cambios de layout.

## Principales desviaciones respecto a CSS

El subconjunto renuncia deliberadamente a la compatibilidad CSS completa. Desviaciones clave
(lista completa en [soporte del subconjunto de CSS](/guide/style-support)):

- El bloque contenedor de `position: absolute` es el **padre**, no el ancestro posicionado más
  cercano; no existe `position: relative`, el desplazamiento visual se hace con `transform`.
- No hay `flex-wrap`: el contenedor flex es de una sola línea y el desbordamiento del eje
  principal se recorta o se desplaza.
- Los items flex no tienen tamaño mínimo automático y pueden comprimirse hasta 0 (equivalente a
  escribir `min-width: 0` en el navegador); `min-width: auto` / `min-height: auto` fallan
  directamente en compilación.
- Con tamaño del eje principal indefinido, los porcentajes se resuelven a `0` en lugar del `auto`
  de CSS.
- `box-shadow` sólo admite sombras exteriores, como máximo 4 capas por nodo; `inset` se rechaza.
- `z-index` sólo reordena de forma estable entre hermanos; no hay stacking context.

## Convenciones de tema y sobreescritura de pingo-ui

La piel de la biblioteca `@dopejs/pingo-ui` es justamente una hoja de estilo compilada con los
mecanismos anteriores:

```ts
import { createHostedCanvasRoot, createStyleSheet } from "@dopejs/pingo";
import { createPingoUiStyleSheet } from "@dopejs/pingo-ui";

const myOverrides = createStyleSheet(`
  .pui-button { border-radius: 4px; }
`);

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [createPingoUiStyleSheet(), myOverrides], // el orden no puede invertirse
});
```

- **`createPingoUiStyleSheet()` crea una hoja inmutable e independiente para cada root**.
- **La hoja del usuario debe registrarse después de la hoja de pingo-ui**: a igual especificidad
  manda el orden de fuente, así que lo escrito después es lo que se aplica. La prop `className`
  del componente se añade tras las clases propias del componente (p. ej.
  `pui-input pui-input--disabled mine`), pero si la sobreescritura funciona sólo depende del
  orden de registro anterior.
- Para elevar la prioridad de una sobreescritura, usa clases compuestas que aumenten la
  especificidad (como `.pui-button.mine`), no la posición de escritura.

### Tema claro y oscuro

```ts
import { setTheme, useTheme } from "@dopejs/pingo-ui";

setTheme("dark"); // todos los componentes suscritos se vuelven a renderizar
useTheme(); // se lee y suscribe dentro del render del componente
```

El tema es un signal a nivel de módulo: `useTheme()` se suscribe automáticamente durante el
render del componente, y `setTheme` dispara el re-render de todos los componentes suscritos. El
modo oscuro se implementa con compound class: con el tema dark los componentes llevan la clase
marca `pui-dark`, y en la piel coinciden las reglas compuestas `.pui-x.pui-dark` (como
`.pui-card.pui-dark`).

**La personalización de marca es una operación de build**: para crear un preset nuevo se
sobreescriben los tokens con
`@use "@dopejs/pingo-ui/styles/tokens" with ($primary: ...)` y se recompila la piel de los
componentes mediante el plugin de Vite de `@dopejs/pingo-style-preprocess`: cambiar el color de
marca = recompilar, no es conmutable en tiempo de ejecución. Los colores de los valores de token
igualmente sólo pueden escribirse en hex o con `rgb()` / `rgba()` / `hsl()` / `hsla()`. La
pipeline de SCSS/Less se describe en la [guía de SCSS / Less](/guide/scss-less).
