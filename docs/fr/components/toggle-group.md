---
title: Toggle Group
description: Un groupe de boutons de bascule à deux états, à sélection simple ou multiple, avec navigation au clavier et rendu sur le canvas pingo.
---

# Toggle Group

Le groupe de boutons de bascule combine plusieurs [Toggle](/components/toggle) en un ensemble à sélection simple ou multiple. L’aperçu ci-dessous est rendu en temps réel par le moteur pingo — vous pouvez cliquer pour basculer, vous déplacer entre les éléments avec les touches fléchées et suivre le thème clair ou sombre du site.

:::preview toggle-group-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { ToggleGroup, ToggleGroupItem } from "@dopejs/pingo-ui";

root.render(
  createElement(ToggleGroup, {
    type: "single",
    defaultValue: ["center"],
    onValueChange: (value) => console.log(value),
    children: [
      createElement(ToggleGroupItem, { value: "left", children: "左对齐" }),
      createElement(ToggleGroupItem, { value: "center", children: "居中" }),
      createElement(ToggleGroupItem, { value: "right", children: "右对齐" }),
    ],
  }),
);
```

`ToggleGroup` publie l’ensemble sélectionné vers les `ToggleGroupItem` via le contexte ; les deux doivent être montés en tant que composants avec `createElement`. Avec `type: "single"`, une nouvelle sélection efface la précédente ; avec `"multiple"`, les éléments s’ajoutent un à un.

## Exemples

### Sélection multiple

`type="multiple"` permet d’activer plusieurs éléments simultanément, comme dans une barre d’outils de mise en forme de texte.

:::preview toggle-group-multiple
:::

## Props

### ToggleGroup

| Prop | Type | Défaut | Description |
| --- | --- | --- | --- |
| `type` | `"single" \| "multiple"` | `"single"` | La sélection simple efface le choix précédent ; la sélection multiple ajoute un à un |
| `value` | `readonly string[]` | — | Ensemble des valeurs sélectionnées en mode contrôlé |
| `defaultValue` | `readonly string[]` | `[]` | Ensemble sélectionné initial en mode non contrôlé |
| `onValueChange` | `(value: readonly string[]) => void` | — | Rappel lors du changement de l’ensemble sélectionné |
| `children` | `PingoNode` | — | Liste de `ToggleGroupItem` (requis) |
| `className` | `string` | — | Ajouté après le nom de classe du composant |

### ToggleGroupItem

| Prop | Type | Défaut | Description |
| --- | --- | --- | --- |
| `value` | `string` | — | Valeur de l’élément (requis) |
| `children` | `string` | — | Texte de l’élément (requis) |
| `disabled` | `boolean` | `false` | Désactive l’élément |
| `className` | `string` | — | Ajouté après le nom de classe du composant |

## Accessibilité

Le conteneur du groupe porte la sémantique `group`, et chaque élément hérite de la sémantique de bouton ainsi que des valeurs sémantiques `on` / `off` du composant Toggle. La gestion du clavier est centralisée sur le groupe : `←`/`→` déplace le focus vers l’élément adjacent, `Entrée`/`Espace` bascule l’élément courant — l’ajout ou la suppression d’éléments n’affecte pas cette navigation.
