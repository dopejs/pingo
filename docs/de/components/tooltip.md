---
title: Tooltip
description: Kurzer Hinweistext, der beim Überfahren angezeigt wird und über dem Zielelement verankert ist.
---

# Tooltip

Tooltip zeigt beim Überfahren mit dem Zeiger einen kurzen Hinweistext an, der standardmäßig über dem Ziel verankert ist. Die folgende Vorschau wird live von der pingo-Engine gerendert – fahren Sie mit dem Zeiger über die Schaltfläche, um den Bubble zu sehen, der dem Hell-/Dunkelmodus der Website folgt.

:::preview tooltip-basic
:::

## Verwendung

```tsx
import { createElement } from "@dopejs/pingo";
import { Button, Tooltip } from "@dopejs/pingo-ui";

root.render(
  createElement(Tooltip, {
    content: "In der Cloud speichern",
    children: createElement(Button, { children: "Speichern", onPress: () => save() }),
  }),
);
```

Tooltip wird durch das Betreten und Verlassen mit dem Zeiger gesteuert (`pointerenter` / `pointerleave`) und hat keine kontrollierten Props; beim statischen Rendering wird nur das auslösende Element angezeigt, der Bubble erscheint beim Überfahren.

## Props

| Prop        | Typ         | Standardwert | Beschreibung                                              |
| ----------- | ----------- | ------------ | --------------------------------------------------------- |
| `content`   | `string`    | —            | Text im Bubble (erforderlich)                             |
| `children`  | `PingoNode` | —            | Auslösendes Element (erforderlich)                        |
| `className` | `string`    | —            | Wird nach dem Klassennamen des Anker-Containers angehängt |

## Barrierefreiheit

Der Bubble besitzt Tooltip-Semantik. Tooltip erscheint nur beim Überfahren und reagiert nicht auf Tastaturfokus; wichtige Informationen sollten nicht ausschließlich im Tooltip platziert werden.
