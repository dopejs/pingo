---
title: Popover
description: Ein schwebendes Panel, das am Trigger verankert ist und ergänzende Informationen sowie leichte Aktionen bereitstellt.
---

# Popover

Popover öffnet ein schwebendes Panel neben dem Trigger, das beim Scrollen der Seite verankert bleibt. Die folgende Vorschau wird von der pingo-Engine in Echtzeit gerendert – klicken Sie auf den Trigger, um das Panel zu öffnen oder zu schließen, und folgen Sie dem Hell-/Dunkel-Thema der Website.

:::preview popover-basic
:::

## Verwendung

```tsx
import { createElement } from "@dopejs/pingo";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@dopejs/pingo-ui";

root.render(
  createElement(Popover, {
    defaultOpen: false,
    onOpenChange: (open) => {},
    children: [
      createElement(PopoverTrigger, {
        children: createElement(Button, { children: "打开浮层", onPress: () => {} }),
      }),
      createElement(PopoverContent, {
        children: createElement("text", { value: "任意内容" }),
      }),
    ],
  }),
);
```

`PopoverTrigger` und `PopoverContent` lesen den Zustand der Wurzelkomponente über den Kontext und müssen als Kinder desselben `Popover` verwendet werden. Standardmäßig ist die Komponente unkontrolliert (`defaultOpen`); durch Übergabe von `open` wechselt sie in den kontrollierten Modus. Das Panel ist standardmäßig unterhalb des Triggers verankert; wenn das Layout-Rücklesen aktiviert ist, wird es bei Platzmangel automatisch auf die andere Seite geklappt.

## Beispiele

### Beliebiger Inhalt

Die `children` von `PopoverContent` akzeptieren beliebige `PingoNode`-Elemente, etwa Formulare, Listen oder typografische Inhalte.

:::preview popover-rich
:::

## Props

### Popover

| Prop | Typ | Standardwert | Beschreibung |
| --- | --- | --- | --- |
| `open` | `boolean` | — | Kontrollierter Öffnungs-/Schließzustand |
| `defaultOpen` | `boolean` | `false` | Unkontrollierter Anfangszustand |
| `onOpenChange` | `(open: boolean) => void` | — | Callback bei Änderung des Öffnungszustands |
| `children` | `PingoNode` | — | Trigger und Content (erforderlich) |
| `className` | `string` | — | Wird an den Klassennamen des Anker-Containers angehängt |

### PopoverTrigger

| Prop | Typ | Standardwert | Beschreibung |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | Trigger-Element (erforderlich) |
| `className` | `string` | — | Zusätzlicher Klassenname |

### PopoverContent

| Prop | Typ | Standardwert | Beschreibung |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | Panel-Inhalt (erforderlich) |
| `className` | `string` | — | Zusätzlicher Klassenname |

## Barrierefreiheit

Der Trigger besitzt Button-Semantik und stellt den expanded/collapsed-Zustand bereit; `Escape` schließt das Panel und gibt den Fokus an den Trigger zurück.
