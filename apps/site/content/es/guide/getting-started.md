# Inicio rápido

## Instalación

```sh
pnpm add @dopejs/pingo
```

La aplicación solo depende del paquete `@dopejs/pingo`. `@dopejs/pingo-host`, `@dopejs/pingo-jsx` y otros son paquetes de implementación interna,
no forman parte del contrato público: el [escáner de migración](/guide/migration) rechazará los imports directos de estos.

## Montar el primer canvas

```tsx
import { createHostedCanvasRoot } from "@dopejs/pingo";

const canvas = document.querySelector<HTMLCanvasElement>("#app")!;
canvas.width = 800;
canvas.height = 600;

const root = await createHostedCanvasRoot(canvas);

root.render(
  <container width={800} height={600} backgroundColor="#ffffffff" padding={24}>
    <text value="Hello pingo" fontSize={24} lineHeight={32} color="#1f2329ff" />
  </container>,
);
```

`createHostedCanvasRoot` detecta automáticamente las capacidades del navegador y elige la ruta de transporte entre SharedArrayBuffer, postMessage y Canvas2D del hilo principal; no necesitas escribir ramas de respaldo. `root.mode` devuelve la ruta realmente seleccionada.

## Usar TSX

Configura `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@dopejs/pingo"
  }
}
```

Después puedes escribir:

```tsx
function OrderRow({ index }: { index: number }) {
  return (
    <container width={480} height={32} padding={[6, 12, 6, 12]}>
      <text value={`订单 #${index}`} fontSize={13} lineHeight={20} />
    </container>
  );
}

root.render(<OrderRow index={1} />);
```

## Elementos del host

El motor solo tiene cinco elementos integrados, que se corresponden directamente con los nodos de la escena; no existe cascada CSS ni selectores:

| Elemento       | Uso                                                                          |
| -------------- | ---------------------------------------------------------------------------- |
| `container`    | Agrupación genérica, fondo, padding, transformaciones                        |
| `text`         | Ejecución de texto (shaping, salto de línea, geometría del caret desde Core) |
| `scroll`       | Contenedor desplazable propiedad de Core                                     |
| `virtualList`  | Lista virtual con ventana planificada por Core                               |
| `editableText` | Primitiva de texto editable                                                  |

`TextField` y `TextArea` son widgets compuestos sobre `editableText` (borde, estado de error),
no introducen una nueva ruta de entrada.

## Estado y efectos

```tsx
import { signal, useEffect, useSignal, useState } from "@dopejs/pingo";

function Counter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCount((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return <text value={`已过 ${count} 秒`} />;
}
```

Primitivas reactivas disponibles: `signal`, `computed`, `effect`, `batch`, `untracked`,
y los hooks `useState`, `useSignal`, `useMemo`, `useCallback`, `useRef`, `useEffect`.

::: warning Sin lectura síncrona del layout
No se admite la lectura síncrona del layout en el Worker al estilo `useLayoutEffect`: el layout ocurre en otro reloj.
Cuando necesites resultados de layout, usa contratos asíncronos; no intentes leer geometría de forma síncrona durante el renderizado.
:::

## Observar el estado de ejecución

```ts
const root = await createHostedCanvasRoot(canvas, {
  onFrame: (report) => {
    console.log(report.commands, report.displayListBytes, report.core?.sceneNodes);
  },
  onHostError: (error) => report(error),
});
```

`onFrame` proporciona en cada frame el número de comandos, los bytes de la DisplayList, así como los recuentos de dominios sucios, la carga de trabajo de layout y el hash de imagen del lado de Core;
es el dato de primera mano para el diagnóstico de rendimiento. Más información en [Diagnóstico](/guide/diagnostics).

## Recorrido de capacidades

Sobre los cinco elementos integrados, pingo ofrece además tres capas de capacidades orientadas al autor:

- [Componentes básicos](/guide/elements): elementos a nivel de motor como View/Text/Image, Input/TextArea, SVG/Path.
- [Estilos](/guide/styling): subconjunto de CSS versionado — selectores de clase, estados de interacción, límites explícitos de cascada y herencia;
  cuando necesites variables y mixins, usa la [pipeline de SCSS / Less](/guide/scss-less) en tiempo de compilación.
- [Biblioteca de componentes UI](/components): `@dopejs/pingo-ui`, componentes terminados alineados con shadcn/ui, todos renderizados en canvas.

## Siguientes pasos

- [Descripción general de la arquitectura](/guide/architecture): cómo se reparten el trabajo Shell y Core
- [Scroll y virtualización](/guide/scrolling), [Texto y edición](/guide/editing)
- [Playground](/playground): demostración interactiva en tiempo real
