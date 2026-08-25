---
title: Menu de navigation
description: Barre de menu de style navigation de site, comportement identique à Menubar et sémantique de navigation.
---

# Menu de navigation

Le Menu de navigation est la version sémantique de navigation du [Menubar](/components/menubar) : la même ligne de déclencheurs et le même panneau déplié, mais avec une sémantique de navigation exposée, adaptée à la navigation principale d’un site. L’aperçu ci-dessous est rendu en temps réel par le moteur pingo et bascule entre clair et sombre selon le thème du site.

:::preview navigation-menu-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { MenubarMenu, NavigationMenu } from "@dopejs/pingo-ui";

root.render(
  createElement(NavigationMenu, {
    onValueChange: (value) => {},
    children: [
      createElement(MenubarMenu, {
        value: "products",
        label: "产品",
        children: createElement("text", { value: "渲染引擎" }),
      }),
      createElement(MenubarMenu, {
        value: "docs",
        label: "文档",
        children: createElement("text", { value: "快速开始" }),
      }),
    ],
  }),
);
```

Les entrées réutilisent `MenubarMenu`. L’ouverture/fermeture est non contrôlée par défaut ; passer `value` bascule en mode contrôlé. Le comportement interactif (navigation au clavier, partage de la position d’ouverture) est strictement identique à Menubar.

## Props

`NavigationMenu` accepte toutes les props de `MenubarProps` à l’exception de `navigation` :

| Prop            | Type                                   | Valeur par défaut | Description                                                           |
| --------------- | -------------------------------------- | ----------------- | --------------------------------------------------------------------- |
| `value`         | `string`                               | —                 | Contrôlé : valeur du menu actuellement ouvert                         |
| `onValueChange` | `(value: string \| undefined) => void` | —                 | Rappel lors du changement du menu ouvert (`undefined` à la fermeture) |
| `children`      | `PingoNode`                            | —                 | Plusieurs `MenubarMenu` (obligatoire)                                 |
| `className`     | `string`                               | —                 | Classe supplémentaire                                                 |

Pour les props des entrées, voir [Menubar](/components/menubar#menubarmenu).

## Accessibilité

Le conteneur possède une sémantique de navigation, les libellés possèdent une sémantique d’élément de menu et exposent l’état expanded/collapsed ; les flèches gauche/droite se déplacent entre les entrées, `Escape` ferme et redonne le focus au libellé courant.
