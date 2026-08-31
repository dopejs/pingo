---
title: Divider
description: Séparateur visuel horizontal ou vertical, rendu sur le canevas pingo.
---

# Divider

Le séparateur fournit un regroupement visuel entre les contenus. L’aperçu ci-dessous est rendu en temps réel par le moteur pingo et suit le thème clair ou sombre du site.

:::preview divider-horizontal
:::

## Utilisation

```tsx
import { Divider } from "@dopejs/pingo-ui";

root.render(<Divider />);
```

## Exemples

### Séparateur vertical

Passez `orientation: "vertical"` pour obtenir un séparateur vertical. La hauteur d’un séparateur vertical est de 100 % du conteneur parent, qui doit donc avoir une hauteur définie.

:::preview divider-vertical
:::

## Props

| Prop          | Type                         | Valeur par défaut | Description                                |
| ------------- | ---------------------------- | ----------------- | ------------------------------------------ |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"`    | Direction du séparateur                    |
| `className`   | `string`                     | —                 | Ajouté après le nom de classe du composant |

La largeur d’un séparateur horizontal est de 100 % du conteneur parent et sa hauteur de 1px ; la hauteur d’un séparateur vertical est de 100 % du conteneur parent et sa largeur de 1px.

## Accessibilité

Divider est un élément purement visuel, sans rôle sémantique, et il est ignoré par les technologies d’assistance ; le regroupement du contenu doit être exprimé par des structures sémantiques telles que les titres.
