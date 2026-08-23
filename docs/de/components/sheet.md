---
title: Sheet
description: Ein Panel, das von einer beliebigen Bildschirmkante hereingleitet – ideal für sekundäre Inhalte wie Filter oder Details.
---

# Sheet

Sheet lässt ein Panel vom Rand des Containers hereingleiten und wird häufig für sekundäre Inhalte wie Filterbedingungen oder Detail-Seitenleisten verwendet, die den Hauptablauf nicht unterbrechen. Die folgende Vorschau wird von der pingo-Engine in Echtzeit gerendert und wechselt mit dem Theme der Website zwischen Hell und Dunkel.

:::preview sheet-basic
:::

## Verwendung

```tsx
import { createElement } from "@dopejs/pingo";
import { Sheet } from "@dopejs/pingo-ui";

root.render(
  createElement(Sheet, {
    open,
    onOpenChange: (next) => setOpen(next),
    side: "right",
    children: createElement("text", { value: "面板内容" }),
  }),
);
```

Der Overlay füllt seinen eigenen Eltern-Container; montieren Sie ihn daher nahe am Wurzelknoten. `open` ist eine kontrollierte Prop; ein Klick auf den Scrim oder das Drücken von `Escape` fordert das Schließen über `onOpenChange(false)` an. Die Titel-/Button-Bereiche innerhalb des Panels können `DialogHeader`, `DialogTitle`, `DialogDescription` und `DialogFooter` wiederverwenden.

## Beispiele

### Richtung

`side` unterstützt `"left"`, `"right"`, `"top"` und `"bottom"`, Standard ist `"right"`. Wenn nur die obere oder untere Kante benötigt wird, verwenden Sie bitte das semantisch eindeutigere [Drawer](/components/drawer).

## Props

Erbt von `DialogProps` (`open`, `onOpenChange`, `children`, `className`) und bietet zusätzlich:

| Prop | Typ | Standardwert | Beschreibung |
| --- | --- | --- | --- |
| `side` | `"left" \| "right" \| "top" \| "bottom"` | `"right"` | Kante, von der eingefahren wird |

## Barrierefreiheit

Das Panel besitzt complementary-Semantik; beim Öffnen wandert der Fokus in das Panel, und nach dem Schließen mit `Escape` kehrt der Fokus zum auslösenden Element zurück.
