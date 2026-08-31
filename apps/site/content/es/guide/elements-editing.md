---
title: "Elementos editables: Input y TextArea"
description: Primitivas de texto editable nativas del motor — contrato de transacciones con revision controlado, puente de entrada EditContext, contraseña y sólo lectura.
---

# Elementos editables: Input y TextArea

`Input` y `TextArea` (exportado en `@dopejs/pingo` como `UnstyledTextArea`, véase más abajo) son
primitivas de texto editable nativas del motor: el caret, la selección, la composición IME, el
portapapeles y deshacer/rehacer están implementados por el Core, **sin necesidad de superponer
ningún control de entrada HTML sobre el canvas**. Las vistas previas de abajo aceptan entrada
real: haz clic para enfocar y prueba un IME de chino, la selección por arrastre y Ctrl+Z.

:::preview elements-input
:::

## Uso

Escritura controlada: `value` + un `revision` monótonamente creciente, confirmando en
`onTransaction` las transacciones que envía el Core:

```tsx
import { Input, type EditTransaction } from "@dopejs/pingo";

let value = "订单备注";
let revision = 1n;

function applyDelta(current: string, transaction: EditTransaction): string {
  const delta = transaction.delta;
  return delta === undefined
    ? current
    : current.slice(0, delta.range.start) + delta.text + current.slice(delta.range.end);
}

<Input
  value={value}
  revision={revision}
  semanticLabel="订单备注"
  onTransaction={(transaction) => {
    value = applyDelta(value, transaction);
    revision = transaction.revision;
  }}
/>;
```

Para estado puramente local también puedes omitir `value` / `revision` y usar
`TextEditingController` (en escenarios con hooks, `useTextEditingController`); `controller` es
mutuamente excluyente con `value`/`revision`.

## Contrato de transacciones con revision

La propiedad del estado es explícita: **la Shell posee los datos de negocio y el Core posee el
estado transitorio de la sesión de edición activa.**

1. La entrada llega al Core y se valida que `base_revision` coincida con la sesión actual;
2. Si pasa, **se aplica y se repinta de inmediato**: cada pulsación de tecla no recorre la
   pipeline de renderizado completa;
3. El Core emite de vuelta un `EditTransaction` versionado;
4. La Shell confirma (actualiza su propio `value` / `revision`) o, si la validación de negocio
   falla, envía un valor corregido con un nuevo `revision`. Un revision caducado nunca sobrescribe
   entrada del Core más reciente; una confirmación con el mismo revision no vacía la pila de
   deshacer.

Los campos de `EditTransaction`:

| Campo          | Tipo                                                        | Descripción                                                                                                                                          |
| -------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nodeId`       | `number`                                                    | Nodo de edición que produjo la transacción                                                                                                           |
| `baseRevision` | `bigint`                                                    | Revision sobre el que se basa la transacción                                                                                                         |
| `revision`     | `bigint`                                                    | Nuevo revision tras la transacción                                                                                                                   |
| `delta`        | `{ range: { start, end }, text }`                           | Diferencia de texto; los desplazamientos son UTF-16, alineados con EditContext/InputEvent. Las transacciones de pura selección carecen de este campo |
| `selection`    | `{ anchor, focus, anchorAffinity, focusAffinity }`          | Selección tras la transacción                                                                                                                        |
| `composition`  | `{ start, end }`                                            | Intervalo de composición IME en curso                                                                                                                |
| `kind`         | `"edit" \| "composition" \| "external" \| "undo" \| "redo"` | Categoría de la transacción                                                                                                                          |

## Puente de entrada: EditContext y el proxy de degradación

El hilo principal conecta con los servicios de entrada de texto del sistema operativo por
prioridad:

1. **EditContext** — se vincula al canvas, recibe texto/selección/composition y reporta al método
   de entrada el control, la selección y los límites de caracteres, de modo que la ventana de
   candidatos puede pegarse al caret.
2. **Proxy de entrada gestionado por el motor** — cuando EditContext no está disponible, el host
   mantiene **un** `textarea` oculto global que gestiona unificado `beforeinput`, la composición,
   el teclado virtual y el portapapeles.

Esto es una implementación de degradación de plataforma, no un modelo de componentes EmbedDOM: en
el Scene no existe un DOM correspondiente uno a uno con cada nodo de edición. Ambas rutas pasan la
misma batería de pruebas de contrato de comportamiento de edición.

## Multilínea: la primitiva TextArea

La primitiva `TextArea` comparte con `Input` el mismo subsistema `editableText`; la única
diferencia es que el invariante `multiline` lo fija el componente. Enter inserta un salto de línea
sin disparar `onSubmit`; al moverse entre líneas con las flechas arriba/abajo se conserva la
columna deseada (desired-x).

:::preview elements-textarea
:::

## Props (Input / UnstyledTextArea)

Ambos comparten `EditableTextProps` (`multiline` no es público: lo fija el componente):

| Prop            | Tipo                           | Valor predeterminado | Descripción                                                                                                |
| --------------- | ------------------------------ | -------------------- | ---------------------------------------------------------------------------------------------------------- |
| `value`         | `string`                       | —                    | Texto controlado                                                                                           |
| `revision`      | `number \| bigint`             | —                    | Revision autoritativo del valor controlado; un valor caducado no sobrescribe entrada del Core más reciente |
| `controller`    | `TextEditingController`        | —                    | Controller local estable; mutuamente excluyente con `value`/`revision`                                     |
| `readOnly`      | `boolean`                      | `false`              | Sólo lectura                                                                                               |
| `password`      | `boolean`                      | `false`              | Modo contraseña (véase más abajo)                                                                          |
| `maxGraphemes`  | `number`                       | —                    | Límite de grafemas                                                                                         |
| `inputMode`     | `EditableInputMode`            | `"text"`             | Sugerencia de teclado virtual: `decimal` `email` `none` `numeric` `search` `tel` `text` `url`              |
| `onTransaction` | `(t: EditTransaction) => void` | —                    | Callback de transacciones de edición del Core                                                              |
| `onSubmit`      | `() => void`                   | —                    | Enter envía en modo de una línea; en multilínea Enter se reserva para el salto de línea                    |

La apariencia del texto hereda `TextProps`: `color`, `fontSize`, `fontWeight`, `lineHeight`,
`fontFamily`, `font`; el tamaño, `padding`, `backgroundColor`, los bordes (canal `style`), etc.
vienen de [CommonProps](/api).

## Accesibilidad y privacidad

- Los nodos de edición llevan la semántica `textbox`; proporciona el nombre con `semanticLabel`
  (especialmente importante cuando no hay un label visible).
- El contenido de contraseña sólo se pinta dentro del Core con glifos de máscara: el texto plano
  no entra en el DisplayList, la grabación/reproducción, las devtools ni los valores de
  accesibilidad, y un objetivo de contraseña tampoco escribe en el portapapeles.

El diseño en profundidad (modelo de posiciones de texto, límites bidi, matriz de pruebas de
contrato) está en [texto y edición](/guide/editing).
