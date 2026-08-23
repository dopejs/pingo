---
title: SCSS / Less
description: "Escribir hojas de estilo de pingo con SCSS o Less: pipeline de compilación en tiempo de build, plugin de Vite, límites de seguridad y diagnóstico de errores."
---

# SCSS / Less

El subconjunto de CSS de pingo (véase la [guía de estilos](/guide/styling)) sólo acepta en tiempo
de ejecución texto CSS u objetos. Si quieres la experiencia de autoría de variables, mixins,
`@use` / import, usa la **compilación en tiempo de build**: SCSS/Less se compila a CSS en el lado
de Node con `@dopejs/pingo-style-preprocess`, se valida después con el `compileStyleSheet`
existente y se genera un módulo JavaScript que exporta por defecto un `PingoStyleSheet`.

**Ni Sass ni Less entran en el bundle del navegador, la facade o el Core**: en tiempo de ejecución
no hay ningún preprocesador, sólo el compilador CSS ligero que ya existía. Los límites del
subconjunto tampoco se amplían por ello: selectores de descendiente, `@media`, `var()`, `calc()`,
`em/rem/vw/vh`, etc. siguen rechazándose con los diagnósticos actuales, haciendo fallar el build
en lugar de pasar en silencio.

## Hay que separar las dos semánticas de importación

### Estilos DOM normales (nativos de Vite)

```ts
import "./site.scss";
import "./probe.less";
```

Esta ruta es la capacidad de preprocesado de CSS que Vite trae de serie; produce **CSS para el
DOM**, inyectado o extraído por Vite. Sólo es aplicable a páginas DOM como el sitio de
documentación o la carcasa de Storybook, **no produce un `PingoStyleSheet`**, y no debe usarse
para estilos dentro del canvas.

### Hojas de estilo de pingo (`?pingo-style`)

```ts
import { createHostedCanvasRoot } from "@dopejs/pingo";
import buttonSheet from "./button.scss?pingo-style";
import themeSheet from "./theme.less?pingo-style";

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [buttonSheet, themeSheet],
});
```

`?pingo-style` es una frontera de tipos explícita: en tiempo de build se preprocesa primero y se
valida después contra el subconjunto de CSS; el módulo ESM generado exporta por defecto un
`PingoStyleSheet` y **no inyecta ningún CSS en el DOM**.

## Plugin de Vite

Instala el paquete de herramientas Node-only (requiere Node >= 22.12, Vite ^8):

```sh
pnpm add -D @dopejs/pingo-style-preprocess
```

Regístralo en `vite.config.ts`:

```ts
import { pingoStylePreprocess } from "@dopejs/pingo-style-preprocess/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    pingoStylePreprocess({
      // opcional: load paths de Sass / paths de Less adicionales
      scssLoadPaths: ["styles"],
      lessPaths: ["styles"],
      // opcional: las dependencias deben caer dentro de estos directorios
      // (por defecto sólo el directorio del entry y los load paths)
      allowRoots: ["src", "styles"],
    }),
  ],
});
```

Las declaraciones de tipos las proporciona la entrada `./client` del paquete; basta con
referenciarla una vez en `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["@dopejs/pingo-style-preprocess/client"]
  }
}
```

Convenciones de comportamiento del plugin:

- Sólo coincide con el query flag exacto `pingo-style` junto a la extensión `.scss` / `.less`; el
  resto de archivos no se ve afectado.
- Aísla la pipeline nativa de CSS de Vite mediante un virtual module: no hay doble preprocesado ni
  inyección de CSS en el DOM.
- El entry y todos sus partial/import entran en el watch graph: **cambiar un token o un mixin
  dispara HMR y la recompilación de producción**, sin borrar cachés a mano.
- Cualquier diagnóstico de nivel error hace fallar el build; los warnings se emiten con su
  posición de origen. Si la compilación falla durante HMR, se conserva el último módulo confirmado
  y se notifica el error en el dev server.
- El módulo generado valida `CSS_SUBSET_VERSION` al inicializarse: si la facade en tiempo de
  ejecución y la validación de build usan versiones distintas del subconjunto, el módulo lanza al
  cargarse, sin dejar que dos semánticas convivan.
- Los tres entornos (dev, production y SSR) generan hojas de estilo con semántica coherente.

