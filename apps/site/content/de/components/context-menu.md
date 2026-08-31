---
title: Kontextmenü
description: Ein per Rechtsklick ausgelöstes Kontextmenü, das an der Position des Zeigerdrucks erscheint.
---

# Kontextmenü

Das Kontextmenü öffnet sich an der Zeigerposition, wenn auf dem Zielbereich ein Rechtsklick (das `contextmenu`-Ereignis) ausgeführt wird. Die folgende Vorschau wird live von der pingo-Engine gerendert – ein Rechtsklick auf den Textbereich öffnet das Menü, das dem Hell-/Dunkelmodus der Website folgt.

:::preview context-menu-basic
:::

## Verwendung

```tsx
import { ContextMenu } from "@dopejs/pingo-ui";

root.render(
  <ContextMenu
    items={[
      { value: "copy", label: "Kopieren" },
      { value: "paste", label: "Einfügen", disabled: true },
      { value: "delete", label: "Löschen" },
    ]}
    onSelect={(value) => run(value)}
  >
    <text value="Hier rechtsklicken" />
  </ContextMenu>,
);
```

Das Menü wird an der Position des Zeigerdrucks positioniert und nicht an der Ecke des Auslösers; es schließt sich bei `Escape` oder nach Auswahl eines Eintrags. Deaktivierte Einträge nehmen nicht an der Tastaturnavigation teil und reagieren nicht auf Klicks. Beim statischen Rendering wird nur der Auslösebereich angezeigt; das Menü erscheint bei einem Rechtsklick.

## Props

| Prop           | Typ                           | Standardwert | Beschreibung                               |
| -------------- | ----------------------------- | ------------ | ------------------------------------------ |
| `children`     | `PingoNode`                   | —            | Inhalt des Auslösebereichs (erforderlich)  |
| `items`        | `readonly ContextMenuEntry[]` | —            | Menüeinträge (erforderlich)                |
| `onSelect`     | `(value: string) => void`     | —            | Callback bei Auswahl eines Menüeintrags    |
| `onOpenChange` | `(open: boolean) => void`     | —            | Callback bei Änderung des Öffnungszustands |
| `className`    | `string`                      | —            | Zusätzliche Klassen                        |

### ContextMenuEntry

| Feld       | Typ       | Standardwert | Beschreibung                         |
| ---------- | --------- | ------------ | ------------------------------------ |
| `value`    | `string`  | —            | Wert des Menüeintrags (erforderlich) |
| `label`    | `string`  | —            | Anzeigetext (erforderlich)           |
| `disabled` | `boolean` | `false`      | Deaktivierter Zustand                |

## Barrierefreiheit

Das Menü verfügt über eine menu-Semantik, die Menüeinträge über eine menuitem-Semantik; nach dem Öffnen bewegen die Pfeiltasten nach oben und unten, `Escape` schließt das Menü.
