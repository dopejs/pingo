---
title: Grupo de radio
description: Grupo de opciones de selección única, compatible con navegación por teclas de dirección, renderizado en el lienzo de pingo.
---

# Grupo de radio

El grupo de radio se utiliza para seleccionar una opción de un conjunto de opciones mutuamente excluyentes. La siguiente vista previa se renderiza en tiempo real mediante el motor de pingo: puede hacer clic en una opción o usar las teclas de dirección para cambiar la selección, y sigue el cambio de tema claro/oscuro del sitio.

:::preview radio-group-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { RadioGroup, RadioGroupItem } from "@dopejs/pingo-ui";

root.render(
  createElement(RadioGroup, {
    defaultValue: "b",
    onValueChange: (value) => console.log(value),
    children: [
      createElement(RadioGroupItem, { value: "a", label: "选项 A" }),
      createElement(RadioGroupItem, { value: "b", label: "选项 B" }),
      createElement(RadioGroupItem, { value: "c", label: "选项 C" }),
    ],
  }),
);
```

`RadioGroup` publica el valor actual a `RadioGroupItem` mediante context, por lo que ambos deben montarse como componentes con `createElement`. Al pasar `value` se entra en modo controlado; de lo contrario, use `defaultValue` para que el componente mantenga su propio estado.

## Ejemplos

### Deshabilitado

Pasar `disabled` en `RadioGroup` deshabilita todo el grupo y el valor semántico de cada elemento pasa a ser `disabled`.

## Props

### RadioGroup

| Prop | Tipo | Valor predeterminado | Descripción |
| --- | --- | --- | --- |
| `value` | `string` | — | Valor seleccionado controlado |
| `defaultValue` | `string` | — | Valor seleccionado inicial no controlado |
| `onValueChange` | `(value: string) => void` | — | Callback al cambiar la selección |
| `disabled` | `boolean` | `false` | Deshabilita todo el grupo |
| `children` | `PingoNode` | — | Lista de `RadioGroupItem` (obligatorio) |
| `className` | `string` | — | Se añade después del nombre de clase del componente |

### RadioGroupItem

| Prop | Tipo | Valor predeterminado | Descripción |
| --- | --- | --- | --- |
| `value` | `string` | — | Valor de la opción (obligatorio) |
| `label` | `string` | — | Texto de la opción |
| `className` | `string` | — | Se añade después del nombre de clase del componente |

## Accesibilidad

El contenedor del grupo tiene semántica `radiogroup` y cada elemento tiene semántica `radio`, alternando entre `checked` / `unchecked` / `disabled`. Sigue WAI-ARIA: independientemente de la dirección del diseño, ambos pares de teclas de dirección permiten mover la selección y sincronizar el foco.
