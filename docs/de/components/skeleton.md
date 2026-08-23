---
title: Skeleton
description: Platzhalter-Skelettblöcke während des Ladens von Inhalten, gerendert auf der pingo-Canvas.
---

# Skeleton

Skeleton zeigt vor Abschluss des Ladens Platzhalterblöcke, deren Form dem endgültigen Layout ähnelt, und reduziert so das Sprunggefühl beim Warten. Die folgende Vorschau wird von der pingo-Engine in Echtzeit gerendert und folgt dem Hell-/Dunkel-Thema der Website.

:::preview skeleton-card
:::

## Verwendung

```tsx
import { createElement } from "@dopejs/pingo";
import { Skeleton } from "@dopejs/pingo-ui";

root.render(createElement(Skeleton, { width: 320, height: 16 }));
```

`width` / `height` können beide weggelassen werden; in diesem Fall wird die Größe vollständig dem äußeren Layout und deinem Stylesheet überlassen.

## Beispiele

### Zu einem Seiten-Skelett kombinieren

Setze aus mehreren Skeleton-Blöcken unterschiedlicher Größe die Struktur des kommenden Inhalts zusammen – die Vorschau oben ist ein Karten-Skelett aus „Avatar + Titel + zwei Textzeilen“. pingo hat keine gap-Eigenschaft; Abstände zwischen Blöcken werden durch leere Container mit fester Größe umgesetzt, siehe [Styling-Leitfaden](/guide/styling).

## Props

| Prop        | Typ      | Standardwert | Beschreibung                                                             |
| ----------- | -------- | ------------ | ------------------------------------------------------------------------ |
| `width`     | `number` | —            | Breite des Platzhalterblocks (px); wenn weggelassen, vom Layout bestimmt |
| `height`    | `number` | —            | Höhe des Platzhalterblocks (px); wenn weggelassen, vom Layout bestimmt   |
| `className` | `string` | —            | Wird nach dem Klassennamen der Komponente angehängt                      |

## Barrierefreiheit

Skeleton ist ein dekorativer Platzhalter ohne Semantik. Nach Abschluss des Ladens sollte er vollständig durch echten Inhalt ersetzt werden; ein längerer Verbleib im Skelett-Zustand bedeutet einen Ladefehler – bitte zeige dann eine Fehlermeldung und einen Einstieg zum erneuten Versuch.

Derzeit ein statischer Platzhalter (ohne Pulsanimation) – die Kernanimations-Teilmenge unterstützt noch keine CSS-Keyframes.
