---
title: Label
description: Formular-Beschriftungstext, der zusammen mit Eingabeelementen verwendet und auf dem pingo canvas gerendert wird.
---

# Label

Beschriftungen geben Formularelementen einen sichtbaren Namen. Die folgende Vorschau wird von der pingo-Engine in Echtzeit gerendert und folgt dem Hell-/Dunkel-Theme der Website.

:::preview label-basic
:::

## Verwendung

```tsx
import { Input, Label } from "@dopejs/pingo-ui";

root.render(
  <container style={{ flexDirection: "column" }}>
    <Label>邮箱</Label>
    <container height={8} />
    <Input semanticLabel="邮箱" width={320} />
  </container>,
);
```

pingo besitzt keine `gap`-Eigenschaft; der Abstand zwischen Beschriftung und Element wird über einen Container mit fester Größe umgesetzt.

## Beispiele

### Semantischer Name

Eine Verknüpfung von Elementen existiert in pingo noch nicht, daher beruht die Zuordnung von Beschriftung und Element auf einer Konvention: Übergib dem Element ein `semanticLabel`, das mit der Beschriftung übereinstimmt, damit Screenreader denselben Namen vorlesen.

## Props

| Prop            | Typ      | Standardwert | Beschreibung                                                                                |
| --------------- | -------- | ------------ | ------------------------------------------------------------------------------------------- |
| `children`      | `string` | —            | Beschriftungstext (erforderlich)                                                            |
| `className`     | `string` | —            | Wird an den Komponenten-Klassennamen angehängt                                              |
| `semanticLabel` | `string` | —            | Überschreibt den Barrierefreiheitsnamen; standardmäßig wird der Beschriftungstext verwendet |

## Barrierefreiheit

pingo besitzt noch keinen Mechanismus zur Verknüpfung von Beschriftung und Element; Label ist lediglich gestalteter Text. Setze immer `semanticLabel` am zugehörigen Element, damit der Barrierefreiheitsname nicht von der visuellen Nähe abhängt.
