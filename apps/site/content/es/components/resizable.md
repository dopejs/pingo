---
title: Resizable
description: Diseño de dos paneles con proporción ajustable mediante un control deslizante, renderizado sobre el lienzo de pingo.
---

# Resizable

Resizable divide el contenedor en dos paneles; el control de arrastre central permite ajustar la proporción y también admite ajustes finos con el teclado. La vista previa inferior se renderiza en tiempo real con el motor pingo: arrastre el control para probarlo.

:::preview resizable-basic
:::

## Uso

```tsx
import { Resizable } from "@dopejs/pingo-ui";

root.render(<Resizable defaultSplit={0.4} first={sidebar} second={content} />);
```

El componente ocupa el 100 % del ancho y alto de su contenedor padre, que debe tener un tamaño definido. Admite tanto el modo no controlado (`defaultSplit`) como el controlado (`split` + `onSplitChange`).

## Ejemplos

### Dirección vertical

Pase `direction: "column"` para cambiar a una división superior/inferior; el control se vuelve horizontal.

:::preview resizable-vertical
:::

## Props

| Prop            | Tipo                      | Valor predeterminado | Descripción                                                   |
| --------------- | ------------------------- | -------------------- | ------------------------------------------------------------- |
| `first`         | `PingoNode`               | —                    | Contenido del primer panel (obligatorio)                      |
| `second`        | `PingoNode`               | —                    | Contenido del segundo panel (obligatorio)                     |
| `split`         | `number`                  | —                    | Controlado: proporción del primer panel, en el rango `[0, 1]` |
| `defaultSplit`  | `number`                  | `0.5`                | No controlado: proporción inicial                             |
| `onSplitChange` | `(split: number) => void` | —                    | Devolución de llamada al cambiar la proporción                |
| `direction`     | `"row" \| "column"`       | `"row"`              | Dirección de la división                                      |
| `minSplit`      | `number`                  | `0.1`                | Proporción mínima (límite inferior de recorte)                |
| `maxSplit`      | `number`                  | `0.9`                | Proporción máxima (límite superior de recorte)                |
| `disabled`      | `boolean`                 | `false`              | Deshabilita la interacción con el control                     |
| `className`     | `string`                  | —                    | Se añade después del nombre de clase del componente           |

## Accesibilidad

El control tiene semántica de separador y expone a las tecnologías de asistencia la proporción actual (en porcentaje). Al enfocar el control, las teclas de dirección permiten ajustes finos en pasos del 2 %: izquierda/derecha en el diseño horizontal, arriba/abajo en el vertical.
