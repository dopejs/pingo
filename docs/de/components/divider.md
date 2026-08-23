---
title: Divider
description: Horizontale oder vertikale visuelle Trennlinie, die auf dem pingo-Canvas gerendert wird.
---

# Divider

Trennlinien sorgen für eine visuelle Gruppierung zwischen Inhalten. Die folgende Vorschau wird von der pingo-Engine in Echtzeit gerendert und wechselt mit dem Theme der Website zwischen Hell und Dunkel.

:::preview divider-horizontal
:::

## Verwendung

```tsx
import { createElement } from "@dopejs/pingo";
import { Divider } from "@dopejs/pingo-ui";

root.render(createElement(Divider, {}));
```

## Beispiele

### Vertikale Trennlinie

Übergebe `orientation: "vertical"`, um eine vertikale Trennlinie zu erhalten. Die Höhe einer vertikalen Trennlinie beträgt 100 % des übergeordneten Containers, daher muss der übergeordnete Container eine feste Höhe haben.

:::preview divider-vertical
:::

## Props

| Prop | Typ | Standardwert | Beschreibung |
| --- | --- | --- | --- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Ausrichtung der Trennlinie |
| `className` | `string` | — | Wird an den Klassennamen der Komponente angehängt |

Die Breite einer horizontalen Trennlinie beträgt 100 % des übergeordneten Containers und die Höhe 1px; die Höhe einer vertikalen Trennlinie beträgt 100 % des übergeordneten Containers und die Breite 1px.

## Barrierefreiheit

Divider ist ein rein visuelles Element ohne semantische Rolle und wird von assistiven Technologien ignoriert; Inhaltsgruppierungen sollten durch semantische Strukturen wie Überschriften ausgedrückt werden.
