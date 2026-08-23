---
title: Button
description: Botón que dispara una acción o evento, renderizado en el lienzo de pingo.
---

# Button

El botón dispara una acción. La vista previa a continuación se renderiza en tiempo real mediante el motor de pingo: puedes hacer clic, enfocarlo y alternar entre tema claro y oscuro según el sitio.

:::preview button-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { Button } from "@dopejs/pingo-ui";

root.render(
  createElement(Button, {
    children: "Guardar",
    variant: "default",
    onPress: () => save(),
  }),
);
```

## Ejemplos

### Tamaño

`size` admite `default`, `sm`, `lg` e `icon`.

### Deshabilitado

Al pasar `disabled`, el botón deja de responder al puntero y al teclado, y se aplican estilos de estado deshabilitado.

## Props

| Prop            | Tipo                                                                | Valor predeterminado | Descripción                                         |
| --------------- | ------------------------------------------------------------------- | -------------------- | --------------------------------------------------- |
| `children`      | `string`                                                            | —                    | Texto del botón (obligatorio)                       |
| `variant`       | `"default" \| "secondary" \| "outline" \| "ghost" \| "destructive"` | `"default"`          | Variante visual                                     |
| `size`          | `"default" \| "sm" \| "lg" \| "icon"`                               | `"default"`          | Tamaño                                              |
| `disabled`      | `boolean`                                                           | `false`              | Estado deshabilitado                                |
| `onPress`       | `() => void`                                                        | —                    | Callback de activación por puntero/teclado          |
| `semanticLabel` | `string`                                                            | `children`           | Nombre accesible                                    |
| `className`     | `string`                                                            | —                    | Se añade después del nombre de clase del componente |

## Accesibilidad

El botón posee semántica de botón y soporte de activación por teclado; `semanticLabel` toma por defecto el valor de `children`. En botones de icono, proporciónalo explícitamente.
