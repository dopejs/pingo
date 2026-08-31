---
title: Hover Card
description: Rich-Content-Karte, die sich beim Hover öffnet, mit Verzögerung beim Öffnen und Schließen.
---

# Hover Card

Hover Card erweitert eine Rich-Content-Karte, wenn der Trigger gehovert (oder fokussiert) wird – sie trägt mehr Informationen als ein Tooltip, etwa eine Vorschau eines Benutzerprofils. Die folgende Vorschau wird von der pingo-Engine in Echtzeit gerendert (mit kontrolliertem `open` dauerhaft angezeigt) und folgt dem Hell-/Dunkel-Theme der Website.

:::preview hover-card-basic
:::

## Verwendung

```tsx
import { HoverCard } from "@dopejs/pingo-ui";

root.render(
  <HoverCard
    openDelayMs={300}
    closeDelayMs={200}
    content={<text value="Canvas 渲染引擎与 UI 组件库。" />}
  >
    <text value="@pingo" />
  </HoverCard>,
);
```

Nach dem Öffnen schließt sich die Karte auch dann nicht, wenn der Zeiger über der Karte selbst schwebt. Daher gibt `closeDelayMs` dem Zeiger Zeit, die Lücke zwischen Trigger und Karte zu überqueren. Durch Übergeben von `open` wechseln Sie in den kontrollierten Modus und verwalten den Zustand selbst über `onOpenChange`.

## Props

| Prop           | Typ                       | Standard | Beschreibung                                              |
| -------------- | ------------------------- | -------- | --------------------------------------------------------- |
| `children`     | `PingoNode`               | —        | Trigger-Element (erforderlich)                            |
| `content`      | `PingoNode`               | —        | Karteninhalt (erforderlich)                               |
| `open`         | `boolean`                 | —        | Kontrollierter Öffnungs-/Schließzustand                   |
| `onOpenChange` | `(open: boolean) => void` | —        | Callback bei Änderung des Öffnungszustands                |
| `openDelayMs`  | `number`                  | `300`    | Verzögerung beim Öffnen (Millisekunden)                   |
| `closeDelayMs` | `number`                  | `200`    | Verzögerung beim Schließen (Millisekunden)                |
| `className`    | `string`                  | —        | Wird nach dem Klassennamen des Anker-Containers angehängt |

## Barrierefreiheit

Der Trigger öffnet die Karte auch bei Fokus und schließt sie bei Fokusverlust, sodass Tastaturnutzer den Inhalt nicht verlieren.
