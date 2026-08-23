---
title: Popover
description: Panel flotante anclado junto al disparador para información complementaria y acciones ligeras.
---

# Popover

Popover abre un panel flotante junto al disparador y el panel permanece anclado al desplazarse la página. La siguiente vista previa se renderiza en tiempo real mediante el motor pingo: haz clic en el disparador para abrir y cerrar, y sigue el tema claro/oscuro del sitio.

:::preview popover-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@dopejs/pingo-ui";

root.render(
  createElement(Popover, {
    defaultOpen: false,
    onOpenChange: (open) => {},
    children: [
      createElement(PopoverTrigger, {
        children: createElement(Button, { children: "打开浮层", onPress: () => {} }),
      }),
      createElement(PopoverContent, {
        children: createElement("text", { value: "任意内容" }),
      }),
    ],
  }),
);
```

`PopoverTrigger` y `PopoverContent` leen el estado del componente raíz mediante context y deben ser nodos hijos del mismo `Popover`. Por defecto no está controlado (`defaultOpen`); si pasas `open`, pasa a modo controlado. El panel se ancla por defecto debajo del disparador; al activar la lectura de diseño, se voltea automáticamente al otro lado cuando no hay espacio suficiente.

## Ejemplos

### Cualquier contenido

El `children` de `PopoverContent` acepta cualquier `PingoNode`, por lo que puede contener formularios, listas o contenido tipográfico.

:::preview popover-rich
:::

## Props

### Popover

| Prop           | Tipo                      | Valor por defecto | Descripción                                               |
| -------------- | ------------------------- | ----------------- | --------------------------------------------------------- |
| `open`         | `boolean`                 | —                 | Estado controlado de apertura y cierre                    |
| `defaultOpen`  | `boolean`                 | `false`           | Apertura inicial no controlada                            |
| `onOpenChange` | `(open: boolean) => void` | —                 | Callback al cambiar la apertura                           |
| `children`     | `PingoNode`               | —                 | Trigger y Content (obligatorio)                           |
| `className`    | `string`                  | —                 | Se añade después del nombre de clase del contenedor ancla |

### PopoverTrigger

| Prop        | Tipo        | Valor por defecto | Descripción                       |
| ----------- | ----------- | ----------------- | --------------------------------- |
| `children`  | `PingoNode` | —                 | Elemento disparador (obligatorio) |
| `className` | `string`    | —                 | Clase adicional                   |

### PopoverContent

| Prop        | Tipo        | Valor por defecto | Descripción                       |
| ----------- | ----------- | ----------------- | --------------------------------- |
| `children`  | `PingoNode` | —                 | Contenido del panel (obligatorio) |
| `className` | `string`    | —                 | Clase adicional                   |

## Accesibilidad

El disparador tiene semántica de botón y expone el estado expandido/contraído; `Escape` cierra el panel y devuelve el foco al disparador.
