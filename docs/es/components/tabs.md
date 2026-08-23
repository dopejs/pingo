---
title: Tabs
description: Las pestañas alternan un conjunto de paneles del mismo nivel, renderizados en el lienzo de pingo.
---

# Tabs

Las pestañas alternan varios paneles de contenido del mismo nivel dentro de una misma región. La siguiente vista previa es renderizada en tiempo real por el motor de pingo: puedes hacer clic en las pestañas para cambiar de panel, o usar las teclas de flecha izquierda y derecha para moverte entre ellas.

:::preview tabs-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@dopejs/pingo-ui";

root.render(
  createElement(Tabs, {
    defaultValue: "account",
    children: [
      createElement(TabsList, {
        children: [
          createElement(TabsTrigger, { value: "account", children: "Cuenta" }),
          createElement(TabsTrigger, { value: "password", children: "Contraseña" }),
        ],
      }),
      createElement(TabsContent, {
        value: "account",
        children: createElement("text", { value: "Administra la información de tu cuenta." }),
      }),
      createElement(TabsContent, {
        value: "password",
        children: createElement("text", { value: "Cambia tu contraseña de acceso." }),
      }),
    ],
  }),
);
```

`Tabs` admite tanto el uso no controlado (`defaultValue`) como el controlado (`value` + `onValueChange`).

## Props

### Tabs

| Prop            | Tipo                      | Valor por defecto | Descripción                                                    |
| --------------- | ------------------------- | ----------------- | -------------------------------------------------------------- |
| `value`         | `string`                  | —                 | Controlado: `value` de la pestaña seleccionada actualmente     |
| `defaultValue`  | `string`                  | —                 | No controlado: `value` de la pestaña seleccionada inicialmente |
| `onValueChange` | `(value: string) => void` | —                 | Callback cuando cambia la selección                            |
| `children`      | `PingoNode`               | —                 | `TabsList` y varios `TabsContent` (obligatorio)                |
| `className`     | `string`                  | —                 | Se añade después del nombre de clase del componente            |

### TabsList

| Prop        | Tipo        | Valor por defecto | Descripción                                         |
| ----------- | ----------- | ----------------- | --------------------------------------------------- |
| `children`  | `PingoNode` | —                 | Lista de `TabsTrigger` (obligatorio)                |
| `className` | `string`    | —                 | Se añade después del nombre de clase del componente |

### TabsTrigger

| Prop        | Tipo     | Valor por defecto | Descripción                                                           |
| ----------- | -------- | ----------------- | --------------------------------------------------------------------- |
| `value`     | `string` | —                 | Identificador asociado al `TabsContent` correspondiente (obligatorio) |
| `children`  | `string` | —                 | Texto de la pestaña (obligatorio)                                     |
| `className` | `string` | —                 | Se añade después del nombre de clase del componente                   |

### TabsContent

| Prop        | Tipo        | Valor por defecto | Descripción                                                           |
| ----------- | ----------- | ----------------- | --------------------------------------------------------------------- |
| `value`     | `string`    | —                 | Identificador asociado al `TabsTrigger` correspondiente (obligatorio) |
| `children`  | `PingoNode` | —                 | Contenido del panel (obligatorio)                                     |
| `className` | `string`    | —                 | Se añade después del nombre de clase del componente                   |

## Accesibilidad

La lista de pestañas tiene semántica de tablist, las pestañas tienen semántica de tab y exponen el estado de selección a las tecnologías de asistencia. Las teclas de flecha izquierda y derecha, junto con Home/End, se mueven entre pestañas y las seleccionan al mismo tiempo, y el foco se desplaza junto con la selección; los paneles inactivos se ocultan con `display: none` en lugar de desmontarse, de modo que se conservan la posición de desplazamiento y el estado de edición dentro del panel.
