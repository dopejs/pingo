---
title: Checkbox
description: Casilla de verificación controlada, con etiqueta de texto opcional, renderizada en el lienzo de pingo.
---

# Checkbox

La casilla de verificación se usa como interruptor booleano independiente. La vista previa siguiente es renderizada en tiempo real por el motor pingo y alterna entre claro y oscuro según el tema del sitio. Checkbox es un componente controlado: la vista previa muestra combinaciones estáticas de activado/desactivado/deshabilitado, y la interacción es dirigida por el estado que posee quien lo invoca.

:::preview checkbox-basic
:::

## Uso

```tsx
import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
import { Checkbox } from "@dopejs/pingo-ui";

// useSignal es un hook y debe ejecutarse dentro del ámbito del componente.
function NotificationSetting(): PingoNode {
  const enabled = useSignal(false);
  return createElement(Checkbox, {
    checked: enabled.get(),
    label: "Notificaciones activadas",
    onCheckedChange: (next) => enabled.set(next),
  });
}

root.render(createElement(NotificationSetting));
```

`checked` lo posee el componente padre y `onCheckedChange` se encarga de actualizarlo; el componente en sí no guarda estado. `label` es opcional y, si se proporciona, renderiza el texto a la derecha de la casilla.

## Ejemplos

### Deshabilitado

Al pasar `disabled`, la casilla deja de responder al puntero y al teclado, y su valor semántico pasa a ser `disabled`.

## Props

| Prop | Tipo | Valor predeterminado | Descripción |
| --- | --- | --- | --- |
| `checked` | `boolean` | — | Estado de selección (obligatorio, controlado) |
| `onCheckedChange` | `(checked: boolean) => void` | — | Devuelve la llamada al cambiar el estado |
| `disabled` | `boolean` | `false` | Estado deshabilitado |
| `label` | `string` | — | Etiqueta de texto a la derecha de la casilla |
| `className` | `string` | — | Se añade después del nombre de clase del componente |
| `semanticLabel` | `string` | — | Nombre accesible |

## Accesibilidad

El componente tiene el rol semántico `checkbox` y su valor semántico alterna entre `checked` / `unchecked` / `disabled` según el estado. Al presionar con el puntero, el componente recibe el foco automáticamente. El indicador ✓ depende de la cobertura de glifos de la fuente y funciona como implementación provisional hasta que los recursos de iconos estén listos.
