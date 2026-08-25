---
title: Menubar
description: Barre de menus d'application de style bureau, où plusieurs menus partagent une même ouverture.
---

# Menubar

Menubar est une rangée de menus partageant la même ouverture, similaire à la barre de menus des applications de bureau. L'aperçu ci-dessous est rendu en temps réel par le moteur pingo — cliquez sur les onglets « Fichier », « Édition », etc. pour ouvrir ou fermer le menu correspondant, et suivez la commutation clair/sombre selon le thème du site.

:::preview menubar-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { Menubar, MenubarMenu } from "@dopejs/pingo-ui";

root.render(
  createElement(Menubar, {
    onValueChange: (value) => {},
    children: [
      createElement(MenubarMenu, {
        value: "file",
        label: "Fichier",
        children: createElement("text", { value: "Nouveau" }),
      }),
      createElement(MenubarMenu, {
        value: "edit",
        label: "Édition",
        children: createElement("text", { value: "Annuler" }),
      }),
    ],
  }),
);
```

`MenubarMenu` lit l'état de la barre de menus via le contexte et doit être un nœud enfant de `Menubar` ; son `children` est le contenu du panneau affiché à l'ouverture. L'ouverture/fermeture est non contrôlée par défaut ; passer `value` bascule en mode contrôlé (la valeur est le `value` du menu actuellement ouvert).

## Exemples

### Ouverture contrôlée

Passez `value` pour fixer le menu ouvert, utile pour le guidage initial ou la synchronisation avec un état externe.

:::preview menubar-open
:::

## Props

### Menubar

| Prop            | Type                                   | Défaut  | Description                                                                                                |
| --------------- | -------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| `value`         | `string`                               | —       | Contrôlé : valeur du menu actuellement ouvert                                                              |
| `onValueChange` | `(value: string \| undefined) => void` | —       | Rappel de changement du menu ouvert (`undefined` à la fermeture)                                           |
| `children`      | `PingoNode`                            | —       | Plusieurs `MenubarMenu` (requis)                                                                           |
| `className`     | `string`                               | —       | Nom de classe supplémentaire                                                                               |
| `navigation`    | `boolean`                              | `false` | Utilise la sémantique de navigation (utilisé en interne par [NavigationMenu](/components/navigation-menu)) |

### MenubarMenu

| Prop        | Type        | Défaut | Description                               |
| ----------- | ----------- | ------ | ----------------------------------------- |
| `value`     | `string`    | —      | Identifiant du menu (requis)              |
| `label`     | `string`    | —      | Libellé affiché dans la barre (requis)    |
| `children`  | `PingoNode` | —      | Contenu du panneau à l'ouverture (requis) |
| `className` | `string`    | —      | Nom de classe supplémentaire              |

## Accessibilité

La barre de menus possède la sémantique menubar, les onglets la sémantique menuitem et exposent l'état expanded/collapsed ; les flèches gauche/droite permettent de se déplacer entre les menus, et basculent également à l'ouverture du menu, `Escape` ferme et redonne le focus à l'onglet actif.
