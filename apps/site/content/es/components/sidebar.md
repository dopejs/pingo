---
title: Sidebar
description: "Navegación lateral del producto: agrupaciones, elementos y estado seleccionado, renderizada en el lienzo de pingo."
---

# Sidebar

Sidebar es una columna de navegación a nivel de aplicación compuesta por secciones (Section) y elementos (Item), con estado seleccionado y navegación por teclado integrados. La siguiente vista previa es renderizada en tiempo real por el motor pingo: haz clic en un elemento o enfócalo y cambia con las teclas de dirección.

:::preview sidebar-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { Sidebar, SidebarItem, SidebarSection } from "@dopejs/pingo-ui";

root.render(
  createElement(Sidebar, {
    defaultValue: "stats",
    onValueChange: (value) => navigate(value),
    children: [
      createElement(SidebarSection, {
        title: "工作区",
        children: [
          createElement(SidebarItem, { value: "home", label: "首页" }),
          createElement(SidebarItem, { value: "stats", label: "统计" }),
        ],
      }),
      createElement(SidebarSection, {
        title: "系统",
        children: createElement(SidebarItem, { value: "settings", label: "设置" }),
      }),
    ],
  }),
);
```

`Sidebar` admite tanto el modo no controlado (`defaultValue`) como el controlado (`value` + `onValueChange`). El ancho de la barra lateral lo determina un token del tema (240px por defecto).

## Props

### Sidebar

| Prop            | Tipo                      | Valor predeterminado | Descripción                                                   |
| --------------- | ------------------------- | -------------------- | ------------------------------------------------------------- |
| `value`         | `string`                  | —                    | Controlado: `value` del elemento seleccionado actualmente     |
| `defaultValue`  | `string`                  | —                    | No controlado: `value` del elemento seleccionado inicialmente |
| `onValueChange` | `(value: string) => void` | —                    | Callback al cambiar la selección                              |
| `children`      | `PingoNode`               | —                    | Lista de `SidebarSection` (obligatorio)                       |
| `className`     | `string`                  | —                    | Se agrega después del nombre de clase del componente          |

### SidebarSection

| Prop        | Tipo        | Valor predeterminado | Descripción                                                      |
| ----------- | ----------- | -------------------- | ---------------------------------------------------------------- |
| `title`     | `string`    | —                    | Título del grupo; si se omite, no se renderiza la fila de título |
| `children`  | `PingoNode` | —                    | Lista de `SidebarItem` (obligatorio)                             |
| `className` | `string`    | —                    | Se agrega después del nombre de clase del componente             |

### SidebarItem

| Prop        | Tipo        | Valor predeterminado | Descripción                                                           |
| ----------- | ----------- | -------------------- | --------------------------------------------------------------------- |
| `value`     | `string`    | —                    | Identificador único del elemento (obligatorio)                        |
| `label`     | `string`    | —                    | Texto del elemento, usado también como nombre accesible (obligatorio) |
| `icon`      | `PingoNode` | —                    | Ranura delantera para el icono                                        |
| `className` | `string`    | —                    | Se agrega después del nombre de clase del componente                  |

## Accesibilidad

La barra lateral tiene semántica de navigation; los elementos tienen semántica de link, usan `label` como nombre accesible y exponen el estado selected/unselected. Las teclas de dirección arriba/abajo y Home/End se mueven entre elementos, moviendo la selección y el foco a la vez.

Para personalizar el ancho y los colores de la barra lateral, consulta la [guía de estilos](/guide/styling).
