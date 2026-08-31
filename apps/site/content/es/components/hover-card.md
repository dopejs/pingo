---
title: Hover Card
description: Tarjeta de contenido enriquecido que se expande al pasar el cursor, con retrasos de apertura y cierre.
---

# Hover Card

Hover Card expande una tarjeta de contenido enriquecido al pasar el cursor (o enfocar) el disparador: admite más información que un Tooltip, como una vista previa de perfil de usuario. La siguiente vista previa se renderiza en tiempo real mediante el motor pingo (mostrada con `open` controlado para mantenerla abierta) y alterna entre claro y oscuro según el tema del sitio.

:::preview hover-card-basic
:::

## Uso

```tsx
import { HoverCard } from "@dopejs/pingo-ui";

root.render(
  <HoverCard
    openDelayMs={300}
    closeDelayMs={200}
    content={<text value="Canvas 渲染引擎与 UI 组件库。" />}
  >
    <text value="@pingo" />
  </HoverCard>,
);
```

Una vez abierta, la tarjeta no se cierra al pasar el cursor sobre ella misma, por lo que `closeDelayMs` da tiempo al puntero para cruzar el espacio entre el disparador y la tarjeta. Pasa `open` para cambiar al modo controlado y gestiona el estado con `onOpenChange`.

## Props

| Prop           | 类型                      | 默认值 | 说明                                                          |
| -------------- | ------------------------- | ------ | ------------------------------------------------------------- |
| `children`     | `PingoNode`               | —      | Elemento disparador (obligatorio)                             |
| `content`      | `PingoNode`               | —      | Contenido de la tarjeta (obligatorio)                         |
| `open`         | `boolean`                 | —      | Estado controlado de apertura y cierre                        |
| `onOpenChange` | `(open: boolean) => void` | —      | Callback ante cambios de apertura y cierre                    |
| `openDelayMs`  | `number`                  | `300`  | Retraso de apertura (milisegundos)                            |
| `closeDelayMs` | `number`                  | `200`  | Retraso de cierre (milisegundos)                              |
| `className`    | `string`                  | —      | Se añade después del nombre de clase del contenedor del ancla |

## Accesibilidad

El disparador también abre la tarjeta al recibir el foco y la cierra al perderlo, de modo que los usuarios de teclado no pierden el contenido.
