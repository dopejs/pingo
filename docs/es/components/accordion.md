---
title: Accordion
description: Acordeón vertical que expande un solo elemento a la vez, renderizado en el canvas de pingo.
---

# Accordion

El acordeón organiza contenido relacionado en grupos verticales expandibles y colapsables, con un
solo elemento expandido a la vez. La vista previa de abajo se renderiza en vivo con el motor
pingo: puedes hacer clic en los títulos para alternar, o mover el foco con las flechas y expandir
con Enter/Espacio.

:::preview accordion-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { Accordion, AccordionItem } from "@dopejs/pingo-ui";

root.render(
  createElement(Accordion, {
    defaultOpenValue: "intro",
    children: [
      createElement(AccordionItem, {
        value: "intro",
        title: "什么是 pingo-ui？",
        children: createElement("text", { value: "渲染在 pingo canvas 上的组件库。" }),
      }),
      createElement(AccordionItem, {
        value: "theme",
        title: "支持暗色主题吗？",
        children: createElement("text", { value: "支持，跟随主题自动切换。" }),
      }),
    ],
  }),
);
```

`Accordion` admite tanto el uso no controlado (`defaultOpenValue`) como el controlado
(`openValue` + `onValueChange`).

## Props

### Accordion

| Prop | Tipo | Valor predeterminado | Descripción |
| --- | --- | --- | --- |
| `openValue` | `string` | — | Controlado: `value` del elemento actualmente expandido |
| `defaultOpenValue` | `string` | — | No controlado: `value` del elemento expandido inicialmente |
| `onValueChange` | `(value: string \| undefined) => void` | — | Callback de cambio del elemento expandido; `undefined` cuando todo está colapsado |
| `children` | `PingoNode` | — | Lista de `AccordionItem` (obligatorio) |
| `className` | `string` | — | Se añade tras las clases del propio componente |

### AccordionItem

| Prop | Tipo | Valor predeterminado | Descripción |
| --- | --- | --- | --- |
| `value` | `string` | — | Identificador único del elemento (obligatorio) |
| `title` | `string` | — | Título del disparador (obligatorio) |
| `children` | `PingoNode` | — | Contenido mostrado al expandir (obligatorio) |
| `className` | `string` | — | Se añade tras las clases del propio componente |

## Accesibilidad

Las flechas (arriba/abajo) mueven el foco entre los títulos sin cambiar el estado expandido, y
Home/End salta al primero/último; Enter o Espacio alterna la expansión, cumpliendo el requisito de
WAI-ARIA de separar foco y selección. Al colapsarse, la zona de contenido se oculta con
`display: none` en lugar de desmontarse, de modo que el estado de expansión se conserva.
