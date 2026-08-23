---
title: Alert
description: "Callout-Block für wichtige Hinweise, gerendert auf dem pingo-Canvas."
---

# Alert

Alert zeigt Hinweise an, die die Aufmerksamkeit der Nutzer erfordern, ohne den Ablauf zu
unterbrechen. Die Vorschau unten wird von der pingo-Engine in Echtzeit gerendert und folgt dem
Hell-/Dunkel-Theme der Website.

:::preview alert-basic
:::

## Verwendung

```tsx
import { createElement } from "@dopejs/pingo";
import { Alert } from "@dopejs/pingo-ui";

root.render(
  createElement(Alert, {
    title: "提示",
    children: "你的配置已自动保存。",
  }),
);
```

## Beispiele

### Destruktiver Hinweis

`variant="destructive"` ist für Fehler- und Fehlschlag-Szenarien: Rahmen und Titel wechseln in die
destruktive Farbgebung, der Beschreibungstext behält die normale Vordergrundfarbe und bleibt gut
lesbar.

```tsx
createElement(Alert, {
  title: "同步失败",
  variant: "destructive",
  children: "请检查网络连接后重试。",
});
```

## Props

| Prop | Typ | Standardwert | Beschreibung |
| --- | --- | --- | --- |
| `title` | `string` | — | Titel (Pflicht) |
| `children` | `string` | — | Beschreibungstext (Pflicht) |
| `variant` | `"default" \| "destructive"` | `"default"` | Visuelle Variante |
| `className` | `string` | — | Wird hinter die Komponentenklassen gehängt |

## Barrierefreiheit

Alert ist ein rein statischer Textblock und reißt den Fokus nicht an sich; fassen Sie die Kernaussage
in einem knappen `title` zusammen und legen Sie Details in die Beschreibung. Szenarien, die eine
Bestätigung oder Aktion des Nutzers erfordern, gehören in einen `AlertDialog`.
