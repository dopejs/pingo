---
title: Menu déroulant
description: Menu d’actions déplié au clic sur le déclencheur, avec prise en charge de la navigation clavier.
---

# Menu déroulant

Le menu déroulant déplie un ensemble d’éléments d’action sous le déclencheur. L’aperçu ci-dessous est rendu en temps réel par le moteur pingo — cliquez sur le déclencheur pour l’ouvrir ou le fermer, et il bascule entre thème clair et sombre selon le site.

:::preview dropdown-menu-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@dopejs/pingo-ui";

root.render(
  createElement(DropdownMenu, {
    onValueChange: (value) => run(value),
    children: [
      createElement(DropdownMenuTrigger, {
        children: createElement(Button, { children: "打开菜单", onPress: () => {} }),
      }),
      createElement(DropdownMenuContent, {
        children: [
          createElement(DropdownMenuItem, { value: "profile", children: "个人资料" }),
          createElement(DropdownMenuItem, { value: "settings", children: "设置" }),
        ],
      }),
    ],
  }),
);
```

Le déclencheur et le contenu lisent l’état du composant racine via le contexte et doivent être des nœuds enfants du même `DropdownMenu`. Après la sélection d’un élément, `onValueChange` est déclenché et le menu se ferme automatiquement. L’ouverture/fermeture est non contrôlée par défaut (`defaultOpen`), le composant ne fournit pas de prop contrôlée `open` — pour une sélection de liste entièrement contrôlée, utilisez plutôt Select (les deux partagent la même implémentation).

## Props

### DropdownMenu

| Prop | Type | Défaut | Description |
| --- | --- | --- | --- |
| `value` | `string` | — | Valeur actuellement sélectionnée (met en surbrillance l’élément correspondant) |
| `defaultOpen` | `boolean` | `false` | État d’ouverture initial |
| `onValueChange` | `(value: string) => void` | — | Rappel lors de la sélection d’un élément du menu |
| `onOpenChange` | `(open: boolean) => void` | — | Rappel lors du changement d’état d’ouverture |
| `children` | `PingoNode` | — | Déclencheur et contenu (obligatoire) |
| `className` | `string` | — | Ajouté après le nom de classe du conteneur d’ancrage |

### DropdownMenuTrigger

| Prop | Type | Défaut | Description |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | Élément déclencheur ; s’il est absent, rend la valeur actuelle ou le texte de remplacement |
| `placeholder` | `string` | — | Texte de remplacement en l’absence de valeur sélectionnée |
| `className` | `string` | — | Nom de classe supplémentaire |

### DropdownMenuContent

| Prop | Type | Défaut | Description |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | Éléments du menu (obligatoire) |
| `className` | `string` | — | Nom de classe supplémentaire |

### DropdownMenuItem

| Prop | Type | Défaut | Description |
| --- | --- | --- | --- |
| `value` | `string` | — | Valeur de l’élément de menu (obligatoire) |
| `children` | `string` | — | Texte affiché (obligatoire) |
| `className` | `string` | — | Nom de classe supplémentaire |

## Accessibilité

Le menu possède une sémantique de menu et les éléments une sémantique d’élément de menu ; une fois ouvert, les touches fléchées permettent de se déplacer vers le haut ou le bas, `Entrée`/`Espace` sélectionnent, `Échap` ferme le menu et rend le focus au déclencheur.
