---
title: Drawer
description: Panel deslizante desde los bordes superior e inferior, ideal para acciones inferiores en estilo móvil.
---

# Drawer

El Drawer es un panel que se desliza desde un borde horizontal —equivale a un [Sheet](/components/sheet) cuyo `side` solo admite `"top" | "bottom"`. La vista previa a continuación es renderizada en tiempo real por el motor pingo y alterna entre claro y oscuro según el tema del sitio.

:::preview drawer-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { Drawer } from "@dopejs/pingo-ui";

root.render(
  createElement(Drawer, {
    open,
    onOpenChange: (next) => setOpen(next),
    side: "bottom",
    children: createElement("text", { value: "抽屉内容" }),
  }),
);
```

La capa superpuesta llena su propio contenedor padre; móntela cerca del nodo raíz. `open` es una prop controlada; al hacer clic en la máscara o presionar `Escape` se solicita el cierre mediante `onOpenChange(false)`. Los bloques de título y botones dentro del panel pueden reutilizar `DialogHeader`, `DialogTitle`, `DialogDescription` y `DialogFooter`.

## Ejemplos

### Dirección

`side` admite `"top"` y `"bottom"`, con `"bottom"` como valor predeterminado.

## Props

Hereda `DialogProps` (`open`, `onOpenChange`, `children`, `className`), además de:

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `side` | `"top" \| "bottom"` | `"bottom"` | Borde desde el que se desliza |

## Accesibilidad

El panel posee semántica complementary; al abrirse, el foco se mueve al panel y, tras cerrarse con `Escape`, el foco regresa al elemento que lo activó.
