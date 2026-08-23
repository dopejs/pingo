---
title: Aspect Ratio
description: Conteneur qui contraint le contenu à un rapport largeur/hauteur fixe, rendu dans le canvas pingo.
---

# Aspect Ratio

Aspect Ratio maintient un rapport largeur/hauteur fixe : la largeur est décidée par la mise en
page, la hauteur est calculée automatiquement d'après le ratio. L'aperçu ci-dessous est rendu en
direct par le moteur pingo.

:::preview aspect-ratio-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { AspectRatio } from "@dopejs/pingo-ui";

root.render(
  createElement(AspectRatio, {
    ratio: 16 / 9,
    children: coverImage,
  }),
);
```

Le composant occupe 100 % de la largeur du parent ; `ratio` vaut largeur divisée par hauteur —
`16 / 9`, par exemple, pour du grand écran.

## Props

| Prop        | Type        | Valeur par défaut | Description                                 |
| ----------- | ----------- | ----------------- | ------------------------------------------- |
| `ratio`     | `number`    | `1`               | Rapport largeur/hauteur (largeur ÷ hauteur) |
| `children`  | `PingoNode` | —                 | Contenu contraint (obligatoire)             |
| `className` | `string`    | —                 | Ajouté après les classes du composant       |

## Accessibilité

Aspect Ratio est un conteneur de pure mise en page, sans sémantique supplémentaire. Le subset CSS
n'ayant pas de propriété `aspect-ratio`, le composant calcule la hauteur à partir de la largeur
mesurée : la première image est rendue avec une hauteur nulle, puis la hauteur est fixée une fois
la mesure arrivée.
