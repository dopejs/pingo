---
title: Toggle Group
description: Un conjunto de botones de dos estados, de selección única o múltiple, con navegación por teclas de dirección, renderizado en el lienzo de pingo.
---

# Toggle Group

El grupo de botones de alternancia combina varios [Toggle](/components/toggle) en un conjunto de selección única o múltiple. La vista previa a continuación es renderizada en tiempo real por el motor de pingo: puedes alternar con clics, moverte entre elementos con las teclas de dirección y cambiar entre tema claro y oscuro siguiendo el tema del sitio.

:::preview toggle-group-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { ToggleGroup, ToggleGroupItem } from "@dopejs/pingo-ui";

root.render(
  createElement(ToggleGroup, {
    type: "single",
    defaultValue: ["center"],
    onValueChange: (value) => console.log(value),
    children: [
      createElement(ToggleGroupItem, { value: "left", children: "左对齐" }),
      createElement(ToggleGroupItem, { value: "center", children: "居中" }),
      createElement(ToggleGroupItem, { value: "right", children: "右对齐" }),
    ],
  }),
);
```

`ToggleGroup` publica el conjunto seleccionado a `ToggleGroupItem` mediante contexto; ambos deben montarse como componentes con `createElement`. Con `type: "single"`, una nueva selección elimina la anterior; con `"multiple"`, se acumulan los elementos uno a uno.

## Ejemplos

### Selección múltiple

`type="multiple"` permite pulsar varios elementos a la vez, como en una barra de herramientas de formato de texto.

:::preview toggle-group-multiple
:::

## Props

### ToggleGroup

| Prop | Tipo | Valor predeterminado | Descripción |
| --- | --- | --- | --- |
| `type` | `"single" \| "multiple"` | `"single"` | La selección única elimina la selección anterior; la múltiple acumula elemento por elemento |
| `value` | `readonly string[]` | — | Conjunto de valores seleccionados controlado |
| `defaultValue` | `readonly string[]` | `[]` | Conjunto seleccionado inicial no controlado |
| `onValueChange` | `(value: readonly string[]) => void` | — | Devolución de llamada al cambiar el conjunto seleccionado |
| `children` | `PingoNode` | — | Lista de `ToggleGroupItem` (obligatorio) |
| `className` | `string` | — | Se añade después del nombre de clase del componente |

### ToggleGroupItem

| Prop | Tipo | Valor predeterminado | Descripción |
| --- | --- | --- | --- |
| `value` | `string` | — | Valor del elemento (obligatorio) |
| `children` | `string` | — | Texto del elemento (obligatorio) |
| `disabled` | `boolean` | `false` | Desactiva un elemento individual |
| `className` | `string` | — | Se añade después del nombre de clase del componente |

## Accesibilidad

El contenedor del grupo tiene semántica de `group`; cada elemento hereda la semántica de botón y los valores semánticos `on` / `off` de Toggle. El manejo del teclado se concentra en el grupo: `←`/`→` mueve el foco al elemento adyacente, `Enter`/`espacio` alterna el elemento actual; la adición o eliminación de elementos no afecta esta navegación.
