---
title: TopBar
description: Molécule de barre supérieure d'application, composée d'un titre et d'emplacements avant et arrière, rendue sur le canvas pingo.
---

# TopBar

TopBar est la molécule produit propre à pingo : elle combine le titre avec deux emplacements, `leading` (logo, retour) et `actions` (boutons, avatar), pour former une barre supérieure d'application sur une seule ligne. La colonne du titre occupe toujours l'espace restant (`flexGrow`), ce qui pousse les actions tout à droite, sans aucune mesure nécessaire. L'aperçu ci-dessous est rendu en temps réel par le moteur pingo et bascule entre thème clair et sombre selon le thème du site.

:::preview topbar-basic
:::

Relation de composition avec les primitives shadcn : TopBar ne fournit pas lui-même de boutons ni d'avatars, il définit le **squelette de mise en page** ; les emplacements `leading` et `actions` acceptent n'importe quel `PingoNode`, généralement composé de primitives telles que [Button](/components/button), IconButton, Avatar, etc. Plusieurs actions sont passées enveloppées dans un container avec `flexDirection: "row"`.

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { Avatar, Button, TopBar } from "@dopejs/pingo-ui";

root.render(
  createElement(TopBar, {
    title: "仪表盘",
    leading: createElement(Avatar, { fallback: "P", size: 28 }),
    actions: createElement(Button, {
      children: "新建",
      variant: "outline",
      onPress: () => create(),
    }),
  }),
);
```

## Exemples

### Sans titre

Lorsque `title` est omis, la colonne de titre est tout de même rendue (une colonne extensible vide), et les actions sont toujours poussées à droite ; cela convient aux barres d'outils ne contenant qu'une zone d'actions.

```tsx
createElement(TopBar, {
  actions: createElement(Button, { children: "导出", onPress: () => {} }),
});
```

## Props

| Prop        | Type        | Défaut | Description                                                           |
| ----------- | ----------- | ------ | --------------------------------------------------------------------- |
| `title`     | `string`    | —      | Texte du titre ; lorsqu'il est omis, rend une colonne extensible vide |
| `leading`   | `PingoNode` | —      | Emplacement avant, pour le logo ou le bouton de retour                |
| `actions`   | `PingoNode` | —      | Emplacement arrière, poussé tout à droite par la colonne du titre     |
| `className` | `string`    | —      | Ajouté après le nom de classe du composant                            |

## Accessibilité

TopBar possède le rôle sémantique `banner` ; lorsque `title` est fourni, le texte du titre porte le rôle `heading`. Les propriétés d'accessibilité des composants placés dans les emplacements (comme `semanticLabel` d'IconButton) relèvent de la responsabilité de chaque composant.
