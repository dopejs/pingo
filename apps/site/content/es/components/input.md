---
title: Input
description: Campo de entrada de texto de una sola línea, impulsado por el motor de edición de pingo, renderizado en el canvas.
---

# Input

Entrada de texto de una sola línea. La siguiente vista previa se renderiza en tiempo real mediante el motor de pingo: al hacer clic puedes escribir, seleccionar, borrar y alternar entre tema claro y oscuro según el sitio.

:::preview input-basic
:::

## Uso

```tsx
import { Input } from "@dopejs/pingo-ui";

root.render(
  <Input semanticLabel="Correo" width={320} onValueChange={(value) => console.log(value)} />,
);
```

`Input` mantiene internamente un `TextEditingController` estable mediante hooks, por lo que debe montarse como elemento con `<Input … />` y no invocarse directamente como función: hacerlo falla con «hooks may only run in a function component». Para más detalles de edición, consulta la [guía de edición de texto](/guide/editing).

## Ejemplos

### Prefijo, sufijo y contraseña

Las ranuras `prefix`/`suffix` admiten iconos o unidades; `password` activa la entrada enmascarada; `disabled` bloquea todo el campo.

:::preview input-adornments
:::

### Uso controlado

Al pasar tu propio `controller` entras en modo controlado: `value` se ignora como valor inicial y el llamador conserva el controlador manteniendo la misma instancia entre renderizados.

## Props

| Prop            | Tipo                                                                                  | Valor predeterminado | Descripción                                                                   |
| --------------- | ------------------------------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------- |
| `value`         | `string`                                                                              | `""`                 | Valor inicial para el uso no controlado; se ignora al establecer `controller` |
| `onValueChange` | `(value: string) => void`                                                             | —                    | Devuelve el valor más reciente tras aplicar cada transacción de edición       |
| `controller`    | `TextEditingController`                                                               | —                    | Válvula de escape avanzada: controlador persistente en manos del llamador     |
| `onTransaction` | `(transaction: EditTransaction) => void`                                              | —                    | Callback crudo de cada transacción de edición                                 |
| `onSubmit`      | `() => void`                                                                          | —                    | Callback de envío (tecla Enter)                                               |
| `disabled`      | `boolean`                                                                             | `false`              | Estado deshabilitado                                                          |
| `readOnly`      | `boolean`                                                                             | `false`              | Estado de solo lectura                                                        |
| `password`      | `boolean`                                                                             | `false`              | Entrada enmascarada                                                           |
| `inputMode`     | `"decimal" \| "email" \| "none" \| "numeric" \| "search" \| "tel" \| "text" \| "url"` | `"text"`             | Sugerencia de distribución del teclado virtual                                |
| `className`     | `string`                                                                              | —                    | Se añade después del nombre de clase del componente                           |
| `width`         | `number`                                                                              | —                    | Ancho fijo (px)                                                               |
| `semanticLabel` | `string`                                                                              | —                    | Nombre accesible                                                              |
| `prefix`        | `PingoNode`                                                                           | —                    | Decoración inicial, como un icono o símbolo de moneda                         |
| `suffix`        | `PingoNode`                                                                           | —                    | Decoración final, como una unidad o botón de borrado                          |

## Accesibilidad

Proporciona el nombre del campo mediante `semanticLabel`; tanto `disabled` como `readOnly` hacen que el campo salga de la secuencia de edición. Limitaciones conocidas: actualmente no hay texto de marcador de posición (placeholder) ni estilos de anillo de foco.
