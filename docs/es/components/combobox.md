---
title: Combobox
description: Selector desplegable con búsqueda que filtra una lista de opciones y se renderiza en el lienzo de pingo.
---

# Combobox

Un combobox combina un disparador que muestra el valor seleccionado con una lista de opciones con búsqueda. La siguiente vista previa se renderiza en tiempo real mediante el motor de pingo: la lista ya está expandida, puedes escribir para filtrar, elegir con las teclas de dirección y alternar entre tema claro y oscuro según el sitio.

:::preview combobox-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { Combobox } from "@dopejs/pingo-ui";

root.render(
  createElement(Combobox, {
    items: [
      { value: "next", label: "Next.js" },
      { value: "remix", label: "Remix" },
      { value: "astro", label: "Astro" },
    ],
    placeholder: "选择框架",
    onValueChange: (value) => console.log(value),
  }),
);
```

`items` es un arreglo de `{ value, label }`; el filtrado es una coincidencia de subcadena sobre `label` sin distinguir mayúsculas de minúsculas, deliberadamente sin ordenamiento difuso: un orden incorrecto es peor que no ordenar. Al seleccionar, la lista se cierra automáticamente y el término de búsqueda se limpia **al cerrarse**, para evitar reabrir con un filtro olvidado hace tiempo.

## Ejemplos

### Controlado

Tanto `value` / `onValueChange` como `open` / `onOpenChange` pueden ser controlados; por defecto el componente mantiene su propio estado con `defaultValue` / `defaultOpen`.

### Estado vacío

`emptyLabel` personaliza el texto de aviso cuando el filtrado no devuelve resultados.

## Props

| Prop | Tipo | Valor por defecto | Descripción |
| --- | --- | --- | --- |
| `items` | `readonly { value: string; label: string }[]` | — | Lista de opciones (obligatoria) |
| `value` | `string` | — | Valor seleccionado controlado |
| `defaultValue` | `string` | — | Valor inicial seleccionado no controlado |
| `onValueChange` | `(value: string) => void` | — | Callback de cambio de selección (se cierra automáticamente tras seleccionar) |
| `open` | `boolean` | — | Apertura controlada |
| `defaultOpen` | `boolean` | `false` | Apertura inicial no controlada |
| `onOpenChange` | `(open: boolean) => void` | — | Callback de apertura/cierre |
| `placeholder` | `string` | `"请选择"` | Texto de marcador de posición en el disparador cuando no hay selección |
| `emptyLabel` | `string` | — | Aviso cuando el filtrado no devuelve resultados |
| `className` | `string` | — | Se agrega después de la clase del componente |

## Accesibilidad

El disparador tiene semántica de botón y alterna entre `expanded` y `collapsed`. Al abrir la lista, el foco entra en el campo de búsqueda; las teclas de dirección mueven el resaltado y Enter selecciona y cierra; al cerrarse, el foco regresa al disparador.
