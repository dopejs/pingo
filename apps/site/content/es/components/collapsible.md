---
title: Collapsible
description: Un área de contenido individual expandible y colapsable, renderizada en el lienzo de pingo.
---

# Collapsible

Collapsible es la primitiva de elemento individual de Accordion: un disparador controla la expansión y el colapso de un bloque de contenido, ideal para escenarios que solo necesitan una única zona plegable. La siguiente vista previa la renderiza en tiempo real el motor de pingo: haz clic en el disparador para alternar.

:::preview collapsible-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { Collapsible } from "@dopejs/pingo-ui";

root.render(
  createElement(Collapsible, {
    trigger: "高级选项",
    defaultOpen: true,
    children: createElement("text", { value: "折叠区内容。" }),
  }),
);
```

Admite tanto el uso no controlado (`defaultOpen`) como el controlado (`open` + `onOpenChange`).

## Ejemplos

### Deshabilitado

Al pasar `disabled`, el disparador deja de responder al puntero y al teclado, y se aplica el estilo de deshabilitado.

:::preview collapsible-disabled
:::

## Props

| Prop           | Tipo                      | Valor predeterminado | Descripción                                                |
| -------------- | ------------------------- | -------------------- | ---------------------------------------------------------- |
| `trigger`      | `string`                  | —                    | Texto del disparador (obligatorio)                         |
| `children`     | `PingoNode`               | —                    | Contenido que se muestra tras expandirse (obligatorio)     |
| `open`         | `boolean`                 | —                    | Controlado: estado actual de expansión                     |
| `defaultOpen`  | `boolean`                 | `false`              | No controlado: estado inicial de expansión                 |
| `onOpenChange` | `(open: boolean) => void` | —                    | Devolución de llamada cuando cambia el estado de expansión |
| `disabled`     | `boolean`                 | `false`              | Deshabilita el disparador                                  |
| `className`    | `string`                  | —                    | Se añade después de los nombres de clase del componente    |

## Accesibilidad

El disparador posee semántica de botón y expone el estado expanded/collapsed a las tecnologías de asistencia; Enter y la barra espaciadora alternan la expansión. Cuando el contenido está colapsado se oculta con `display: none` en lugar de desmontarse, de modo que se conservan la posición de desplazamiento y el estado de edición internos.
