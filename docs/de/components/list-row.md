---
title: ListRow
description: Listenzeilen-Molekülkomponente, die Basiselemente wie Avatar und Badge mit Auswahl-/Deaktivierungsstatus kombiniert und auf dem Pingo-Canvas gerendert wird.
---

# ListRow

ListRow ist das pingo-spezifische Produktmolekül: eine Listenzeile, bei der Titel und Beschreibung die mittlere flexible Spalte einnehmen und die Slots `leading` (Avatar, Symbol) und `trailing` (Badge, Schalter, Pfeil) an den beiden Enden sitzen. Die folgende Vorschau wird von der Pingo-Engine in Echtzeit gerendert – anklickbare Zeilen verfügen über vollständiges Zeigerfeedback und wechseln entsprechend dem Website-Theme zwischen hell und dunkel.

:::preview list-row-basic
:::

Kompositionsverhältnis zu den shadcn-Basiselementen: ListRow definiert das Zeilenlayout und die Interaktionszustände, bindet aber keine Inhaltskomponenten ein; die Slots `leading`/`trailing` akzeptieren beliebige `PingoNode`-Objekte, typische Kombinationen sind Avatar, Badge oder Switch. Wenn zwischen benachbarten Zeilen Abstand benötigt wird, verwenden Sie einen Container mit fester Höhe als Abstandshalter (pingo besitzt keine gap-Eigenschaft).

## Verwendung

```tsx
import { createElement } from "@dopejs/pingo";
import { Avatar, Badge, ListRow } from "@dopejs/pingo-ui";

root.render(
  createElement(ListRow, {
    title: "张三",
    description: "zhangsan@example.com",
    leading: createElement(Avatar, { fallback: "张", size: 32 }),
    trailing: createElement(Badge, { children: "管理员" }),
    onPress: () => openMember("zhangsan"),
  }),
);
```

## Beispiele

### Ausgewählt und deaktiviert

`selected` wendet den Auswahlstil an und legt den Auswahlstatus nach außen offen; Zeilen mit `disabled` tragen keinerlei Ereignishandler – stärker als „im Handler erneut prüfen“.

:::preview list-row-states
:::

### Reine Anzeigezeile

Ohne `onPress` verhält sich die Zeile als reines Anzeigeelement: Die semantische Rolle ist `listitem`, es gibt keine Interaktionsstile und keine Ereignisse.

## Props

| Prop | Typ | Standardwert | Beschreibung |
| --- | --- | --- | --- |
| `title` | `string` | — | Titeltext (erforderlich) |
| `description` | `string` | — | Sekundärer Beschreibungstext |
| `leading` | `PingoNode` | — | Vorderer Slot für Avatar oder Symbol |
| `trailing` | `PingoNode` | — | Hinterer Slot für Badge, Schalter oder Pfeil |
| `selected` | `boolean` | — | Auswahlstatus; bei Angabe werden die semantischen Werte `selected`/`unselected` offengelegt |
| `disabled` | `boolean` | `false` | Deaktivierter Zustand, es werden keine Ereignishandler registriert |
| `onPress` | `() => void` | — | Klick-Callback; bei Angabe wird die Zeile interaktiv |
| `className` | `string` | — | Wird nach dem Komponentenklassennamen angehängt |

## Barrierefreiheit

Interaktive Zeilen besitzen die semantische Rolle `button`, reine Anzeigezeilen `listitem`; der barrierefreie Name stammt aus `title`. Bei Angabe von `selected` werden die semantischen Werte `selected`/`unselected` offengelegt. Deaktivierte Zeilen tragen keinerlei Zeiger-/Tastaturhandler und erscheinen für assistive Technologien als rein statische Elemente.
