---
title: Komponenten
description: Pingo-native UI-Komponentenbibliothek im shadcn-Geist, alle in Echtzeit auf Canvas gerendert.
---

# Komponenten

`@dopejs/pingo-ui` ist eine mit shadcn/ui ausgerichtete Komponentenbibliothek: Die API und die Skin-Semantik bleiben konsistent, das Renderziel ist jedoch die pingo-Canvas-Engine statt des DOM. Jede Komponentenseite unten enthält eine **in Echtzeit gerenderte** Vorschau – die Vorschau selbst ist ein von der Engine gezeichneter Canvas, der interaktiv ist und dem Theme-Wechsel folgt.

## Verwendung

```tsx
import { createHostedCanvasRoot } from "@dopejs/pingo";
import { Button, createPingoUiStyleSheet } from "@dopejs/pingo-ui";

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [createPingoUiStyleSheet()],
});
root.render(<Button>保存</Button>);
```

Benutzerdefinierte Stylesheets müssen **nach** dem pingo-ui-Stylesheet registriert werden; Regeln gleicher Spezifität überschreiben sich in Registrierungsreihenfolge. Theme- und Branding-Anpassungen finden Sie im [Styling-Guide](/guide/styling) und unter [SCSS und Less](/guide/scss-less).

Wählen Sie eine Komponente aus dem linken Inhaltsverzeichnis, um zu beginnen.
