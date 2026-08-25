---
title: Alert Dialog
description: Diálogo de confirmación para operaciones destructivas, con el par de botones cancelar/confirmar incorporado.
---

# Alert Dialog

El diálogo de confirmación es un Dialog con el par de botones «cancelar / confirmar» incorporado,
para la doble confirmación antes de operaciones irreversibles. La vista previa de abajo se
renderiza en vivo con el motor pingo y sigue el tema del sitio al cambiar entre claro y oscuro.

:::preview alert-dialog-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { AlertDialog } from "@dopejs/pingo-ui";

root.render(
  createElement(AlertDialog, {
    open,
    onOpenChange: (next) => setOpen(next),
    title: "确认退出？",
    description: "未保存的修改将会丢失。",
    onCancel: () => {},
    onAction: () => quit(),
    children: null,
  }),
);
```

Al igual que Dialog, la capa flotante llena su propio contenedor padre: móntalo cerca del nodo
raíz. Ojo: `children` se hereda de `DialogProps` y sigue siendo obligatorio, pero la estructura de
título/descripción/botones incorporada del componente lo sobrescribe, así que basta con pasar
`null`. Hacer clic en cancelar o confirmar dispara primero el callback correspondiente y luego
solicita el cierre mediante `onOpenChange(false)`; hacer clic en la máscara también lo cierra.

## Ejemplos

### Operación destructiva

`destructive` renderiza el botón de confirmación en el color de peligro.

:::preview alert-dialog-destructive
:::

## Props

Hereda `DialogProps` (`open`, `onOpenChange`, `children`, `className`), y además:

| Prop          | Tipo         | Valor predeterminado | Descripción                                      |
| ------------- | ------------ | -------------------- | ------------------------------------------------ |
| `title`       | `string`     | —                    | Título (obligatorio)                             |
| `description` | `string`     | —                    | Explicación complementaria                       |
| `cancelLabel` | `string`     | `"取消"`             | Texto del botón cancelar                         |
| `actionLabel` | `string`     | `"确定"`             | Texto del botón confirmar                        |
| `onCancel`    | `() => void` | —                    | Callback de cancelar (después se cierra)         |
| `onAction`    | `() => void` | —                    | Callback de confirmar (después se cierra)        |
| `destructive` | `boolean`    | `false`              | El botón de confirmación usa el color de peligro |

## Accesibilidad

Tiene semántica dialog; los botones cancelar y confirmar están registrados en el ciclo de Tab, de
modo que el usuario de teclado no queda atrapado en el diálogo.
