---
title: "Widgets: piezas de motor sin estilos"
description: "@dopejs/pingo-widgets proporciona TextField, TextArea, Pressable, Button y otras piezas a nivel de motor sin estilos, así como su frontera con @dopejs/pingo-ui."
---

# Widgets: piezas de motor sin estilos

`@dopejs/pingo-widgets` es la primera capa de composición sobre el motor: ensambla las
[primitivas editables](/guide/elements-editing) con el foco y los eventos nativos para formar
piezas utilizables, con decoración **mínima** (borde, estado de error) y sin asumir ningún sistema
de diseño. La aplicación no depende directamente de este paquete interno: todas sus exportaciones
se reexportan a través de `@dopejs/pingo`. Las vistas previas de abajo se renderizan en vivo y
aceptan entrada directamente.

:::preview widgets-textfield
:::

## Exportaciones y nombres

| Exportación | Descripción                                                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------------------------- |
| `TextField` | Entrada de una línea: decoración de borde + estado de error; por dentro sólo compone la primitiva `editableText` |
| `TextArea`  | Variante multilínea; Enter inserta salto de línea y el submit queda para el formulario del host                  |
| `Pressable` | Superficie de activación enfocable: View + foco + click/tap nativo                                               |
| `Button`    | Composición conveniente de botón de texto con `Pressable` + `Text`                                               |

Ojo con los nombres: `TextArea` en `@dopejs/pingo` se refiere a este widget decorado; la
**primitiva** multilínea se exporta como `UnstyledTextArea` (igualmente `TextAreaProps` tiene el
alias `UnstyledTextAreaProps`).

## TextField y TextArea

La decoración por defecto es un borde de 1 px y un padding de 8 px; al pasar una cadena `error` se
cambia a un borde de color de error y se renderiza bajo el campo una nota de error con rol
`alert`. El contrato controlado (`value` + `revision` + `onTransaction`) es exactamente el mismo
que el de los [elementos editables](/guide/elements-editing): el widget no introduce ninguna ruta
de entrada nueva.

```tsx
import { TextField } from "@dopejs/pingo";

<TextField
  value={value}
  revision={revision}
  semanticLabel="Destinatario"
  width={320}
  error={value === "" ? "El destinatario no puede estar vacío" : undefined}
  onTransaction={(t) => apply(t)}
/>;
```

### Props (TextField)

| Prop              | Tipo                           | Valor predeterminado     | Descripción                                                                                    |
| ----------------- | ------------------------------ | ------------------------ | ---------------------------------------------------------------------------------------------- |
| `value`           | `string`                       | `""`                     | Texto controlado                                                                               |
| `revision`        | `number \| bigint`             | `0n`                     | Revision autoritativo del valor controlado                                                     |
| `controller`      | `TextEditingController`        | —                        | Controller local; mutuamente excluyente con `value`/`revision`                                 |
| `readOnly`        | `boolean`                      | —                        | Sólo lectura                                                                                   |
| `password`        | `boolean`                      | —                        | Modo contraseña (el texto plano no entra en el DisplayList ni en los valores de accesibilidad) |
| `maxGraphemes`    | `number`                       | —                        | Límite de grafemas                                                                             |
| `inputMode`       | `EditableInputMode`            | —                        | Sugerencia de disposición del teclado virtual                                                  |
| `width`           | `number`                       | `240`                    | Anchura total incluyendo el borde                                                              |
| `height`          | `number`                       | `lineHeight × rows + 16` | Altura total incluyendo el borde                                                               |
| `fontSize`        | `number`                       | `14`                     | Tamaño de fuente                                                                               |
| `lineHeight`      | `number`                       | `round(fontSize × 1.5)`  | Altura de línea                                                                                |
| `color`           | `Color`                        | `#1f2329ff`              | Color del texto                                                                                |
| `backgroundColor` | `Color`                        | `#ffffffff`              | Color de fondo del campo                                                                       |
| `borderColor`     | `Color`                        | `#c0c4ccff`              | Color del borde                                                                                |
| `errorColor`      | `Color`                        | `#d03050ff`              | Color del borde y de la nota en estado de error                                                |
| `error`           | `string`                       | —                        | Si no está vacío, estado de error: borde de color de error + nota debajo                       |
| `onTransaction`   | `(t: EditTransaction) => void` | —                        | Callback de transacciones de edición del Core                                                  |
| `onSubmit`        | `() => void`                   | —                        | Enter envía en modo de una línea                                                               |
| `semanticLabel`   | `string`                       | —                        | Nombre accesible (el rol es siempre `textbox`)                                                 |

`TextArea` añade sobre esta base `rows` (por defecto `3`), usado para calcular la altura por
defecto.

## Pressable y Button

`Pressable` no introduce ninguna clase nueva de nodo de Scene: es simplemente un `View` con
semántica `button`, que toma el foco al pulsarse y que mapea el click/tap nativo a `onPress`. El
estilo lo deciden por completo `style` y `children`; con `disabled` se reduce la opacidad y se
retiran los eventos.

| Prop               | Tipo         | Valor predeterminado     | Descripción                                              |
| ------------------ | ------------ | ------------------------ | -------------------------------------------------------- |
| `children`         | `PingoNode`  | —                        | Contenido (en Button es `string \| number`, obligatorio) |
| `disabled`         | `boolean`    | `false`                  | Estado deshabilitado                                     |
| `onPress`          | `() => void` | —                        | Callback de activación                                   |
| `className`        | `string`     | —                        | Nombre de clase (conecta con hojas de estilo)            |
| `style`            | `PingoStyle` | —                        | Estilo en línea                                          |
| `width` / `height` | `number`     | —                        | Tamaño                                                   |
| `semanticLabel`    | `string`     | `Button` toma `children` | Nombre accesible                                         |

`Button` acepta además `color` y `fontSize` (pasados al texto interno).

## Frontera con @dopejs/pingo-ui

Las dos capas responden a preguntas distintas:

- **widgets** — corrección de comportamiento: transacciones de edición, foco, roles semánticos,
  decoración mínima. Sin ninguna opinión de diseño; todos los colores y tamaños de fuente se
  pueden sobreescribir.
- **@dopejs/pingo-ui** — sistema de diseño: componentes completos con la mentalidad de shadcn
  (variantes, tamaños, temas, hojas de estilo), que por dentro componen widgets,
  `@dopejs/pingo-editing` y hooks de runtime, sin tocar el motor.

Recomendación de elección: si quieres un sistema de diseño listo, usa directamente los
[componentes de pingo-ui](/components); si traes tu propio lenguaje de diseño pero no quieres
tocar los detalles de las transacciones de edición, usa widgets como cimientos; para algo
totalmente personalizado (como el HUD de un juego), usa directamente las primitivas de los
[elementos básicos](/guide/elements).

## Accesibilidad

`TextField` / `TextArea` llevan el rol `textbox`, y la nota de `error` el rol `alert`;
`Pressable` / `Button` llevan el rol `button`, y `disabled` se expone mediante `semanticValue`.
El nombre siempre depende de `semanticLabel`: no lo omitas cuando no haya un label visible. Véase
[accesibilidad](/guide/accessibility).
