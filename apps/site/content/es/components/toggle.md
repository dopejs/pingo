---
title: Toggle
description: Botón de conmutación de dos estados para interruptores instantáneos como negrita o cursiva, renderizado en el pingo canvas.
---

# Toggle

Botón de conmutación de dos estados: se pulsa una vez para activarlo y se vuelve a pulsar para desactivarlo. La siguiente vista previa se renderiza en tiempo real mediante el motor pingo: puedes pulsar para cambiar de estado y alternar entre tema claro y oscuro según el tema del sitio.

:::preview toggle-basic
:::

## Uso

```tsx
import { Toggle } from "@dopejs/pingo-ui";

root.render(
  <Toggle defaultPressed onPressedChange={(pressed) => console.log(pressed)}>
    加粗
  </Toggle>,
);
```

`Toggle` mantiene internamente su estado mediante hooks y debe montarse como componente con JSX. Al pasar `pressed` se entra en modo controlado; en caso contrario, usa `defaultPressed` para que el componente gestione su propio estado.

## Ejemplos

### Deshabilitado

Al pasar `disabled`, el botón deja de responder al puntero y al teclado, y tampoco se activa con Enter o espacio.

## Props

| Prop              | 类型                         | 默认值  | 说明               |
| ----------------- | ---------------------------- | ------- | ------------------ |
| `children`        | `string`                     | —       | 按钮文本（必填）   |
| `pressed`         | `boolean`                    | —       | 受控按下状态       |
| `defaultPressed`  | `boolean`                    | `false` | 非受控初始按下状态 |
| `onPressedChange` | `(pressed: boolean) => void` | —       | 状态切换回调       |
| `disabled`        | `boolean`                    | `false` | 禁用态             |
| `className`       | `string`                     | —       | 追加在组件类名之后 |

## Accesibilidad

El componente incorpora semántica de botón y el valor semántico alterna entre `on` y `off` según el estado. Al pulsar con el puntero recibe el foco automáticamente, y tanto `Enter` como `空格` pueden activarlo.
