---
title: Drawer
description: Von der oberen oder unteren Kante hereingleitendes Drawer-Panel, ideal für mobile Bottom-Sheets.
---

# Drawer

Ein Drawer ist ein Panel, das von einer horizontalen Kante hereingleitet – äquivalent zu einem [Sheet](/components/sheet), dessen `side` nur `"top" | "bottom"` annimmt. Die folgende Vorschau wird live von der pingo-Engine gerendert und folgt dem Hell-/Dunkel-Theme der Website.

:::preview drawer-basic
:::

## Verwendung

```tsx
import { createElement } from "@dopejs/pingo";
import { Drawer } from "@dopejs/pingo-ui";

root.render(
  createElement(Drawer, {
    open,
    onOpenChange: (next) => setOpen(next),
    side: "bottom",
    children: createElement("text", { value: "抽屉内容" }),
  }),
);
```

Die Overlay-Schicht füllt ihren eigenen Elterncontainer aus; mounte sie daher nahe am Wurzelelement. `open` ist eine kontrollierte Prop; ein Klick auf die Maske oder das Drücken von `Escape` fordert das Schließen über `onOpenChange(false)` an. Die Titel-/Button-Bereiche innerhalb des Panels können `DialogHeader`, `DialogTitle`, `DialogDescription` und `DialogFooter` wiederverwenden.

## Beispiele

### Richtung

`side` unterstützt `"top"` und `"bottom"`, Standard ist `"bottom"`.

## Props

Erbt `DialogProps` (`open`, `onOpenChange`, `children`, `className`), zusätzlich:

| Prop   | Typ                 | Standard   | Beschreibung                           |
| ------ | ------------------- | ---------- | -------------------------------------- |
| `side` | `"top" \| "bottom"` | `"bottom"` | Kante, von der das Panel hereingleitet |

## Barrierefreiheit

Das Panel besitzt complementary-Semantik; beim Öffnen wandert der Fokus in das Panel, nach dem Schließen mit `Escape` kehrt der Fokus zum auslösenden Element zurück.
