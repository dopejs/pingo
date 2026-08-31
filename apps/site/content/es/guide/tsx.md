---
title: TSX
description: Escribir componentes pingo en TSX y convivir con React en el mismo repositorio.
---

# Escribir pingo en TSX

## Configuración

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@dopejs/pingo"
  }
}
```

`jsx` selecciona el runtime automático de TypeScript; `jsxImportSource` lo apunta al
`jsx-runtime` de pingo en lugar del de React. El nombre `react-jsx` es el del modo de
transformación y no tiene relación con React.

## Qué puede ser una etiqueta

```tsx
import { createContext, memo, Text, useState, View, type PingoNode } from "@dopejs/pingo";
import { Button } from "@dopejs/pingo-ui";

const Theme = createContext("light");

function Row({ label }: { readonly label: string }): PingoNode {
  const [count, setCount] = useState(0);
  return (
    <View width={240} padding={8}>
      <text value={`${label} ${count}`} />
      <Button onPress={() => setCount(count + 1)}>Sumar</Button>
    </View>
  );
}

root.render(
  <Theme.Provider value="dark">
    <Row label="Clics" />
  </Theme.Provider>,
);
```

Las cinco formas son válidas:

| Forma                           | Ejemplo                                               |
| ------------------------------- | ----------------------------------------------------- |
| Elementos nativos               | `<container>`, `<text>`, `<scroll>`, `<editableText>` |
| Componentes base                | `<View>`, `<Text>`, `<Image>`, `<Input>`              |
| Componentes de función propios  | `<Row label="…" />`                                   |
| Componentes envueltos en `memo` | todos los de `@dopejs/pingo-ui`                       |
| Proveedores de contexto         | `<Theme.Provider value={…}>`                          |

::: warning Un componente con hooks se monta, no se llama
`Row({ label })` pasa la comprobación de tipos pero falla con
`hooks may only run in a function component`: los hooks necesitan el ámbito de componente
que crea el reconciliador. Escribe `<Row label="…" />`.
:::

Puedes anotar el tipo de retorno como `PingoNode`. Incluye `undefined`, pero la
compatibilidad con las etiquetas JSX la declara el `JSX.ElementType` del motor, así que no
hace falta cambiar la firma.

## Convivir con React

Es habitual tener ficheros TSX de React y de pingo en el mismo repositorio: por ejemplo la
carcasa en React y las zonas de alto rendimiento dibujadas por pingo.

### El mecanismo es la declaración en la cabecera del fichero

`jsxImportSource` se aplica **por fichero**. Escribe esto en la primera línea de un fichero
pingo:

```tsx
/** @jsxImportSource @dopejs/pingo */
```

El `tsconfig.json` del proyecto conserva su configuración de React y solo los ficheros con
esa línea usan el runtime de pingo. `tsc`, esbuild/Vite y babel lo respetan.

**Las otras dos ideas no funcionan**, medido:

| Enfoque                                                        | Resultado                                                                                                                               |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Un `tsconfig.json` en el directorio con otro `jsxImportSource` | `tsc` lo ignora por completo y Vite sí lo aplica: la build y el typecheck discrepan                                                     |
| Excluir por nombre de fichero con `exclude`                    | `exclude` solo afecta a la selección de ficheros raíz; en cuanto un fichero React lo `import`a, vuelve a entrar y se compila como React |

Para que el nombre del fichero gobierne de verdad la cadena de herramientas hacen falta
composite project references: el proyecto pingo emite `.d.ts` y el proyecto React consume
declaraciones en lugar de fuentes.

Olvidar esa línea no rompe en silencio, falla al compilar:

```
error TS2322: Type 'Element' is not assignable to type 'PingoNode'.
error TS2786: 'View' cannot be used as a JSX component.
```

### El sufijo del nombre es una convención

Cuando los dos tipos de fichero conviven en un directorio, conviene dar a los de pingo un
sufijo como `scene.pingo.tsx`: se distinguen en el listado y sirven para configuraciones por
nombre como los `overrides` de babel. Es una convención para personas y herramientas de
configuración, y **no sustituye a la cabecera**. Si el directorio entero es pingo, el propio
directorio es la señal y el sufijo solo añade ruido.

### La frontera es la frontera del fichero

Un fichero solo tiene un tipo de JSX, así que **no puedes escribir etiquetas pingo dentro de
un componente React**. El fichero pingo exporta la escena y el fichero React la importa:

```tsx
/** @jsxImportSource @dopejs/pingo */
// scene.pingo.tsx
import { Text, View, type PingoNode } from "@dopejs/pingo";

export function scene(label: string): PingoNode {
  return (
    <View width={240} height={80} padding={12}>
      <Text value={label} />
    </View>
  );
}
```

### Montar con `PingoContainer`

```tsx
// App.tsx — las etiquetas de este fichero son de React
import { PingoContainer } from "@dopejs/pingo/react";

import { scene } from "./scene.pingo";

export function App() {
  return <PingoContainer scene={scene("Hello")} style={{ height: 320, width: 480 }} />;
}
```

La escena llega por la prop `scene` y no como children, porque las etiquetas de este fichero
son de React y aquí no se pueden escribir children de pingo.

`PingoContainer` crea el canvas él mismo en vez de dejar que React lo renderice y tomar una
ref. Es **obligatorio**: el root transfiere el canvas a un OffscreenCanvas, la transferencia
es permanente y React StrictMode ejecuta los efectos dos veces en desarrollo, de modo que un
canvas propiedad de React se entregaría a un segundo root y fallaría:

```
this canvas already transferred control to an OffscreenCanvas and cannot host
a second root; create a new canvas element per root
```

El canvas que crea el componente se descarta junto con el montaje descartado, así que esto no
ocurre. El tamaño tampoco requiere atención: el root sigue la caja de su propio canvas, basta
con dimensionar el contenedor por CSS.

Cuando necesites el root (control de scroll, callbacks de diagnóstico) usa `onRoot`; para un
fallo de arranque, `onStartupError`. Los errores en ejecución siguen llegando a
`options.onHostError`.

### Los dos árboles no comparten estado

El state y el context de React no llegan al árbol de componentes de pingo, ni al revés. Son
dos reconciliadores independientes. La comunicación entre ambos es flujo de datos normal:
React calcula el valor y lo pasa como `scene`; pingo devuelve resultados por callbacks de
eventos.

## Este repositorio es el ejemplo

`apps/site` es una aplicación React que además contiene 73 previsualizaciones de componentes
escritas en TSX de pingo. El directorio donde conviven es
[`apps/site/src/interop`](https://github.com/dopejs/pingo/tree/main/apps/site/src/interop),
y su test se ejecuta bajo `StrictMode`.
