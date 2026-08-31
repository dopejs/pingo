---
title: Badge
description: Petite étiquette de statut non interactive, rendue dans le canvas pingo.
---

# Badge

Badge est une étiquette de statut non interactive, pour marquer un statut, une catégorie ou une
quantité — par exemple « Admin » ou « Beta ». L'aperçu ci-dessous est rendu en direct par le
moteur pingo et suit le thème clair/sombre du site.

:::preview badge-variants
:::

## Utilisation

```tsx
import { Badge } from "@dopejs/pingo-ui";

root.render(<Badge>Beta</Badge>);
```

## Exemples

### Variantes

Quatre variantes couvrent les sémantiques courantes : `default` (accentué), `secondary` (discret),
`destructive` (erreur/danger), `outline` (contour). L'aperçu les présente dans cet ordre.

```tsx
<Badge variant="secondary">只读</Badge>
```

### Combiné à d'autres composants

Badge s'emploie souvent comme élément trailing d'une ligne de liste ou d'une carte, combiné à
`Avatar` et `ListRow` :

```tsx
<ListRow
  title="张三"
  leading={<Avatar fallback="张" size={32} />}
  trailing={<Badge>管理员</Badge>}
  onPress={() => {}}
/>
```

## Props

| Prop            | Type                                                     | Valeur par défaut | Description                                                         |
| --------------- | -------------------------------------------------------- | ----------------- | ------------------------------------------------------------------- |
| `children`      | `string`                                                 | —                 | Texte de l'étiquette (obligatoire)                                  |
| `variant`       | `"default" \| "secondary" \| "destructive" \| "outline"` | `"default"`       | Variante visuelle                                                   |
| `semanticLabel` | `string`                                                 | —                 | Nom d'accessibilité ; sans lui, la sémantique par défaut s'applique |
| `className`     | `string`                                                 | —                 | Ajouté après les classes du composant                               |

## Accessibilité

Badge ne répond ni au pointeur ni au clavier : c'est un élément purement visuel. Quand le texte ne
suffit pas à transmettre le sens (badge purement numérique, par exemple), fournissez une
explication complète via `semanticLabel`.
