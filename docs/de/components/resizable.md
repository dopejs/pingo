---
title: Resizable
description: Zwei-Spalten-Layout mit ziehbarem Griff zur Größenanpassung, gerendert auf der pingo canvas.
---

# Resizable

Resizable teilt einen Container in zwei Panels. Der Griff dazwischen lässt sich ziehen, um das Verhältnis anzupassen, und unterstützt auch Feineinstellungen per Tastatur. Die folgende Vorschau wird von der pingo-Engine in Echtzeit gerendert – ziehen Sie den Griff und probieren Sie es aus.

:::preview resizable-basic
:::

## Verwendung

```tsx
import { createElement } from "@dopejs/pingo";
import { Resizable } from "@dopejs/pingo-ui";

root.render(
  createElement(Resizable, {
    defaultSplit: 0.4,
    first: sidebar,
    second: content,
  }),
);
```

Die Komponente selbst nimmt 100 % der Breite und Höhe des übergeordneten Containers ein und benötigt einen übergeordneten Container mit definierter Größe. Sie unterstützt sowohl den unkontrollierten (`defaultSplit`) als auch den kontrollierten (`split` + `onSplitChange`) Modus.

## Beispiele

### Vertikale Ausrichtung

Mit `direction: "column"` wechseln Sie zu einer horizontalen Teilung; der Griff wird dann quer angezeigt.

:::preview resizable-vertical
:::

## Props

| Prop | Typ | Standard | Beschreibung |
| --- | --- | --- | --- |
| `first` | `PingoNode` | — | Inhalt des ersten Panels (erforderlich) |
| `second` | `PingoNode` | — | Inhalt des zweiten Panels (erforderlich) |
| `split` | `number` | — | Kontrolliert: Anteil des ersten Panels, `[0, 1]` |
| `defaultSplit` | `number` | `0.5` | Unkontrolliert: anfänglicher Anteil |
| `onSplitChange` | `(split: number) => void` | — | Callback bei Anteilsänderung |
| `direction` | `"row" \| "column"` | `"row"` | Teilungsrichtung |
| `minSplit` | `number` | `0.1` | Minimaler Anteil (untere Grenze) |
| `maxSplit` | `number` | `0.9` | Maximaler Anteil (obere Grenze) |
| `disabled` | `boolean` | `false` | Interaktion mit dem Griff deaktivieren |
| `className` | `string` | — | Wird nach dem Komponenten-Klassennamen angehängt |

## Barrierefreiheit

Der Griff besitzt Separator-Semantik und stellt assistiven Technologien den aktuellen Anteil (in Prozent) zur Verfügung. Nach dem Fokussieren des Griffs lässt sich der Anteil mit den Pfeiltasten in 2-%-Schritten feinjustieren: bei horizontalem Layout mit Links/Rechts, bei vertikalem Layout mit Oben/Unten.
