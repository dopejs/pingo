---
title: Bouton à icône
description: Bouton ne portant qu'une icône, avec nom accessible obligatoire, rendu sur le canvas pingo.
---

# Bouton à icône

Le bouton à icône sert aux actions compactes sans étiquette texte. L'aperçu ci-dessous est rendu en temps réel par le moteur pingo — vous pouvez cliquer, le focaliser et suivre le thème clair/sombre du site.

:::preview icon-button-basic
:::

## Utilisation

```tsx
import { IconButton } from "@dopejs/pingo-ui";

root.render(
  <IconButton
    icon={<text value="★" />}
    semanticLabel="收藏"
    variant="outline"
    onPress={() => toggleFavorite()}
  />,
);
```

`icon` est un slot transmis tel quel, qui accepte n'importe quel `PingoNode` — police d'icônes, SVG ou glyphe texte conviennent. Comme il n'y a pas de texte visible, `semanticLabel` est obligatoire.

## Exemples

### Variantes

`variant` est entièrement aligné avec [Button](/components/button) : `default`, `secondary`, `outline`, `ghost`, `destructive`.

### Limites connues

`size` prend en charge `default`, `sm`, `lg`, mais le skin actuel ne définit pas de règles composites `sm`/`lg` pour la variante à icône : la taille de l'icône remplace le modificateur de taille, et `sm`/`lg` n'ont pour l'instant aucun effet visuel.

## Props

| Prop            | Type                                                                | Défaut      | Description                                                  |
| --------------- | ------------------------------------------------------------------- | ----------- | ------------------------------------------------------------ |
| `icon`          | `PingoNode`                                                         | —           | Slot d'icône, transmis tel quel (obligatoire)                |
| `semanticLabel` | `string`                                                            | —           | Nom accessible (obligatoire)                                 |
| `variant`       | `"default" \| "secondary" \| "outline" \| "ghost" \| "destructive"` | `"default"` | Variante visuelle                                            |
| `size`          | `"default" \| "sm" \| "lg"`                                         | `"default"` | Taille (`sm`/`lg` sans effet pour l'instant, voir ci-dessus) |
| `disabled`      | `boolean`                                                           | `false`     | État désactivé                                               |
| `onPress`       | `() => void`                                                        | —           | Rappel d'activation pointeur/clavier                         |
| `className`     | `string`                                                            | —           | Ajouté après le nom de classe du composant                   |

## Accessibilité

Le bouton à icône n'a pas de texte visible : les lecteurs d'écran ne peuvent s'appuyer que sur `semanticLabel`, c'est pourquoi cette prop est obligatoire. Le bouton possède la sémantique button et la prise en charge de l'activation au clavier.
