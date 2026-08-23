---
title: Input OTP
description: Entrada de código de un solo uso de longitud fija, compatible con entrada carácter por carácter y pegado completo, renderizada en el lienzo de pingo.
---

# Input OTP

Entrada de código de un solo uso, compuesta por varias casillas de longitud fija. La vista previa siguiente se renderiza en tiempo real mediante el motor de pingo: puede introducir dígitos casilla por casilla, pegar el código completo y alternar entre tema claro y oscuro según el sitio.

:::preview input-otp-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { InputOTP } from "@dopejs/pingo-ui";

root.render(
  createElement(InputOTP, {
    length: 6,
    semanticLabel: "Código de un solo uso",
    onValueChange: (value) => console.log(value),
    onComplete: (code) => verify(code),
  }),
);
```

El valor interno es una cadena **de longitud fija, rellenada con espacios**: el espacio representa una casilla vacía. `onValueChange` recibe ese valor rellenado; `onComplete` se dispara una vez cuando todas las casillas están completas y recibe el código completo sin espacios. El pegado se trata como un relleno completo que comienza en la casilla actual; al borrar solo se vacía la casilla actual sin desplazar hacia la izquierda los dígitos posteriores.

## Ejemplos

### Longitud

`length` determina el número de casillas (predeterminado 6). Cada casilla utiliza el teclado numérico en pantalla (`inputMode: "numeric"`).

## Props

| Prop | Tipo | Valor predeterminado | Descripción |
| --- | --- | --- | --- |
| `length` | `number` | `6` | Número de casillas |
| `value` | `string` | — | Valor controlado actual (rellenado con espacios) |
| `defaultValue` | `string` | — | Valor inicial no controlado |
| `onValueChange` | `(value: string) => void` | — | Callback de cambio de valor; el valor es una cadena de longitud fija rellenada con espacios |
| `onComplete` | `(value: string) => void` | — | Callback cuando todas las casillas están completas; el valor es el código completo sin espacios |
| `disabled` | `boolean` | `false` | Desactiva todas las casillas |
| `semanticLabel` | `string` | — | Nombre accesible del grupo |
| `className` | `string` | — | Se añade después de la clase del componente |

## Accesibilidad

El componente tiene el rol semántico `group`; cada casilla recibe automáticamente un nombre accesible con el formato `número/total` (por ejemplo, `3/6`), y también se puede nombrar todo el grupo mediante `semanticLabel`.
