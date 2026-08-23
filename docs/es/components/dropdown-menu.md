---
title: Menú desplegable
description: Menú de acciones que se expande al hacer clic en el activador, con soporte de navegación por teclado.
---

# Menú desplegable

El menú desplegable expande un conjunto de elementos de acción debajo del activador. La siguiente vista previa es renderizada en tiempo real por el motor pingo: haz clic en el activador para abrir y cerrar, y sigue el tema del sitio al alternar entre claro y oscuro.

:::preview dropdown-menu-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@dopejs/pingo-ui";

root.render(
  createElement(DropdownMenu, {
    onValueChange: (value) => run(value),
    children: [
      createElement(DropdownMenuTrigger, {
        children: createElement(Button, { children: "打开菜单", onPress: () => {} }),
      }),
      createElement(DropdownMenuContent, {
        children: [
          createElement(DropdownMenuItem, { value: "profile", children: "个人资料" }),
          createElement(DropdownMenuItem, { value: "settings", children: "设置" }),
        ],
      }),
    ],
  }),
);
```

Trigger y Content leen el estado del componente raíz a través del contexto, y deben ser nodos hijos del mismo `DropdownMenu`. Al seleccionar un elemento se dispara `onValueChange` y el menú se cierra automáticamente. La apertura y el cierre son no controlados por defecto (`defaultOpen`); el componente no ofrece una prop controlada `open` — si necesitas una selección de lista completamente controlada, utiliza Select (ambos comparten la misma implementación).

## Props

### DropdownMenu

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | — | Valor seleccionado actualmente (resalta el elemento correspondiente) |
| `defaultOpen` | `boolean` | `false` | Estado inicial de apertura |
| `onValueChange` | `(value: string) => void` | — | Callback al seleccionar un elemento del menú |
| `onOpenChange` | `(open: boolean) => void` | — | Callback al cambiar el estado de apertura |
| `children` | `PingoNode` | — | Trigger y Content (obligatorio) |
| `className` | `string` | — | Se añade después del nombre de clase del contenedor ancla |

### DropdownMenuTrigger

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | Elemento activador; si no se proporciona, renderiza el valor actual o el texto de respaldo |
| `placeholder` | `string` | — | Texto de respaldo cuando no hay valor seleccionado |
| `className` | `string` | — | Nombre de clase adicional |

### DropdownMenuContent

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | Elementos del menú (obligatorio) |
| `className` | `string` | — | Nombre de clase adicional |

### DropdownMenuItem

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | — | Valor del elemento del menú (obligatorio) |
| `children` | `string` | — | Texto mostrado (obligatorio) |
| `className` | `string` | — | Nombre de clase adicional |

## Accesibilidad

El menú tiene semántica de menu y los elementos de menú tienen semántica de menuitem; al abrirse, las teclas de dirección suben y bajan, `Enter`/`Space` seleccionan y `Escape` cierra y devuelve el foco al activador.
