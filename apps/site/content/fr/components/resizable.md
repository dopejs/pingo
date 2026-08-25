---
title: Resizable
description: Disposition à deux panneaux dont la proportion est ajustable via une poignée de redimensionnement, rendue sur le canvas pingo.
---

# Resizable

Resizable divise le conteneur en deux panneaux. La poignée centrale permet d'ajuster la proportion par glisser-déposer, avec également un ajustement fin au clavier. L'aperçu ci-dessous est rendu en temps réel par le moteur pingo — essayez de faire glisser la poignée.

:::preview resizable-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { Resizable } from "@dopejs/pingo-ui";

root.render(
  createElement(Resizable, {
    defaultSplit: 0.4,
    first: sidebar,
    second: content,
  }),
);
```

Le composant occupe 100 % de la largeur et de la hauteur de son parent, qui doit donc avoir une taille définie. Il prend en charge à la fois l'utilisation non contrôlée (`defaultSplit`) et contrôlée (`split` + `onSplitChange`).

## Exemples

### Direction verticale

Passez `direction: "column"` pour basculer vers une division haut-bas ; la poignée devient horizontale.

:::preview resizable-vertical
:::

## Props

| Prop            | Type                      | Valeur par défaut | Description                                          |
| --------------- | ------------------------- | ----------------- | ---------------------------------------------------- |
| `first`         | `PingoNode`               | —                 | Contenu du premier panneau (obligatoire)             |
| `second`        | `PingoNode`               | —                 | Contenu du second panneau (obligatoire)              |
| `split`         | `number`                  | —                 | Contrôlé : proportion du premier panneau, `[0, 1]`   |
| `defaultSplit`  | `number`                  | `0.5`             | Non contrôlé : proportion initiale                   |
| `onSplitChange` | `(split: number) => void` | —                 | Rappel lors du changement de proportion              |
| `direction`     | `"row" \| "column"`       | `"row"`           | Direction de la division                             |
| `minSplit`      | `number`                  | `0.1`             | Proportion minimale (borne inférieure de limitation) |
| `maxSplit`      | `number`                  | `0.9`             | Proportion maximale (borne supérieure de limitation) |
| `disabled`      | `boolean`                 | `false`           | Désactive l'interaction avec la poignée              |
| `className`     | `string`                  | —                 | Ajouté après le nom de classe du composant           |

## Accessibilité

La poignée possède une sémantique de séparateur et expose la proportion actuelle (en pourcentage) aux technologies d'assistance. Lorsque la poignée a le focus, les touches directionnelles permettent un ajustement fin par pas de 2 % : gauche/droite pour une disposition horizontale, haut/bas pour une disposition verticale.
