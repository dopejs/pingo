---
title: Menubar
description: Barra de menú de aplicación estilo escritorio; varios menús comparten un único punto de apertura.
---

# Menubar

Menubar es una fila de menús que comparten un único punto de apertura, similar a la barra de menús de una aplicación de escritorio. La siguiente vista previa se renderiza en tiempo real mediante el motor pingo: haz clic en las pestañas «Archivo», «Edición», etc. para abrir y cerrar el menú correspondiente, y el tema cambia entre claro y oscuro según el sitio.

:::preview menubar-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { Menubar, MenubarMenu } from "@dopejs/pingo-ui";

root.render(
  createElement(Menubar, {
    onValueChange: (value) => {},
    children: [
      createElement(MenubarMenu, {
        value: "file",
        label: "Archivo",
        children: createElement("text", { value: "Nuevo" }),
      }),
      createElement(MenubarMenu, {
        value: "edit",
        label: "Edición",
        children: createElement("text", { value: "Deshacer" }),
      }),
    ],
  }),
);
```

`MenubarMenu` lee el estado de la barra de menú mediante context y debe ser un nodo hijo de `Menubar`; su `children` es el contenido del panel que se muestra al abrirlo. La apertura y cierre son no controlados por defecto; al pasar `value` se cambia al modo controlado (el valor es el `value` del menú actualmente abierto).

## Ejemplos

### Apertura controlada

Pasa `value` para fijar el menú abierto; útil para guías iniciales o sincronización con estado externo.

:::preview menubar-open
:::

## Props

### Menubar

| Prop | Tipo | Valor predeterminado | Descripción |
| --- | --- | --- | --- |
| `value` | `string` | — | Controlado: valor del menú actualmente abierto |
| `onValueChange` | `(value: string \| undefined) => void` | — | Callback al cambiar el menú abierto (`undefined` al cerrarse) |
| `children` | `PingoNode` | — | Varios `MenubarMenu` (obligatorio) |
| `className` | `string` | — | Clase adicional |
| `navigation` | `boolean` | `false` | Usa semántica de navegación (uso interno de [NavigationMenu](/components/navigation-menu)) |

### MenubarMenu

| Prop | Tipo | Valor predeterminado | Descripción |
| --- | --- | --- | --- |
| `value` | `string` | — | Identificador del menú (obligatorio) |
| `label` | `string` | — | Etiqueta mostrada en la barra (obligatorio) |
| `children` | `PingoNode` | — | Contenido del panel al abrirse (obligatorio) |
| `className` | `string` | — | Clase adicional |

## Accesibilidad

La barra de menú tiene semántica de menubar y las pestañas tienen semántica de menuitem, exponiendo el estado expanded/collapsed; las flechas izquierda y derecha se mueven entre menús y también alternan cuando un menú está abierto; `Escape` cierra y enfoca la pestaña actual.
