---
title: Progress
description: Barra de progreso que muestra el grado de finalización de una tarea, renderizada en el canvas de pingo.
---

# Progress

Progress utiliza una pista rellena para mostrar el progreso determinista, como en descargas, cargas o tareas de varios pasos. La vista previa a continuación es renderizada en tiempo real por el motor de pingo y alterna entre tema claro y oscuro según el sitio.

:::preview progress-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { Progress } from "@dopejs/pingo-ui";

root.render(createElement(Progress, { value: 60 }));
```

El ancho de la pista hereda el del contenedor padre. Coloca Progress dentro de un contenedor de ancho fijo para controlar la longitud de la barra:

```tsx
createElement("container", {
  width: 320,
  children: createElement(Progress, { value: 60 }),
});
```

## Ejemplos

### Valor máximo personalizado

`max` es 100 por defecto. Al proporcionarlo, el porcentaje de relleno se calcula como `value / max` y siempre se restringe al rango 0–100:

```tsx
createElement(Progress, { value: 3, max: 10 }); // 30%
```

## Props

| Prop | Tipo | Valor por defecto | Descripción |
| --- | --- | --- | --- |
| `value` | `number` | — | Progreso actual (obligatorio), los valores fuera de rango se restringen |
| `max` | `number` | `100` | Valor máximo, se trata como mínimo 1 |
| `className` | `string` | — | Se añade después del nombre de clase del componente |

## Accesibilidad

Progress es un elemento puramente visual y no lleva asociado un rol semántico. Si el progreso es esencial para completar la tarea, acompáñalo de un texto que indique el porcentaje actual o el nombre de la fase.
