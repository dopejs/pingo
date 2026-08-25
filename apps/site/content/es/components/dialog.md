---
title: Dialog
description: Diálogo modal que interrumpe el flujo para obtener entrada o confirmación del usuario, renderizado sobre el lienzo de pingo.
---

# Dialog

El diálogo abre un panel modal sobre el contenido actual, con un fondo de superposición. La vista previa siguiente es renderizada en tiempo real por el motor de pingo: hacer clic en la superposición o presionar `Escape` dispara `onOpenChange(false)` y alterna entre claro y oscuro según el tema del sitio.

:::preview dialog-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import {
  Button,
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@dopejs/pingo-ui";

root.render(
  createElement(Dialog, {
    open,
    onOpenChange: (next) => setOpen(next),
    children: [
      createElement(DialogHeader, {
        children: [
          createElement(DialogTitle, { children: "编辑资料" }),
          createElement(DialogDescription, { children: "修改会立即同步。" }),
        ],
      }),
      createElement(DialogFooter, {
        children: createElement(Button, { children: "保存", onPress: () => save() }),
      }),
    ],
  }),
);
```

La capa flotante del diálogo llena **su propio contenedor padre** (no la ventana gráfica), así que móntalo cerca del nodo raíz. `open` es una prop controlada: el componente no mantiene el estado de apertura y, al cerrarse, notifica al llamador mediante `onOpenChange(false)`.

## Ejemplos

### Bloques combinados

`DialogHeader` / `DialogTitle` / `DialogDescription` / `DialogFooter` son componentes puramente de disposición y tipografía; combínalos según necesites. `children` acepta cualquier `PingoNode`, por lo que formularios y listas también pueden ir dentro del panel.

## Props

### Dialog

| Prop           | Tipo                      | Valor predeterminado | Descripción                                              |
| -------------- | ------------------------- | -------------------- | -------------------------------------------------------- |
| `open`         | `boolean`                 | —                    | Si está abierto (obligatorio, controlado)                |
| `onOpenChange` | `(open: boolean) => void` | —                    | Callback al solicitar cerrar o abrir                     |
| `children`     | `PingoNode`               | —                    | Contenido del panel (obligatorio)                        |
| `className`    | `string`                  | —                    | Se añade después del nombre de clase de la capa flotante |

### DialogHeader / DialogFooter

| Prop        | Tipo        | Valor predeterminado | Descripción                        |
| ----------- | ----------- | -------------------- | ---------------------------------- |
| `children`  | `PingoNode` | —                    | Contenido del bloque (obligatorio) |
| `className` | `string`    | —                    | Nombre de clase adicional          |

### DialogTitle / DialogDescription

| Prop        | Tipo     | Valor predeterminado | Descripción                      |
| ----------- | -------- | -------------------- | -------------------------------- |
| `children`  | `string` | —                    | Contenido de texto (obligatorio) |
| `className` | `string` | —                    | Nombre de clase adicional        |

## Accesibilidad

El panel tiene semántica de diálogo; al abrirlo, el foco se mueve al panel y, tras cerrarlo con `Escape`, el foco regresa al elemento disparador. Los elementos interactivos dentro del panel se registran en el ciclo de tabulación. Para el título usa `DialogTitle` (semántica de encabezado).
