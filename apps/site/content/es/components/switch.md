---
title: Switch
description: Control de interruptor controlado para ajustes booleanos de efecto inmediato, renderizado sobre el canvas de pingo.
---

# Switch

El interruptor se usa para ajustes booleanos de efecto inmediato. La vista previa inferior está renderizada en tiempo real por el motor de pingo y alterna entre claro y oscuro siguiendo el tema del sitio. Switch es un componente controlado: la vista previa muestra combinaciones estáticas de encendido/apagado/deshabilitado, y la interacción está impulsada por el estado que posee quien invoca el componente.

:::preview switch-basic
:::

## Uso

```tsx
import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
import { Switch } from "@dopejs/pingo-ui";

// useSignal es un hook y debe ejecutarse dentro del ámbito del componente.
function AirplaneMode(): PingoNode {
  const on = useSignal(false);
  return createElement(Switch, {
    checked: on.get(),
    semanticLabel: "飞行模式",
    onCheckedChange: (next) => on.set(next),
  });
}

root.render(createElement(AirplaneMode));
```

`checked` lo posee el componente padre y `onCheckedChange` se encarga de actualizarlo—el componente en sí no guarda estado.

## Ejemplos

### Deshabilitado

Al pasar `disabled`, el interruptor deja de responder al puntero y al teclado, y su valor semántico pasa a ser `disabled`.

## Props

| Prop              | 类型                         | 默认值  | 说明                                                |
| ----------------- | ---------------------------- | ------- | --------------------------------------------------- |
| `checked`         | `boolean`                    | —       | Estado del interruptor (obligatorio, controlado)    |
| `onCheckedChange` | `(checked: boolean) => void` | —       | Callback de cambio de estado                        |
| `disabled`        | `boolean`                    | `false` | Estado deshabilitado                                |
| `className`       | `string`                     | —       | Se añade después del nombre de clase del componente |
| `semanticLabel`   | `string`                     | —       | Nombre accesible                                    |

## Accesibilidad

El componente tiene el rol semántico `switch`, y su valor semántico alterna entre `on` / `off` / `disabled` según el estado. Al pulsar con el puntero, recibe el foco automáticamente. El interruptor no tiene texto visible; proporcione siempre `semanticLabel`.
