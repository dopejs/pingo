---
title: Menu contextuel
description: Menu contextuel déclenché par clic droit, qui apparaît à l'endroit où le pointeur est enfoncé.
---

# Menu contextuel

Le menu contextuel s'ouvre à la position du pointeur lors d'un clic droit (événement `contextmenu`) sur la zone cible. L'aperçu ci-dessous est rendu en temps réel par le moteur pingo : faites un clic droit sur la zone de texte pour ouvrir le menu, qui bascule entre thème clair et sombre selon le thème du site.

:::preview context-menu-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { ContextMenu } from "@dopejs/pingo-ui";

root.render(
  createElement(ContextMenu, {
    items: [
      { value: "copy", label: "Copier" },
      { value: "paste", label: "Coller", disabled: true },
      { value: "delete", label: "Supprimer" },
    ],
    onSelect: (value) => run(value),
    children: createElement("text", { value: "Clic droit ici" }),
  }),
);
```

Le menu est positionné à l'endroit où le pointeur est enfoncé, et non dans le coin du déclencheur ; il se ferme avec `Escape` ou après la sélection d'un élément. Les éléments désactivés ne participent pas à la navigation au clavier et ne répondent pas aux clics. En rendu statique, seule la zone de déclenchement est affichée ; le menu apparaît lors d'un clic droit.

## Props

| Prop           | Type                          | Valeur par défaut | Description                                       |
| -------------- | ----------------------------- | ----------------- | ------------------------------------------------- |
| `children`     | `PingoNode`                   | —                 | Contenu de la zone de déclenchement (obligatoire) |
| `items`        | `readonly ContextMenuEntry[]` | —                 | Éléments du menu (obligatoire)                    |
| `onSelect`     | `(value: string) => void`     | —                 | Rappel lors de la sélection d'un élément du menu  |
| `onOpenChange` | `(open: boolean) => void`     | —                 | Rappel lors du changement d'état d'ouverture      |
| `className`    | `string`                      | —                 | Nom de classe supplémentaire                      |

### ContextMenuEntry

| Champ      | Type      | Valeur par défaut | Description                               |
| ---------- | --------- | ----------------- | ----------------------------------------- |
| `value`    | `string`  | —                 | Valeur de l'élément du menu (obligatoire) |
| `label`    | `string`  | —                 | Texte affiché (obligatoire)               |
| `disabled` | `boolean` | `false`           | État désactivé                            |

## Accessibilité

Le menu possède la sémantique menu et les éléments du menu la sémantique menuitem ; une fois ouvert, les flèches haut et bas permettent de se déplacer, et `Escape` le ferme.
