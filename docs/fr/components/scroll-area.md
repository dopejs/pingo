---
title: Scroll Area
description: Conteneur de défilement avec barre de défilement dessinée, rendu sur le canvas pingo.
---

# Scroll Area

Scroll Area fait défiler un contenu trop long dans une fenêtre de taille fixe et dessine une barre de défilement cohérente avec le thème. L’aperçu ci-dessous est rendu en temps réel par le moteur pingo — essayez de faire défiler la liste.

:::preview scroll-area-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { ScrollArea } from "@dopejs/pingo-ui";

root.render(
  createElement(ScrollArea, {
    children: items.map((item) => createElement("text", { value: item })),
  }),
);
```

Le composant occupe 100 % de la largeur et de la hauteur du parent et nécessite un parent aux dimensions définies ; la barre de défilement n’apparaît que lorsque le contenu dépasse la fenêtre.

## Props

| Prop | Type | Valeur par défaut | Description |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | Contenu à faire défiler (obligatoire) |
| `hideScrollbar` | `boolean` | `false` | Masque la barre de défilement dessinée (le défilement reste possible) |
| `className` | `string` | — | Ajouté après le nom de classe du composant |

## Accessibilité

Le comportement de défilement est fourni par le cœur du moteur, la fenêtre reste focusable et navigable au clavier. La barre de défilement est déduite de la géométrie mesurée de la fenêtre et du contenu ; lors d’un défilement rapide, le curseur peut accuser un retard d’une frame.

Pour les comportements de défilement liés au moteur, consultez le [guide sur le défilement](/guide/scrolling).
