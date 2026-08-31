---
title: Select
description: Selector desplegable compuesto, compatible con navegación por teclado y renderizado en el pingo canvas.
---

# Select

El selector desplegable se compone de `Select`, `SelectTrigger`, `SelectContent` y `SelectItem`. La vista previa de abajo la renderiza en tiempo real el motor pingo: la lista ya está expandida, puedes navegar con las teclas de dirección, seleccionar con Enter y alternar entre tema claro y oscuro según el tema del sitio.

:::preview select-basic
:::

## Uso

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger } from "@dopejs/pingo-ui";

root.render(
  <Select value="pingo-ui" onValueChange={(value) => console.log(value)}>
    <SelectTrigger placeholder="选择一个包" />
    <SelectContent>
      <SelectItem value="pingo">@dopejs/pingo</SelectItem>
      <SelectItem value="pingo-ui">@dopejs/pingo-ui</SelectItem>
    </SelectContent>
  </Select>,
);
```

Todas las partes colaboran mediante contexto y deben montarse como componentes con JSX. El disparador muestra el `value` seleccionado actualmente; cuando no hay selección, muestra el `placeholder`.

## Ejemplos

### Expandido por defecto

`defaultOpen` hace que la lista se expanda inicialmente (como en la vista previa de arriba); `onOpenChange` escucha los cambios de apertura y cierre.

## Props

### Select

| Prop            | Tipo                      | Valor por defecto | Descripción                                                                  |
| --------------- | ------------------------- | ----------------- | ---------------------------------------------------------------------------- |
| `value`         | `string`                  | —                 | Valor seleccionado, mostrado en el disparador                                |
| `defaultOpen`   | `boolean`                 | `false`           | Expandido inicialmente                                                       |
| `onValueChange` | `(value: string) => void` | —                 | Callback de cambio de selección (se cierra automáticamente tras seleccionar) |
| `onOpenChange`  | `(open: boolean) => void` | —                 | Callback de apertura y cierre                                                |
| `children`      | `PingoNode`               | —                 | Disparador y contenido (obligatorio)                                         |
| `className`     | `string`                  | —                 | Se añade después del nombre de clase del componente                          |

### SelectTrigger

| Prop          | Tipo        | Valor por defecto | Descripción                                                                                                            |
| ------------- | ----------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `children`    | `PingoNode` | —                 | Contenido personalizado del disparador; por defecto renderiza el valor seleccionado o el texto de marcador de posición |
| `placeholder` | `string`    | —                 | Texto de marcador de posición cuando no hay selección                                                                  |
| `className`   | `string`    | —                 | Se añade después del nombre de clase del componente                                                                    |

### SelectContent

| Prop        | Tipo        | Valor por defecto | Descripción                                         |
| ----------- | ----------- | ----------------- | --------------------------------------------------- |
| `children`  | `PingoNode` | —                 | Lista de `SelectItem` (obligatorio)                 |
| `className` | `string`    | —                 | Se añade después del nombre de clase del componente |

### SelectItem

| Prop        | Tipo     | Valor por defecto | Descripción                                         |
| ----------- | -------- | ----------------- | --------------------------------------------------- |
| `value`     | `string` | —                 | Valor de la opción (obligatorio)                    |
| `children`  | `string` | —                 | Texto de la opción (obligatorio)                    |
| `className` | `string` | —                 | Se añade después del nombre de clase del componente |

## Accesibilidad

El disparador tiene semántica de botón y alterna entre `expanded` y `collapsed`; el contenido tiene semántica de menú. Las teclas de dirección mueven el resaltado, `Enter`/`espacio` seleccionan, `Esc` cierra; tras seleccionar, el foco vuelve al disparador.