## API de compilación en Node

Los sistemas de build que no son Vite (CLI, codegen) pueden usar directamente la API de Node:

```ts
import {
  compileLessString,
  compilePingoStyleFile,
  compileScssString,
  createStyleSheetFromLess,
  createStyleSheetFromScss,
} from "@dopejs/pingo-style-preprocess";
```

- `compileScssString(source, options)`: síncrona, por lo que **sólo procesa código fuente sin
  imports**; si hay imports devuelve el diagnóstico `file-api-required`.
- `compileLessString(source, options)`: asíncrona (el `render` de Less es una Promise); sólo
  resuelve imports relativos cuando se proporciona un `sourceName` con ruta absoluta.
- `compilePingoStyleFile(filename, options)`: API de archivo asíncrona, la que usa el plugin de
  Vite; la base de resolución relativa es explícita y el grafo de dependencias queda completo.
- La familia `compile*` **no lanza excepciones** ante errores de la entrada del autor: devuelve
  `styleSheet: null` y diagnostics ordenados de forma estable; `createStyleSheetFromScss` /
  `createStyleSheetFromLess` son envoltorios convenientes que sí lanzan: los errores del autor se
  lanzan unificados como `StylePreprocessError` conservando todos los diagnostics.

El `StylePreprocessResult` devuelto incluye `cssText`, `styleSheet`, `diagnostics` y
`dependencies` (lista completa de archivos dependientes, utilizable para montar tu propio watch).

## Source maps y diagnóstico de errores

Cada diagnóstico lleva una marca de fase:

| `stage`       | Origen                                                              |
| ------------- | ------------------------------------------------------------------- |
| `"scss"`      | Excepción de compilación de Sass (error de sintaxis, variable sin definir, etc.) |
| `"less"`      | Rejection de la compilación de Less                                  |
| `"pingo-css"` | Diagnóstico de `compileStyleSheet` cuando el producto excede el subconjunto de CSS |

Ambos compiladores activan source maps, y las posiciones generadas de los diagnósticos de CSS de
pingo se **mapean con el mejor esfuerzo de vuelta al archivo SCSS/Less original con línea y
columna** (`sourceLocation`); cuando no se puede mapear se conserva la posición generada
(`generatedLocation`) y el nombre del entry, sin inventar posiciones originales. Los diagnósticos
se ordenan de forma estable por posición generada y code, de modo que la salida de CI y los
snapshots son reproducibles.

## Límites de seguridad

El preprocesador ejecuta código del autor en tiempo de build, así que por defecto se endurece:

- **Sass**: no se habilitan custom importers, custom functions ni el Node package importer; sólo se
  aceptan dependencias `file:`.
- **Less**: `javascriptEnabled: false` fijo, sin plugins, y un pre-escaneo rechaza `@plugin`; no se
  permiten importaciones HTTP(S) ni relativas a protocolo.
- **Límites comunes**: tras canonicalizar, las dependencias deben quedar dentro de las allow roots
  (directorio del entry + load paths explícitos); se rechazan escapes por symlink, dependencias que
  no sean archivos y dependencias remotas. El CSS compilado pasa primero por un límite de
  1.048.576 code units antes de la validación del subconjunto; el entry, el número de dependencias
  y el total de bytes de dependencias tienen presupuestos explícitos, y excederlos produce errores
  de build estables.
- Las versiones de los compiladores se fijan con el lockfile, y el CSS, los diagnostics y la lista
  de dependencias de los fixtures tienen snapshots de reproducibilidad; actualizar Sass/Less
  requiere revisar explícitamente las diferencias de salida.

Estas restricciones sólo atan a la toolchain de `?pingo-style`; los `.scss` / `.less` normales del
DOM siguen la configuración propia de Vite.

## Funciones de color

Los preprocesadores suelen emitir funciones de color, y el subconjunto las soporta: `rgb()` /
`rgba()` / `hsl()` / `hsla()` (tanto la forma legacy con comas como la moderna con espacios y
barra), normalizadas uniformemente a RGBA de 8 bits. Las salidas fuera de este conjunto —
`color(display-p3 ...)`, propiedades personalizadas de CSS, `calc()` — siguen haciendo fallar el
build.
