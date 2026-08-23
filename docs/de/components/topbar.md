---
title: TopBar
description: Molekulare Komponente für die Anwendungs-Topbar, bestehend aus Titel sowie führendem und nachfolgendem Slot, gerendert auf dem Pingo-Canvas.
---

# TopBar

TopBar ist ein pingo-spezifisches Produktmolekül: Es kombiniert den Titel mit den beiden Slots `leading` (Logo, Zurück) und `actions` (Buttons, Avatar) zu einer einzeiligen Anwendungs-Topbar. Die Titelspalte nimmt stets den verbleibenden Platz ein (`flexGrow`) und schiebt die Aktionen ganz nach rechts – ganz ohne Messungen. Die folgende Vorschau wird von der Pingo-Engine in Echtzeit gerendert und folgt dem Hell-/Dunkel-Theme der Seite.

:::preview topbar-basic
:::

Kombinationsbeziehung zu den shadcn-Basiskomponenten: TopBar selbst stellt keine Buttons oder Avatare bereit, sondern definiert das **Layout-Grundgerüst**. Die Slots `leading` und `actions` akzeptieren beliebige `PingoNode`-Elemente und werden üblicherweise mit Basiskomponenten wie [Button](/components/button), IconButton, Avatar usw. kombiniert. Mehrere Aktionen werden in einen Container mit `flexDirection: "row"` verpackt und übergeben.

## Verwendung

```tsx
import { createElement } from "@dopejs/pingo";
import { Avatar, Button, TopBar } from "@dopejs/pingo-ui";

root.render(
  createElement(TopBar, {
    title: "Dashboard",
    leading: createElement(Avatar, { fallback: "P", size: 28 }),
    actions: createElement(Button, {
      children: "Neu",
      variant: "outline",
      onPress: () => create(),
    }),
  }),
);
```

## Beispiele

### Ohne Titel

Wird `title` weggelassen, wird die Titelspalte dennoch gerendert (eine leere Flex-Spalte), und die Aktionen werden weiterhin nach rechts geschoben; geeignet für Werkzeugleisten, die nur einen Aktionsbereich enthalten.

```tsx
createElement(TopBar, {
  actions: createElement(Button, { children: "Exportieren", onPress: () => {} }),
});
```

## Props

| Prop | Typ | Standardwert | Beschreibung |
| --- | --- | --- | --- |
| `title` | `string` | — | Titeltext; wird er weggelassen, wird eine leere Flex-Spalte gerendert |
| `leading` | `PingoNode` | — | Führender Slot für Logo oder Zurück-Button |
| `actions` | `PingoNode` | — | Nachfolgender Slot, der von der Titelspalte ganz nach rechts geschoben wird |
| `className` | `string` | — | Wird an den Komponenten-Klassennamen angehängt |

## Barrierefreiheit

TopBar hat die semantische Rolle `banner`; wird `title` bereitgestellt, erhält der Titeltext die Rolle `heading`. Die Barrierefreiheitsattribute der Komponenten innerhalb der Slots (z. B. `semanticLabel` bei IconButton) liegen in der Verantwortung der jeweiligen Komponente.
