---
title: Dropdown-Menü
description: Ein Aktionsmenü, das per Klick auf einen Trigger aufgeklappt wird und Tastaturnavigation unterstützt.
---

# Dropdown-Menü

Das Dropdown-Menü klappt unterhalb des Triggers eine Reihe von Aktionspunkten auf. Die folgende Vorschau wird live von der pingo-Engine gerendert – klicken Sie auf den Trigger, um es zu öffnen und zu schließen, es folgt außerdem dem Hell-/Dunkel-Theme der Website.

:::preview dropdown-menu-basic
:::

## Verwendung

```tsx
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@dopejs/pingo-ui";

root.render(
  <DropdownMenu onValueChange={(value) => run(value)}>
    <DropdownMenuTrigger>
      <Button onPress={() => {}}>Menü öffnen</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem value="profile">Profil</DropdownMenuItem>
      <DropdownMenuItem value="settings">Einstellungen</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>,
);
```

Trigger und Content lesen den Zustand der Wurzelkomponente über den Kontext und müssen als Kindknoten desselben `DropdownMenu` verwendet werden. Nach Auswahl eines Eintrags wird `onValueChange` ausgelöst und das Menü automatisch geschlossen. Das Öffnen und Schließen ist standardmäßig unkontrolliert (`defaultOpen`); die Komponente bietet keine kontrollierte `open`-Prop – für eine vollständig kontrollierte Listenauswahl verwenden Sie Select (beide teilen sich dieselbe Implementierung).

## Props

### DropdownMenu

| Prop            | Typ                       | Standard | Beschreibung                                                       |
| --------------- | ------------------------- | -------- | ------------------------------------------------------------------ |
| `value`         | `string`                  | —        | Aktuell ausgewählter Wert (hebt den entsprechenden Eintrag hervor) |
| `defaultOpen`   | `boolean`                 | `false`  | Anfänglicher Öffnungszustand                                       |
| `onValueChange` | `(value: string) => void` | —        | Callback bei Auswahl eines Menüeintrags                            |
| `onOpenChange`  | `(open: boolean) => void` | —        | Callback bei Änderung des Öffnungszustands                         |
| `children`      | `PingoNode`               | —        | Trigger und Content (erforderlich)                                 |
| `className`     | `string`                  | —        | Wird nach dem Klassennamen des Anker-Containers angehängt          |

### DropdownMenuTrigger

| Prop          | Typ         | Standard | Beschreibung                                                                             |
| ------------- | ----------- | -------- | ---------------------------------------------------------------------------------------- |
| `children`    | `PingoNode` | —        | Trigger-Element; falls nicht angegeben, wird der aktuelle Wert/Platzhaltertext gerendert |
| `placeholder` | `string`    | —        | Platzhaltertext, wenn kein Wert ausgewählt ist                                           |
| `className`   | `string`    | —        | Zusätzliche Klasse                                                                       |

### DropdownMenuContent

| Prop        | Typ         | Standard | Beschreibung                |
| ----------- | ----------- | -------- | --------------------------- |
| `children`  | `PingoNode` | —        | Menüeinträge (erforderlich) |
| `className` | `string`    | —        | Zusätzliche Klasse          |

### DropdownMenuItem

| Prop        | Typ      | Standard | Beschreibung                         |
| ----------- | -------- | -------- | ------------------------------------ |
| `value`     | `string` | —        | Wert des Menüeintrags (erforderlich) |
| `children`  | `string` | —        | Anzeigetext (erforderlich)           |
| `className` | `string` | —        | Zusätzliche Klasse                   |

## Barrierefreiheit

Das Menü besitzt menü-Semantik, die Menüeinträge menuitem-Semantik; nach dem Öffnen bewegen die Pfeiltasten auf und ab, `Enter`/`Leertaste` wählen aus, `Escape` schließt das Menü und gibt den Fokus an den Trigger zurück.
