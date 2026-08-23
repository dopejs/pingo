---
title: Context Menu
description: Menú contextual que se abre con clic derecho y aparece en el punto donde se pulsa el puntero.
---

# Context Menu

Context Menu abre un menú en la posición del puntero al hacer clic derecho (evento `contextmenu`) sobre el área objetivo. La siguiente vista previa es renderizada en tiempo real por el motor pingo: haz clic derecho sobre el área de texto para abrir el menú, que alterna entre tema claro y oscuro según el sitio.

:::preview context-menu-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { ContextMenu } from "@dopejs/pingo-ui";

root.render(
  createElement(ContextMenu, {
    items: [
      { value: "copy", label: "复制" },
      { value: "paste", label: "粘贴", disabled: true },
      { value: "delete", label: "删除" },
    ],
    onSelect: (value) => run(value),
    children: createElement("text", { value: "在此右键" }),
  }),
);
```

El menú se posiciona en el punto donde se pulsa el puntero y no en la esquina del disparador; se cierra con `Escape` o al elegir una opción. Los elementos deshabilitados no participan en la navegación por teclado ni responden a clics. En el renderizado estático solo se muestra el área de activación; el menú aparece al hacer clic derecho.

## Props

| Prop           | Tipo                          | Valor predeterminado | Descripción                                    |
| -------------- | ----------------------------- | -------------------- | ---------------------------------------------- |
| `children`     | `PingoNode`                   | —                    | Contenido del área de activación (obligatorio) |
| `items`        | `readonly ContextMenuEntry[]` | —                    | Elementos del menú (obligatorio)               |
| `onSelect`     | `(value: string) => void`     | —                    | Callback al seleccionar un elemento del menú   |
| `onOpenChange` | `(open: boolean) => void`     | —                    | Callback al cambiar el estado de apertura      |
| `className`    | `string`                      | —                    | Clase adicional                                |

### ContextMenuEntry

| Campo      | Tipo      | Valor predeterminado | Descripción                               |
| ---------- | --------- | -------------------- | ----------------------------------------- |
| `value`    | `string`  | —                    | Valor del elemento del menú (obligatorio) |
| `label`    | `string`  | —                    | Texto visible (obligatorio)               |
| `disabled` | `boolean` | `false`              | Estado deshabilitado                      |

## Accesibilidad

El menú tiene semántica de menu y los elementos tienen semántica de menuitem; una vez abierto, las flechas arriba y abajo mueven la selección y `Escape` lo cierra.
