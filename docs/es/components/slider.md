---
title: Slider
description: Control deslizante numérico, compatible con arrastre y ajuste fino por teclado, renderizado en el lienzo de pingo.
---

# Slider

El control deslizante se utiliza para seleccionar un valor dentro de un rango. La siguiente vista previa se renderiza en tiempo real mediante el motor pingo: puedes arrastrar el control o ajustarlo con las teclas de dirección, y cambia entre tema claro y oscuro según el sitio.

:::preview slider-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { Slider } from "@dopejs/pingo-ui";

root.render(
  createElement(Slider, {
    defaultValue: 40,
    min: 0,
    max: 100,
    step: 1,
    semanticLabel: "Volumen",
    onValueChange: (value) => console.log(value),
  }),
);
```

`Slider` mantiene internamente el estado de arrastre mediante hooks, por lo que debe montarse como componente con `createElement`. Al pasar `value` se activa el modo controlado; de lo contrario, usa `defaultValue` para que el componente gestione su propio estado.

## Ejemplos

### Rango e incremento

`min` / `max` limitan el rango de valores (por defecto 0–100) y `step` determina la granularidad del ajuste por teclado (por defecto 1).

### Deshabilitado

Al pasar `disabled`, el control deja de responder al arrastre y al teclado.

## Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` | — | Valor actual controlado |
| `defaultValue` | `number` | `min` | Valor inicial no controlado |
| `onValueChange` | `(value: number) => void` | — | Callback al cambiar el valor |
| `min` | `number` | `0` | Valor mínimo |
| `max` | `number` | `100` | Valor máximo |
| `step` | `number` | `1` | Incremento por teclado |
| `disabled` | `boolean` | `false` | Estado deshabilitado |
| `semanticLabel` | `string` | — | Nombre de accesibilidad |
| `className` | `string` | — | Se añade después del nombre de clase del componente |

## Accesibilidad

El componente tiene el rol semántico `slider` y su valor semántico es la representación en cadena del valor numérico actual. `←`/`↓` disminuyen un `step`, `→`/`↑` aumentan un `step` y `Home`/`End` saltan a los extremos del rango; el valor siempre se mantiene dentro de `[min, max]`.
