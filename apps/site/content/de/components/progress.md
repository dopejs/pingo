---
title: Progress
description: Zeigt eine Fortschrittsleiste für den Abschlussgrad von Aufgaben an, gerendert auf der Pingo-Leinwand.
---

# Progress

Progress stellt deterministischen Fortschritt – etwa bei Downloads, Uploads oder mehrstufigen Aufgaben – über eine gefüllte Spur dar. Die folgende Vorschau wird von der Pingo-Engine in Echtzeit gerendert und wechselt mit dem Theme der Website zwischen Hell und Dunkel.

:::preview progress-basic
:::

## Verwendung

```tsx
import { Progress } from "@dopejs/pingo-ui";

root.render(<Progress value={60} />);
```

Die Spurbreite wird vom übergeordneten Container übernommen. Platziere Progress in einem Container mit fester Breite, um die Länge der Leiste zu steuern:

```tsx
<container width={320}>
  <Progress value={60} />
</container>
```

## Beispiele

### Benutzerdefinierter Maximalwert

`max` ist standardmäßig 100. Wenn ein Wert übergeben wird, wird der Füllprozentsatz als `value / max` berechnet und stets auf den Bereich 0–100 begrenzt:

```tsx
<Progress value={3} max={10} /> // 30%
```

## Props

| Prop        | Typ      | Standard | Beschreibung                                                                       |
| ----------- | -------- | -------- | ---------------------------------------------------------------------------------- |
| `value`     | `number` | —        | Aktueller Fortschritt (erforderlich); Werte außerhalb des Bereichs werden begrenzt |
| `max`       | `number` | `100`    | Maximalwert, mindestens als 1 behandelt                                            |
| `className` | `string` | —        | Wird nach den Komponenten-Klassennamen angehängt                                   |

## Barrierefreiheit

Progress ist ein rein visuelles Element ohne zugewiesene semantische Rolle. Wenn der Fortschritt für den Aufgabenabschluss entscheidend ist, ergänze daneben einen Text mit dem aktuellen Prozentsatz oder der Bezeichnung der Phase.
