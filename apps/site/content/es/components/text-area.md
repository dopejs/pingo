---
title: Área de texto
description: Campo de entrada de texto multilínea, impulsado por el motor de edición de pingo y renderizado en canvas.
---

# Área de texto

Entrada de texto multilínea para contenido más extenso, como notas o biografías. La vista previa a continuación se renderiza en tiempo real mediante el motor de pingo: al hacer clic, puede escribir realmente texto multilínea, y el componente sigue el cambio de tema del sitio entre claro y oscuro.

:::preview text-area-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { TextArea } from "@dopejs/pingo-ui";

root.render(
  createElement(TextArea, {
    semanticLabel: "Biografía personal",
    width: 360,
    rows: 4,
    onValueChange: (value) => console.log(value),
  }),
);
```

`rows` determina el número de líneas visibles y fija la altura mínima del contenedor (`rows × altura de línea + relleno superior e inferior`). Al igual que [Input](/components/input), `TextArea` debe montarse como componente mediante `createElement`. Consulte los detalles de edición en la [guía de edición de texto](/guide/editing).

## Ejemplos

### Deshabilitado

Al pasar `disabled`, el campo deja de recibir entrada y se aplican los estilos de estado deshabilitado.

## Props

| Prop            | Tipo                                     | Valor predeterminado | Descripción                                                                       |
| --------------- | ---------------------------------------- | -------------------- | --------------------------------------------------------------------------------- |
| `value`         | `string`                                 | `""`                 | Valor inicial para uso no controlado; se ignora cuando se establece `controller`  |
| `onValueChange` | `(value: string) => void`                | —                    | Se llama con el valor más reciente después de aplicar cada transacción de edición |
| `controller`    | `TextEditingController`                  | —                    | Vía de escape avanzada: controlador persistente que conserva quien llama          |
| `onTransaction` | `(transaction: EditTransaction) => void` | —                    | Devolución de llamada sin procesar para cada transacción de edición               |
| `onSubmit`      | `() => void`                             | —                    | Devolución de llamada de envío                                                    |
| `disabled`      | `boolean`                                | `false`              | Estado deshabilitado                                                              |
| `readOnly`      | `boolean`                                | `false`              | Estado de solo lectura                                                            |
| `rows`          | `number`                                 | —                    | Número de líneas visibles; determina la altura mínima del contenedor              |
| `className`     | `string`                                 | —                    | Se añade después del nombre de clase del componente                               |
| `width`         | `number`                                 | —                    | Ancho fijo (px)                                                                   |
| `semanticLabel` | `string`                                 | —                    | Nombre de accesibilidad                                                           |

## Accesibilidad

Proporcione el nombre del campo mediante `semanticLabel`; tanto `disabled` como `readOnly` hacen que el campo salga de la secuencia de edición. Comparte con Input una carencia conocida: todavía no hay texto de marcador de posición ni estilos de anillo de foco.
