# Visión de la arquitectura

## Propiedad a ambos lados

```
TSX / hooks          →  Mutation Stream  →   Scene / Layout / Paint
（TypeScript Shell）      binario, por lotes   （Rust Core，wasm）
                                                    ↓
Reproductor Canvas2D ←   DisplayList      ←    Picture
```

**La Shell posee el árbol de componentes; el Core posee el Scene. Ambos no comparten objetos
mutables.** Toda comunicación que cruza la frontera es un flujo binario versionado: little-endian,
alineado a cuatro bytes, instruccional; el receptor completa la validación de opcode, longitud,
alineación, ID y aritmética antes de acceder a la memoria, y la entrada malformada se rechaza de
forma atómica en lugar de aplicarse parcialmente.

Esta frontera no es una optimización de rendimiento, sino una frontera de corrección: aunque los
bytes suelan provenir del propio codificador del proyecto, el decodificador los trata como entrada
no confiable, con cobertura de fuzzing.

## Dos relojes

El reloj de UI (hilo principal) y el reloj de renderizado (Worker) son independientes:

- El hilo principal recolecta la entrada, ejecuta el árbol de componentes y envía fotogramas de
  Mutation.
- El Worker impulsa la física del scroll, las animaciones, el layout y la composición.

**El scroll en régimen permanente no llama a la Shell.** Los datos que faltan se renderizan con
marcadores de posición y se reconstruyen en fotogramas posteriores. Por eso, cuando el hilo
principal queda bloqueado 200 ms por código de negocio, el scroll y las animaciones siguen siendo
continuos; este escenario está protegido por pruebas automáticas de inyección de fallos.

## Cadena de degradación

La detección de capacidades elige el transporte en orden, con tres niveles funcionalmente
equivalentes:

1. **SharedArrayBuffer** — requiere aislamiento de origen cruzado (COOP/COEP)
2. **postMessage** — cuando no hay SAB
3. **Canvas2D en el hilo principal** — cuando no hay Worker / OffscreenCanvas

```ts
const root = await createHostedCanvasRoot(canvas, {
  transport: { preference: "sab" }, // preferencia opcional; si no se cumple, degrada igualmente
});
console.log(root.mode); // "sab" | "post-message" | "main-thread"
```

El [Playground](/playground) de este sitio es un ejemplo vivo: GitHub Pages no puede emitir las
cabeceras COOP/COEP, así que en producción se ejecuta por la vía postMessage, y el indicador de
transporte en la parte superior de la página lo muestra con fidelidad.

## Modelo de invalidación

**La semántica de cada prop decide el dominio de invalidación**; el llamador no marca suciedad a
mano y no existe ninguna vía de escape tipo `forceUpdate`.

Cada propiedad declara en el schema de fuente única si afecta al layout, al pintado, al hit
testing o a la semántica. Cambiar `opacity` no dispara reflow; cambiar `width` sí. Los mapas de
bits de suciedad se mantienen por dominio, y `onFrame` expone el número de nodos sucios de cada
dominio.

Esta elección es «invalidación agresivamente mínima + red de seguridad de pruebas de propiedades»:
el resultado del render incremental debe coincidir píxel a píxel con el render completo, y las
pruebas diferenciales reducen los contraejemplos al caso mínimo que falla.

## Representación del Scene

El Scene dentro del Core es SoA (array de estructuras convertido en estructuras de arrays):

- Los ID de nodo llevan **generación**: la reutilización de ranuras no reactiva ID obsoletos.
- Tras cada commit se mantiene el **orden topológico**: los padres siempre van antes que los hijos.
- Las ediciones estructurales compactan una vez por commit, no una vez por mutación.
- Los resultados de layout se comparan en lote con SoA de doble búfer; en la ruta caliente no hay
  cierres ni asignaciones de listeners por nodo.

## Backends conectables

El Core emite un DisplayList binario plano; los backends son meros reproductores. El backend
Canvas2D es un bucle de typed arrays que asigna con avaricia cero: **llamar una vez de wasm a JS
por cada pintado no es una ruta de renderizado aceptable**.

El mismo DisplayList también alimenta un prototipo aislado con wgpu, y las salidas de ambos se
comparan por diferencia de píxeles. Adoptar o no WebGPU es una decisión basada en datos; véase
[ADR-0006](/adr/0006-webgpu-backend-decision).

## Determinismo

El tiempo, la fuente aleatoria y el flujo de entrada son inyectables o reproducibles; la salida del
Core no depende del orden de planificación de los hilos. El archivo `DOPR` graba los flujos de
Mutation e Input en su orden original y puede reproducirse de forma determinista en un entorno
headless, fuera del navegador: los problemas en producción pueden así reproducirse en local, y los
flujos de edición sensibles se omiten explícitamente de la grabación.

## Componentes y estilos

Sobre este núcleo hay tres capas de API orientadas al autor:

- **Elementos básicos** — View/Text/Image, Input/TextArea, SVG/Path y otros elementos a nivel de
  motor; véase [elementos básicos](/guide/elements).
- **Estilos** — subconjunto de CSS versionado parseado en la Shell (tabla de soporte
  [aquí](/style-support)) y la [pipeline de SCSS/Less](/guide/scss-less) en tiempo de build; el
  Core sólo consume valores tipados normalizados, no parsea texto CSS.
- **Biblioteca de componentes UI** — `@dopejs/pingo-ui`, componentes terminados alineados con
  shadcn/ui, todos renderizados en canvas; véase la [documentación de componentes](/components).

## Profundizar

Los algoritmos completos, las estructuras de datos y los criterios de aceptación están en el
[documento de diseño técnico](/design).
