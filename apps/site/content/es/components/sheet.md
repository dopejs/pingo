---
title: Sheet
description: Panel que se desliza desde cualquier borde de la pantalla, ideal para filtros, detalles y otros contenidos secundarios.
---

# Sheet

Sheet desliza un panel desde el borde del contenedor. Suele usarse para filtros, paneles laterales de detalle y otros contenidos secundarios que no interrumpen el flujo principal. La vista previa inferior se renderiza en tiempo real mediante el motor de pingo y alterna entre tema claro y oscuro según el sitio.

:::preview sheet-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { Sheet } from "@dopejs/pingo-ui";

root.render(
  createElement(Sheet, {
    open,
    onOpenChange: (next) => setOpen(next),
    side: "right",
    children: createElement("text", { value: "面板内容" }),
  }),
);
```

La capa flotante llena su propio contenedor padre; móntala cerca del nodo raíz. `open` es una prop controlada; al hacer clic en el respaldo o pulsar `Escape` se solicita el cierre mediante `onOpenChange(false)`. Los bloques de título y botones dentro del panel pueden reutilizar `DialogHeader`, `DialogTitle`, `DialogDescription` y `DialogFooter`.

## Ejemplos

### Dirección

`side` admite `"left"`, `"right"`, `"top"` y `"bottom"`, con `"right"` como valor predeterminado. Si solo necesitas los bordes superior o inferior, usa [Drawer](/components/drawer), que tiene una semántica más clara.

## Props

Hereda `DialogProps` (`open`, `onOpenChange`, `children`, `className`), además de:

| Prop   | Tipo                                     | Valor predeterminado | Descripción                   |
| ------ | ---------------------------------------- | -------------------- | ----------------------------- |
| `side` | `"left" \| "right" \| "top" \| "bottom"` | `"right"`            | Borde desde el que se desliza |

## Accesibilidad

El panel tiene semántica complementary; al abrirse, el foco se desplaza al panel y, tras cerrarse con `Escape`, el foco regresa al elemento que lo activó.
