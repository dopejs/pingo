---
title: Drawer
description: Panneau de tiroir glissant depuis le bord supérieur ou inférieur, adapté aux actions en bas d’écran sur mobile.
---

# Drawer

Le Drawer est un panneau qui glisse depuis un bord horizontal — l’équivalent d’une [Sheet](/components/sheet) dont le `side` ne prend que `"top" | "bottom"`. L’aperçu ci-dessous est rendu en temps réel par le moteur pingo et suit le thème clair/sombre du site.

:::preview drawer-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { Drawer } from "@dopejs/pingo-ui";

root.render(
  createElement(Drawer, {
    open,
    onOpenChange: (next) => setOpen(next),
    side: "bottom",
    children: createElement("text", { value: "抽屉内容" }),
  }),
);
```

La couche remplit son propre conteneur parent, montez-la donc près de la racine. `open` est une prop contrôlée ; un clic sur le masque ou la touche `Escape` demande la fermeture via `onOpenChange(false)`. Les blocs titre/boutons du panneau peuvent réutiliser `DialogHeader`, `DialogTitle`, `DialogDescription` et `DialogFooter`.

## Exemples

### Direction

`side` accepte `"top"` et `"bottom"`, avec `"bottom"` par défaut.

## Props

Hérite de `DialogProps` (`open`, `onOpenChange`, `children`, `className`), avec en plus :

| Prop | Type | Défaut | Description |
| --- | --- | --- | --- |
| `side` | `"top" \| "bottom"` | `"bottom"` | Bord de glissement |

## Accessibilité

Le panneau a une sémantique complementary ; à l’ouverture, le focus entre dans le panneau, et après fermeture par `Escape`, le focus revient à l’élément déclencheur.
