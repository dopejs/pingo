---
title: Aspect Ratio
description: "Container, der Inhalt auf ein festes Seitenverhältnis beschränkt, gerendert auf dem pingo-Canvas."
---

# Aspect Ratio

Aspect Ratio hält den Inhalt in einem festen Seitenverhältnis: Die Breite bestimmt das Layout, die
Höhe wird automatisch aus dem Verhältnis berechnet. Die Vorschau unten wird von der pingo-Engine in
Echtzeit gerendert.

:::preview aspect-ratio-basic
:::

## Verwendung

```tsx
import { AspectRatio } from "@dopejs/pingo-ui";

root.render(<AspectRatio ratio={16 / 9}>{coverImage}</AspectRatio>);
```

Die Komponente ist 100 % so breit wie ihr Elterncontainer; `ratio` ist Breite geteilt durch Höhe,
etwa `16 / 9` für Breitbild.

## Props

| Prop        | Typ         | Standardwert | Beschreibung                               |
| ----------- | ----------- | ------------ | ------------------------------------------ |
| `ratio`     | `number`    | `1`          | Seitenverhältnis (Breite ÷ Höhe)           |
| `children`  | `PingoNode` | —            | Der beschränkte Inhalt (Pflicht)           |
| `className` | `string`    | —            | Wird hinter die Komponentenklassen gehängt |

## Barrierefreiheit

Aspect Ratio ist ein reiner Layout-Container und führt keine zusätzliche Semantik ein. Da das
CSS-Subset keine `aspect-ratio`-Eigenschaft kennt, berechnet die Komponente die Höhe aus der
gemessenen Breite: Der erste Frame rendert mit Höhe null, sobald das Maß eintrifft, wird die Höhe
festgelegt.
