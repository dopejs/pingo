---
title: Button
description: "Button zum Auslösen von Aktionen oder Ereignissen, gerendert auf dem pingo-Canvas."
---

# Button

Ein Button löst eine Aktion aus. Die Vorschau unten wird von der pingo-Engine in Echtzeit gerendert
— sie ist klickbar, fokussierbar und folgt dem Hell-/Dunkel-Theme der Website.

:::preview button-basic
:::

## Verwendung

```tsx
import { createElement } from "@dopejs/pingo";
import { Button } from "@dopejs/pingo-ui";

root.render(
  createElement(Button, {
    children: "保存",
    variant: "default",
    onPress: () => save(),
  }),
);
```

## Beispiele

### Größen

`size` unterstützt `default`, `sm`, `lg` und `icon`.

### Deaktiviert

Mit `disabled` reagiert der Button nicht mehr auf Zeiger und Tastatur und erhält den deaktivierten
Stil.

## Props

| Prop | Typ | Standardwert | Beschreibung |
| --- | --- | --- | --- |
| `children` | `string` | — | Buttontext (Pflicht) |
| `variant` | `"default" \| "secondary" \| "outline" \| "ghost" \| "destructive"` | `"default"` | Visuelle Variante |
| `size` | `"default" \| "sm" \| "lg" \| "icon"` | `"default"` | Größe |
| `disabled` | `boolean` | `false` | Deaktivierter Zustand |
| `onPress` | `() => void` | — | Aktivierungs-Callback für Zeiger/Tastatur |
| `semanticLabel` | `string` | `children` | Barrierefreiheitsname |
| `className` | `string` | — | Wird hinter die Komponentenklassen gehängt |

## Barrierefreiheit

Der Button trägt Button-Semantik und unterstützt Tastaturaktivierung; `semanticLabel` übernimmt
standardmäßig `children` — bei Icon-Buttons geben Sie es bitte explizit an.
