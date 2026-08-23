---
title: Switch
description: Kontrolliertes Schalter-Steuerelement für sofort wirksame boolesche Einstellungen, gerendert auf der pingo-Canvas.
---

# Switch

Schalter werden für sofort wirksame boolesche Einstellungen verwendet. Die folgende Vorschau wird von der pingo-Engine in Echtzeit gerendert und folgt dem Hell-/Dunkel-Theme der Website. Switch ist eine kontrollierte Komponente: Die Vorschau zeigt statische Ein/Aus/Deaktiviert-Kombinationen; die Interaktion wird durch den vom Aufrufer gehaltenen Zustand gesteuert.

:::preview switch-basic
:::

## Verwendung

```tsx
import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
import { Switch } from "@dopejs/pingo-ui";

// useSignal ist ein Hook und muss innerhalb des Komponenten-Scopes ausgeführt werden.
function AirplaneMode(): PingoNode {
  const on = useSignal(false);
  return createElement(Switch, {
    checked: on.get(),
    semanticLabel: "Flugmodus",
    onCheckedChange: (next) => on.set(next),
  });
}

root.render(createElement(AirplaneMode));
```

`checked` wird von der übergeordneten Komponente gehalten, und `onCheckedChange` ist dafür verantwortlich, sie zu aktualisieren – die Komponente selbst speichert keinen Zustand.

## Beispiele

### Deaktiviert

Wenn `disabled` übergeben wird, reagiert der Schalter nicht mehr auf Zeiger und Tastatur; der semantische Wert wird zu `disabled`.

## Props

| Prop              | Typ                          | Standardwert | Beschreibung                                     |
| ----------------- | ---------------------------- | ------------ | ------------------------------------------------ |
| `checked`         | `boolean`                    | —            | Schalterzustand (erforderlich, kontrolliert)     |
| `onCheckedChange` | `(checked: boolean) => void` | —            | Callback bei Zustandswechsel                     |
| `disabled`        | `boolean`                    | `false`      | Deaktivierter Zustand                            |
| `className`       | `string`                     | —            | Wird nach dem Komponenten-Klassennamen angehängt |
| `semanticLabel`   | `string`                     | —            | Barrierefreiheitsname                            |

## Barrierefreiheit

Die Komponente trägt die semantische Rolle `switch`; der semantische Wert wechselt mit dem Zustand zwischen `on` / `off` / `disabled`. Beim Drücken mit dem Zeiger wird automatisch fokussiert. Der Schalter hat keinen sichtbaren Text – bitte immer `semanticLabel` angeben.
