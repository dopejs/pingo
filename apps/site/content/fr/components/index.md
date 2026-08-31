---
title: Composants
description: Bibliothèque de composants UI natifs pingo à la mentalité shadcn, entièrement rendue en direct dans le canvas.
---

# Composants

`@dopejs/pingo-ui` est une bibliothèque de composants alignée sur shadcn/ui : l'API et la
sémantique des habillages restent identiques, mais la cible de rendu est le moteur canvas pingo et
non le DOM. Chaque page de composant ci-dessous contient des aperçus **rendus en direct** — chaque
aperçu est un canvas dessiné par le moteur, interactif et suivant le thème du site.

## Utilisation

```tsx
import { createHostedCanvasRoot } from "@dopejs/pingo";
import { Button, createPingoUiStyleSheet } from "@dopejs/pingo-ui";

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [createPingoUiStyleSheet()],
});
root.render(<Button>保存</Button>);
```

Les feuilles de style personnalisées doivent être enregistrées **après** la feuille pingo-ui : à
spécificité égale, l'ordre d'enregistrement décide de la surcharge. Pour les thèmes et la
personnalisation de marque, voir le [guide des styles](/guide/styling) et
[SCSS et Less](/guide/scss-less).

Choisissez un composant dans le sommaire à gauche pour commencer.
