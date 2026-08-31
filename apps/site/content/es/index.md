---
layout: home

hero:
  name: Pingo
  text: motor de renderizado canvas
  tagline: Núcleo Rust/WASM + carcasa TypeScript + backends conectables. Diseñado para interacción de alto rendimiento, desplazamiento virtual nativo y edición de texto dentro de canvas, con componentes básicos, estilos CSS y una biblioteca de componentes UI alineada con shadcn.
  image:
    light: /pingo-mark.svg
    dark: /pingo-mark-dark.svg
    alt: Pingo
  actions:
    - theme: brand
      text: Inicio rápido
      link: /guide/getting-started
    - theme: alt
      text: Playground
      link: /playground
    - theme: alt
      text: GitHub
      link: https://github.com/dopejs/pingo

features:
  - title: Doble reloj, sin pérdida de fotogramas aunque el hilo principal se bloquee
    details: El reloj de UI y el reloj de renderizado son independientes. El desplazamiento, las animaciones, el layout y la composición avanzan en un ciclo cerrado dentro del Worker; la imagen sigue siendo fluida incluso cuando el hilo principal se bloquea durante 200ms.
  - title: Desplazamiento virtual nativo
    details: El árbol de suma de prefijos, la predicción direccional con precarga y la reconstrucción de marcadores de posición están dentro del Core. La reproducción de 20.000 fotogramas con un millón de filas fijas tiene P95/P99 por debajo del microsegundo, y el desplazamiento en estado estable no devuelve ninguna llamada al Shell.
  - title: Edición nativa en canvas
    details: caret, selección, selección por arrastre, selección de palabra con doble clic, composición IME, posicionamiento de la ventana de candidatos, portapapeles y deshacer/rehacer están implementados por el motor. La aplicación ya no crea controles HTML para la capacidad de entrada.
  - title: La accesibilidad forma parte de la arquitectura
    details: El Core exporta un árbol semántico y el host lo refleja como un árbol DOM en la sombra junto al canvas. Los lectores de pantalla funcionan, y las pruebas E2E pueden seleccionar elementos por role/label en lugar de comparar píxeles.
  - title: Determinismo y pruebas diferenciales
    details: Flujo binario versionado, reloj y fuentes aleatorias inyectables, grabación y reproducción, y oráculos diferenciales entre incremental y completo, optimizado y básico, wasm y native.
  - title: Degradación automática, siempre hay un fallback
    details: SharedArrayBuffer → postMessage → Canvas2D en el hilo principal se seleccionan automáticamente según la capacidad, con funcionalidad equivalente. La capa de migración admite despliegue gradual por página y reversión con un solo clic.
  - title: Componentes básicos listos para usar
    details: View/Text/Image, Input/TextArea, SVG/Path y otros elementos a nivel de motor corresponden directamente a nodos de escena. La conformación de texto, la geometría del caret y la capacidad de edición provienen del Core, sin necesidad de ensamblar controles DOM.
  - title: Soporte de CSS, SCSS y Less
    details: "Un subconjunto de CSS versionado que se analiza en el lado del Shell: selectores de clase, estados de interacción, herencia y estilos calculados tienen límites claros. SCSS/Less se compilan y validan en tiempo de construcción; los preprocesadores no entran en el bundle del navegador."
  - title: Biblioteca de componentes UI alineada con shadcn
    details: "La API de componentes de @dopejs/pingo-ui y la semántica de apariencia están alineadas con shadcn/ui: Button, Dialog, Table, Calendar, entre otros, se renderizan en canvas y admiten temas claro/oscuro y sobrescritura mediante hojas de estilo."
---

## Comenzar en 30 segundos

```sh
pnpm add @dopejs/pingo
```

```tsx
import { createHostedCanvasRoot, Text, View } from "@dopejs/pingo";

const root = await createHostedCanvasRoot(document.querySelector("canvas")!);

root.render(
  <View
    style={{ width: 480, height: 640, overflowY: "auto" }}
    virtual={{
      itemCount: 1_000_000,
      estimatedItemSize: 32,
      renderItem: (index) => <Text value={`第 ${index} 行`} />,
    }}
  />,
);
```

TSX requiere apuntar `jsxImportSource` a `@dopejs/pingo` en `tsconfig.json`; ver [Primeros pasos](/guide/getting-started).

Un millón de filas no se materializan en el lado del Shell, y el proceso de desplazamiento tampoco devuelve llamadas al árbol de componentes: el cálculo de ventanas y la reconstrucción ocurren dentro del Core.

## Lo que no hace

Pingo es un motor de renderizado, no un navegador. **No hace** SSR/primera pantalla en HTML, compatibilidad CSS general (modelo de caja, cascada, selectores), capas de adaptación para miniprogramas o nativo, ni semántica de texto enriquecido a nivel de negocio (colaboración, fórmulas, comandos de Markdown).

El motor **sí incluye** caret, selección, IME, portapapeles, deshacer/rehacer y primitivas de texto editable; nada de esto se devuelve a la capa de negocio para ensamblarlo con controles DOM.

El rendimiento en dispositivos reales, los métodos de entrada reales, los lectores de pantalla y la matriz de consumo de medios pertenecen a la recopilación de cualificación de plataforma y se rastrean por separado; la navegación visual bidi y la habilitación predeterminada del backend WebGPU siguen siendo [elementos diferidos documentados](https://github.com/dopejs/pingo/blob/main/docs/plan.md).
