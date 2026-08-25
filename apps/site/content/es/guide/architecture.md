# Descripción general de la arquitectura

## Propiedad en ambos lados

```
TSX / hooks          →  Flujo de mutaciones  →   Escena / Diseño / Pintado
(Shell de TypeScript)      binario, por lotes      (Núcleo Rust, wasm)
                                                    ↓
Reproductor Canvas2D  ←      DisplayList      ←    Picture
```

**El Shell posee el árbol de componentes y el núcleo posee la escena. Ambos no comparten objetos mutables.**
Toda la comunicación entre fronteras es un flujo binario versionado: little-endian, alineado a cuatro bytes, basado en instrucciones. El receptor completa las verificaciones de opcode, longitud, alineación, ID y aritmética antes de acceder a la memoria; la entrada malformada se rechaza de forma atómica en lugar de aplicarse parcialmente.

Esta frontera no es una optimización de rendimiento, sino un límite de corrección: incluso si los bytes normalmente provienen del propio codificador de este proyecto, el decodificador los trata como entrada no confiable y cuenta con cobertura de fuzzing.

## Doble reloj

El reloj de la UI (hilo principal) y el reloj de renderizado (Worker) son independientes entre sí:

- El hilo principal captura la entrada, ejecuta el árbol de componentes y envía tramas de mutación.
- El Worker controla la física de desplazamiento, la animación, el diseño y la composición.

**El estado estable de desplazamiento no llama al Shell.** Los datos faltantes se renderizan con marcadores de posición y se completan en tramas posteriores. Por lo tanto, si el hilo principal es bloqueado por código de negocio durante 200 ms, el desplazamiento y la animación siguen siendo continuos; este escenario está protegido por pruebas automáticas de inyección de fallos.

## Cadena de degradación

La detección de capacidades selecciona la ruta de transporte en orden; los tres niveles son funcionalmente equivalentes:

1. **SharedArrayBuffer** — requiere aislamiento entre orígenes (COOP/COEP)
2. **postMessage** — cuando no hay SAB
3. **Canvas2D en el hilo principal** — cuando no hay Worker / OffscreenCanvas

```ts
const root = await createHostedCanvasRoot(canvas, {
  transport: { preference: "sab" }, // preferencia opcional; aun así degradará si no se cumple
});
console.log(root.mode); // "sab" | "post-message" | "main-thread"
```

El [Playground](/playground) de este sitio es un ejemplo vivo: GitHub Pages no puede enviar cabeceras de respuesta COOP/COEP, así que en línea se ejecuta por la ruta postMessage, y el indicador de transporte en la parte superior de la página lo muestra fielmente.

## Modelo de invalidación

**La semántica de las props determina el dominio de invalidación**; el llamador no marca manualmente como sucio y no hay escapatoria `forceUpdate`.

Cada propiedad declara en un esquema de fuente única si afecta al diseño, al pintado, a la detección de impactos o a la semántica. Cambiar una `opacity` no dispara un reflujo; cambiar `width` sí lo hace. El mapa de bits de suciedad se mantiene por dominios, y `onFrame` expone el número de nodos sucios en cada dominio.

Esta elección es "invalidación más estrecha y agresiva + pruebas de propiedades como respaldo": el resultado del renderizado incremental debe coincidir píxel a píxel con el renderizado completo, y las pruebas diferenciales reducen los contraejemplos al caso de fallo mínimo.

## Representación de la escena

La escena dentro del núcleo es SoA (estructura de arreglos, en lugar de arreglo de estructuras):

- El ID del nodo incluye **generación**; la reutilización de ranuras no hace que un ID caducado vuelva a ser válido.
- Después del commit se mantiene el **orden topológico**: el nodo padre siempre aparece antes que los nodos hijos.
- Las ediciones estructurales se compactan una vez por commit, no una vez por mutación.
- Los resultados de diseño se comparan por lotes mediante SoA con doble búfer; en la ruta caliente no hay asignaciones de cierres ni de listeners por nodo.

## Backend conectable

El núcleo produce una DisplayList binaria plana; el backend es solo un reproductor. El backend Canvas2D es un bucle de arreglos tipados con asignación austera: **llamar de wasm a JS en cada pintado no es una ruta de renderizado aceptable**.

La misma DisplayList también alimenta un prototipo aislado de wgpu; las salidas de ambos se comparan con diferencias de píxeles.
La adopción o no de WebGPU es una decisión basada en datos; véase [ADR-0006](https://github.com/dopejs/pingo/blob/main/docs/adr/0006-webgpu-backend-decision.md).

## Determinismo

El tiempo, la fuente de aleatoriedad y el flujo de entrada son inyectables o reproducibles; la salida del núcleo no depende del orden de planificación de los hilos.
Los archivos `DOPR` graban en orden original los flujos de Mutation e Input, y pueden reproducirse de forma determinista fuera del navegador en un entorno headless; por ello, los problemas en línea se reproducen localmente, y los flujos de edición sensibles omiten explícitamente la grabación.

## Componentes y estilos

Sobre este núcleo hay tres capas de API orientadas a los autores:

- **Componentes básicos** — elementos a nivel de motor como View/Text/Image, Input/TextArea, SVG/Path, etc.; véase [componentes básicos](/guide/elements).
- **Estilos** — un subconjunto de CSS versionado que el Shell analiza (la tabla de soporte está [aquí](/style-support)), junto con el
  [pipeline de SCSS/Less](/guide/scss-less) en tiempo de compilación; el núcleo solo consume valores tipados ya normalizados y no analiza texto CSS.
- **Librería de componentes UI** — `@dopejs/pingo-ui`, componentes terminados alineados con shadcn/ui, todos renderizados en canvas;
  véase la [documentación de componentes](/components).

## Para profundizar

Los algoritmos completos, las estructuras de datos y los criterios de aceptación se encuentran en el [documento de diseño técnico](https://github.com/dopejs/pingo/blob/main/docs/design.md).
