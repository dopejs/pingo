---
title: Slider
description: Numerischer Schieberegler mit Drag-Unterstützung und Feinanpassung per Tastatur, gerendert auf dem pingo Canvas.
---

# Slider

Der Schieberegler dient zur Auswahl eines Werts innerhalb eines Intervalls. Die folgende Vorschau wird von der pingo-Engine in Echtzeit gerendert – Sie können den Regler ziehen oder mit den Pfeiltasten feinjustieren; das Erscheinungsbild folgt dem Hell-/Dunkelmodus der Website.

:::preview slider-basic
:::

## Verwendung

```tsx
import { Slider } from "@dopejs/pingo-ui";

root.render(
  <Slider
    defaultValue={40}
    min={0}
    max={100}
    step={1}
    semanticLabel="Lautstärke"
    onValueChange={(value) => console.log(value)}
  />,
);
```

`Slider` hält den Drag-Zustand intern über Hooks und muss mit JSX als Komponente gemountet werden. Wird `value` übergeben, befindet sich die Komponente im kontrollierten Modus; andernfalls verwaltet sie ihren Zustand über `defaultValue` selbst.

## Beispiele

### Intervall und Schrittweite

`min` / `max` begrenzen das Werteintervall (Standard 0–100), `step` bestimmt die Granularität der Tastaturanpassung (Standard 1).

### Deaktiviert

Mit `disabled` reagiert der Regler nicht mehr auf Ziehen oder Tastatureingaben.

## Props

| Prop            | Typ                       | Standardwert | Beschreibung                                     |
| --------------- | ------------------------- | ------------ | ------------------------------------------------ |
| `value`         | `number`                  | —            | Kontrollierter aktueller Wert                    |
| `defaultValue`  | `number`                  | `min`        | Unkontrollierter Anfangswert                     |
| `onValueChange` | `(value: number) => void` | —            | Callback bei Wertänderung                        |
| `min`           | `number`                  | `0`          | Minimalwert                                      |
| `max`           | `number`                  | `100`        | Maximalwert                                      |
| `step`          | `number`                  | `1`          | Schrittweite für Tastatur                        |
| `disabled`      | `boolean`                 | `false`      | Deaktivierter Zustand                            |
| `semanticLabel` | `string`                  | —            | Barrierefreie Bezeichnung                        |
| `className`     | `string`                  | —            | Wird nach dem Komponenten-Klassennamen angehängt |

## Barrierefreiheit

Die Komponente trägt die semantische Rolle `slider`; der semantische Wert ist die Zeichenfolge des aktuellen Werts. `←`/`↓` verringern um einen `step`, `→`/`↑` erhöhen um einen `step`, `Home`/`End` springen an die Enden des Intervalls. Der Wert wird stets auf `[min, max]` begrenzt.
