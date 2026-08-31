---
title: Componentes
description: Biblioteca de componentes UI nativos de pingo con la mentalidad de shadcn, todo renderizado en tiempo real sobre canvas.
---

# Componentes

`@dopejs/pingo-ui` es una biblioteca de componentes alineada con shadcn/ui: la API y la semántica de skins se mantienen consistentes, y el objetivo de renderizado es el motor de canvas de pingo en lugar del DOM. Cada página de componente a continuación incluye una vista previa con **renderizado en tiempo real** — la vista previa es en sí misma un canvas dibujado por el motor, interactivo y que sigue los cambios de tema.

## Uso

```tsx
import { createHostedCanvasRoot } from "@dopejs/pingo";
import { Button, createPingoUiStyleSheet } from "@dopejs/pingo-ui";

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [createPingoUiStyleSheet()],
});
root.render(<Button>Guardar</Button>);
```

Las hojas de estilo personalizadas del usuario deben registrarse **después** de la hoja de estilos de pingo-ui; las reglas con la misma prioridad se sobrescriben según el orden de registro. Para personalización de temas y marca, consulta la [guía de estilos](/guide/styling) y [SCSS y Less](/guide/scss-less).

Selecciona un componente del directorio de la izquierda para comenzar.
