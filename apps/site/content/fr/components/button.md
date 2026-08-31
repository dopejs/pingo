---
title: Button
description: Bouton qui déclenche une action ou un événement, rendu dans le canvas pingo.
---

# Button

Le bouton déclenche une action. L'aperçu ci-dessous est rendu en direct par le moteur pingo — vous
pouvez cliquer, donner le focus, et il suit le thème clair/sombre du site.

:::preview button-basic
:::

## Utilisation

```tsx
import { Button } from "@dopejs/pingo-ui";

root.render(
  <Button variant="default" onPress={() => save()}>
    保存
  </Button>,
);
```

## Exemples

### Tailles

`size` accepte `default`, `sm`, `lg` et `icon`.

### Désactivé

Avec `disabled`, le bouton ne répond plus ni au pointeur ni au clavier et le style désactivé
s'applique.

## Props

| Prop            | Type                                                                | Valeur par défaut | Description                               |
| --------------- | ------------------------------------------------------------------- | ----------------- | ----------------------------------------- |
| `children`      | `string`                                                            | —                 | Texte du bouton (obligatoire)             |
| `variant`       | `"default" \| "secondary" \| "outline" \| "ghost" \| "destructive"` | `"default"`       | Variante visuelle                         |
| `size`          | `"default" \| "sm" \| "lg" \| "icon"`                               | `"default"`       | Taille                                    |
| `disabled`      | `boolean`                                                           | `false`           | État désactivé                            |
| `onPress`       | `() => void`                                                        | —                 | Callback d'activation au pointeur/clavier |
| `semanticLabel` | `string`                                                            | `children`        | Nom d'accessibilité                       |
| `className`     | `string`                                                            | —                 | Ajouté après les classes du composant     |

## Accessibilité

Le bouton possède la sémantique button et l'activation au clavier ; `semanticLabel` vaut
`children` par défaut — fournissez-le explicitement pour un bouton icône.
