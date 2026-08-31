---
title: Tooltip
description: Texto breve de ayuda que se muestra al pasar el cursor, anclado sobre el elemento objetivo.
---

# Tooltip

Tooltip muestra un texto breve de ayuda cuando el puntero pasa por encima, anclado por defecto sobre el objetivo. La vista previa inferior se renderiza en tiempo real mediante el motor pingo: pase el puntero sobre el botón para ver el globo, que también alterna entre modo claro y oscuro según el tema del sitio.

:::preview tooltip-basic
:::

## Uso

```tsx
import { Button, Tooltip } from "@dopejs/pingo-ui";

root.render(
  <Tooltip content="Guardar en la nube">
    <Button onPress={() => save()}>Guardar</Button>
  </Tooltip>,
);
```

Tooltip se activa por la entrada y salida del puntero (`pointerenter` / `pointerleave`), sin props controladas; en el renderizado estático solo se muestra el elemento desencadenante y el globo aparece al pasar el cursor.

## Props

| Prop        | Tipo        | Valor por defecto | Descripción                                                    |
| ----------- | ----------- | ----------------- | -------------------------------------------------------------- |
| `content`   | `string`    | —                 | Texto del globo (obligatorio)                                  |
| `children`  | `PingoNode` | —                 | Elemento desencadenante (obligatorio)                          |
| `className` | `string`    | —                 | Se añade después del nombre de clase del contenedor de anclaje |

## Accesibilidad

El globo tiene semántica de tooltip. Tooltip solo aparece al pasar el cursor y no responde al foco del teclado; no coloque información esencial únicamente en un Tooltip.
