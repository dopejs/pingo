---
layout: home

hero:
  name: Pingo
  text: motor de renderizado canvas
  tagline: Núcleo Rust/WASM + capa TypeScript + backends conectables. Diseñado para interacción de alto rendimiento, scroll virtual nativo y edición de texto dentro del canvas, con componentes básicos, estilos CSS y una biblioteca de componentes UI alineada con shadcn.
  image:
    light: /pingo-mark.svg
    dark: /pingo-mark-dark.svg
    alt: Pingo
  actions:
    - theme: brand
      text: Primeros pasos
      link: /guide/getting-started
    - theme: alt
      text: Playground
      link: /playground
    - theme: alt
      text: GitHub
      link: https://github.com/dopejs/pingo

features:
  - title: Dos relojes; sin pérdida de fotogramas aunque el hilo principal se bloquee
    details: El reloj de UI y el reloj de renderizado son independientes. El scroll, las animaciones, el layout y la composición avanzan en bucle cerrado dentro del Worker; si el hilo principal se bloquea 200 ms, la imagen sigue siendo continua.
  - title: Scroll virtual nativo
    details: El árbol de sumas prefijas, la precarga con predicción de dirección y la reconstrucción de marcadores viven en el Core. La reproducción de 20.000 fotogramas sobre un fixture fijo de un millón de filas tiene un P95/P99 por debajo del microsegundo, y el scroll en régimen permanente no llama nunca a la Shell.
  - title: Edición nativa en canvas
    details: El caret, la selección, la selección por arrastre, la selección de palabra con doble clic, la composición IME, el posicionamiento de la ventana de candidatos, el portapapeles y deshacer/rehacer están implementados por el motor. La aplicación ya no crea controles HTML para la entrada.
  - title: La accesibilidad es parte de la arquitectura
    details: El Core exporta un árbol semántico que el host refleja como un árbol DOM sombra junto al canvas. Los lectores de pantalla funcionan y las pruebas E2E seleccionan elementos por role/label en lugar de comparar píxeles.
  - title: Determinismo y pruebas diferenciales
    details: Flujo binario versionado, relojes y fuentes aleatorias inyectables, grabación y reproducción, y oráculos diferenciales entre incremental y completo, optimizado y naíf, wasm y nativo.
  - title: Degradación automática, siempre con vía de escape
    details: SharedArrayBuffer → postMessage → Canvas2D en el hilo principal se elige automáticamente según las capacidades, con equivalencia funcional. La capa de migración admite despliegue gradual por página y reversión con un clic.
  - title: Componentes básicos listos para usar
    details: View/Text/Image, Input/TextArea, SVG/Path y otros elementos a nivel de motor corresponden directamente a nodos del Scene; el shaping de texto, la geometría del caret y la edición vienen del Core, sin ensamblar controles DOM.
  - title: Soporte de CSS y SCSS/Less
    details: "Subconjunto de CSS versionado, parseado en la Shell: selectores de clase, estados interactivos, herencia y estilos calculados con límites explícitos; SCSS/Less se compila y valida en tiempo de build, sin preprocesadores en el bundle del navegador."
  - title: Biblioteca de componentes UI alineada con shadcn
    details: "Los componentes de @dopejs/pingo-ui alinean su API y la semántica de su piel con shadcn/ui: Button, Dialog, Table, Calendar y demás se renderizan todos en canvas, con temas claro/oscuro y sobreescritura mediante hojas de estilo."
---

## En marcha en 30 segundos

```sh
pnpm add @dopejs/pingo
```

```ts
import { createElement, createHostedCanvasRoot } from "@dopejs/pingo";

const root = await createHostedCanvasRoot(document.querySelector("canvas")!);

root.render(
  createElement("virtualList", {
    width: 480,
    height: 640,
    itemCount: 1_000_000,
    estimatedItemHeight: 32,
    renderItem: (index) => createElement("text", { value: `Fila ${index}` }),
  }),
);
```

Un millón de filas no se materializa en la Shell, y el scroll no invoca el árbol de componentes:
el cálculo de la ventana y la reconstrucción ocurren dentro del Core.

## Qué no hace

Pingo es un motor de renderizado, no un navegador. **No hace** SSR/primer pintado en HTML,
compatibilidad CSS general (box model, cascada, selectores), capas de adaptación para
mini-programas o apps nativas, ni semántica de texto enriquecido a nivel de negocio
(colaboración, fórmulas, comandos Markdown).

El motor **sí posee** el caret, la selección, el IME, el portapapeles, deshacer/rehacer y las
primitivas de texto editable: nada de esto se devuelve a la capa de negocio para ensamblarlo
con controles DOM.

## Estado actual

Todos los hitos de ingeniería P0–M8 están completos; M9 «cualificación de producción,
composición incremental y endurecimiento de release» ya está planificado pero aún no se ha
empezado a implementar; véase el [plan de M9](/m9-production-plan). Los cambios del repositorio
siguen en Unreleased, lo que no implica que se haya publicado una nueva versión en npm.

El rendimiento en dispositivos reales, los métodos de entrada reales, los lectores de pantalla y
la matriz de consumo energético pertenecen a la cualificación de plataforma y se siguen por
separado; la navegación visual bidi y el backend WebGPU activado por defecto siguen siendo
[aplazamientos documentados](/plan).
