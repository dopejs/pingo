---
title: Sheet
description: Panneau qui glisse depuis n’importe quel bord de l’écran, adapté au filtrage, aux détails et autres contenus secondaires.
---

# Sheet

Sheet fait glisser un panneau depuis le bord du conteneur, souvent utilisé pour les conditions de filtrage, les barres latérales de détail et d’autres contenus secondaires qui n’interrompent pas le flux principal. L’aperçu ci-dessous est rendu en temps réel par le moteur pingo et suit le thème clair/sombre du site.

:::preview sheet-basic
:::

## Utilisation

```tsx
import { Sheet } from "@dopejs/pingo-ui";

root.render(
  <Sheet open={open} onOpenChange={(next) => setOpen(next)} side="right">
    <text value="面板内容" />
  </Sheet>,
);
```

La couche flottante remplit son propre conteneur parent, montez-la donc près du nœud racine. `open` est une prop contrôlée ; un clic sur le masque ou la touche `Escape` demande la fermeture via `onOpenChange(false)`. Les blocs titre/boutons du panneau peuvent réutiliser `DialogHeader`, `DialogTitle`, `DialogDescription` et `DialogFooter`.

## Exemples

### Direction

`side` accepte `"left"`, `"right"`, `"top"`, `"bottom"`, avec `"right"` par défaut. Si seuls les bords supérieur et inférieur sont nécessaires, utilisez plutôt [Drawer](/components/drawer), dont la sémantique est plus explicite.

## Props

Hérite de `DialogProps` (`open`, `onOpenChange`, `children`, `className`), avec en plus :

| Prop   | Type                                     | Défaut    | Description                          |
| ------ | ---------------------------------------- | --------- | ------------------------------------ |
| `side` | `"left" \| "right" \| "top" \| "bottom"` | `"right"` | Bord depuis lequel le panneau glisse |

## Accessibilité

Le panneau possède une sémantique complementary ; à l’ouverture, le focus se déplace dans le panneau, et après fermeture par `Escape`, le focus revient à l’élément déclencheur.
