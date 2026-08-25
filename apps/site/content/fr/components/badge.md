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
import { createElement } from "@dopejs/pingo";
import { Badge } from "@dopejs/pingo-ui";

root.render(createElement(Badge, { children: "Beta" }));
```

## Exemples

### Variantes

Quatre variantes couvrent les sémantiques courantes : `default` (accentué), `secondary` (discret),
`destructive` (erreur/danger), `outline` (contour). L'aperçu les présente dans cet ordre.

```tsx
createElement(Badge, { children: "只读", variant: "secondary" });
```

### Combiné à d'autres composants

Badge s'emploie souvent comme élément trailing d'une ligne de liste ou d'une carte, combiné à
`Avatar` et `ListRow` :

```tsx
createElement(ListRow, {
  title: "张三",
  leading: createElement(Avatar, { fallback: "张", size: 32 }),
  trailing: createElement(Badge, { children: "管理员" }),
  onPress: () => {},
});
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
