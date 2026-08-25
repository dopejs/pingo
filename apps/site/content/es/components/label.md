---
title: Label
description: Texto de etiqueta para formularios, usado junto con controles de entrada y renderizado en el lienzo de pingo.
---

# Label

La etiqueta se utiliza para proporcionar un nombre visible a los controles de formulario. La siguiente vista previa se renderiza en tiempo real mediante el motor de pingo y alterna entre modo claro y oscuro según el tema del sitio.

:::preview label-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { Input, Label } from "@dopejs/pingo-ui";

root.render(
  createElement("container", {
    style: { flexDirection: "column" },
    children: [
      createElement(Label, { children: "邮箱" }),
      createElement("container", { height: 8 }),
      createElement(Input, { semanticLabel: "邮箱", width: 320 }),
    ],
  }),
);
```

pingo no tiene una propiedad `gap`, por lo que el espacio entre la etiqueta y el control se implementa con un contenedor de tamaño fijo.

## Ejemplos

### Nombre semántico

La asociación de controles aún no existe en pingo, por lo que la relación entre la etiqueta y el control se basa en una convención: pasa al control un `semanticLabel` idéntico al de la etiqueta, de modo que los lectores de pantalla lean el mismo nombre.

## Props

| Prop            | Tipo     | Valor predeterminado | Descripción                                                                  |
| --------------- | -------- | -------------------- | ---------------------------------------------------------------------------- |
| `children`      | `string` | —                    | Texto de la etiqueta (obligatorio)                                           |
| `className`     | `string` | —                    | Se añade después del nombre de clase del componente                          |
| `semanticLabel` | `string` | —                    | Anula el nombre de accesibilidad; por defecto se usa el texto de la etiqueta |

## Accesibilidad

pingo todavía no cuenta con un mecanismo de asociación etiqueta–control; Label es solo texto con estilo. Configura siempre `semanticLabel` en el control correspondiente para que el nombre de accesibilidad no dependa de la proximidad visual.
