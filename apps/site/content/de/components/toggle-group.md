---
title: Toggle Group
description: Eine Gruppe von Umschaltflächen mit zwei Zuständen, Einfach- oder Mehrfachauswahl, unterstützt Navigation mit Pfeiltasten und wird auf der pingo-Leinwand gerendert.
---

# Toggle Group

Eine Umschaltgruppe fasst mehrere [Toggle](/components/toggle) zu einer Einfach- oder Mehrfachauswahl zusammen. Die folgende Vorschau wird live von der pingo-Engine gerendert – Sie können per Klick umschalten, sich mit den Pfeiltasten zwischen den Elementen bewegen und das Farbschema folgt dem Hell-/Dunkelmodus der Website.

:::preview toggle-group-basic
:::

## Verwendung

```tsx
import { ToggleGroup, ToggleGroupItem } from "@dopejs/pingo-ui";

root.render(
  <ToggleGroup
    type="single"
    defaultValue={["center"]}
    onValueChange={(value) => console.log(value)}
  >
    <ToggleGroupItem value="left">左对齐</ToggleGroupItem>
    <ToggleGroupItem value="center">居中</ToggleGroupItem>
    <ToggleGroupItem value="right">右对齐</ToggleGroupItem>
  </ToggleGroup>,
);
```

`ToggleGroup` veröffentlicht die Auswahlmenge über einen Kontext an `ToggleGroupItem`; beide müssen mit JSX als Komponenten eingebunden werden. Bei `type: "single"` ersetzt eine neue Auswahl die vorherige; bei `"multiple"` werden die Elemente einzeln hinzugefügt.

## Beispiele

### Mehrfachauswahl

`type="multiple"` erlaubt das gleichzeitige Auswählen mehrerer Elemente, etwa in einer Symbolleiste für Textformatierung.

:::preview toggle-group-multiple
:::

## Props

### ToggleGroup

| Prop            | Typ                                  | Standard   | Beschreibung                                                                               |
| --------------- | ------------------------------------ | ---------- | ------------------------------------------------------------------------------------------ |
| `type`          | `"single" \| "multiple"`             | `"single"` | Einfachauswahl entfernt die vorherige Auswahl; Mehrfachauswahl fügt Elemente einzeln hinzu |
| `value`         | `readonly string[]`                  | —          | Kontrollierte Menge ausgewählter Werte                                                     |
| `defaultValue`  | `readonly string[]`                  | `[]`       | Unkontrollierte anfängliche Auswahlmenge                                                   |
| `onValueChange` | `(value: readonly string[]) => void` | —          | Callback bei Änderung der Auswahlmenge                                                     |
| `children`      | `PingoNode`                          | —          | Liste von `ToggleGroupItem` (erforderlich)                                                 |
| `className`     | `string`                             | —          | Wird an den Klassennamen der Komponente angehängt                                          |

### ToggleGroupItem

| Prop        | Typ       | Standard | Beschreibung                                      |
| ----------- | --------- | -------- | ------------------------------------------------- |
| `value`     | `string`  | —        | Wert des Elements (erforderlich)                  |
| `children`  | `string`  | —        | Text des Elements (erforderlich)                  |
| `disabled`  | `boolean` | `false`  | Deaktiviert das einzelne Element                  |
| `className` | `string`  | —        | Wird an den Klassennamen der Komponente angehängt |

## Barrierefreiheit

Der Gruppencontainer besitzt `group`-Semantik, die einzelnen Elemente erben die Button-Semantik und die `on`-/`off`-Semantikwerte von Toggle. Die Tastaturverarbeitung erfolgt zentral auf der Gruppe: `←`/`→` bewegt den Fokus zum benachbarten Element, `Enter`/`Leertaste` schaltet das aktuelle Element um – das Hinzufügen oder Entfernen von Elementen beeinträchtigt diese Navigation nicht.
