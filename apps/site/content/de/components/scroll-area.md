---
title: Scroll Area
description: Ein Scrollcontainer mit gezeichnetem Scrollbalken, der auf dem pingo Canvas gerendert wird.
---

# Scroll Area

Scroll Area scrollt überlange Inhalte innerhalb eines Viewports mit fester Größe und zeichnet einen zum Theme passenden Scrollbalken. Die folgende Vorschau wird live von der pingo-Engine gerendert – scrollen Sie in der Liste, um es auszuprobieren.

:::preview scroll-area-basic
:::

## Verwendung

```tsx
import { createElement } from "@dopejs/pingo";
import { ScrollArea } from "@dopejs/pingo-ui";

root.render(
  createElement(ScrollArea, {
    children: items.map((item) => createElement("text", { value: item })),
  }),
);
```

Die Komponente selbst hat eine Breite und Höhe von 100 % des Elterncontainers und benötigt einen Elterncontainer mit definierter Größe. Der Scrollbalken erscheint nur, wenn der Inhalt den Viewport überschreitet.

## Props

| Prop            | Typ         | Standardwert | Beschreibung                                                                  |
| --------------- | ----------- | ------------ | ----------------------------------------------------------------------------- |
| `children`      | `PingoNode` | —            | Scrollinhalt (erforderlich)                                                   |
| `hideScrollbar` | `boolean`   | `false`      | Blendet den gezeichneten Scrollbalken aus (Scrollfunktion bleibt unverändert) |
| `className`     | `string`    | —            | Wird nach dem Klassennamen der Komponente angehängt                           |

## Barrierefreiheit

Das Scrollverhalten wird von der Engine Core bereitgestellt; der Viewport bleibt fokussierbar und per Tastatur scrollbar. Der Scrollbalken wird aus der gemessenen Geometrie von Viewport und Inhalt abgeleitet; bei schnellem Ziehen kann der Scrollbalken-Griff einen Frame nachhinken.

Informationen zum scrollbezogenen Verhalten der Engine finden Sie im [Scroll-Leitfaden](/guide/scrolling).
