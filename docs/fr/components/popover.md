---
title: Popover
description: Panneau flottant ancré à côté du déclencheur, pour des informations complémentaires et des actions légères.
---

# Popover

Popover ouvre un panneau flottant à côté du déclencheur, et le panneau reste ancré lors du défilement de la page. L’aperçu ci-dessous est rendu en temps réel par le moteur pingo — cliquez sur le déclencheur pour l’ouvrir ou le fermer, et il bascule automatiquement entre thème clair et sombre selon le site.

:::preview popover-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@dopejs/pingo-ui";

root.render(
  createElement(Popover, {
    defaultOpen: false,
    onOpenChange: (open) => {},
    children: [
      createElement(PopoverTrigger, {
        children: createElement(Button, { children: "打开浮层", onPress: () => {} }),
      }),
      createElement(PopoverContent, {
        children: createElement("text", { value: "任意内容" }),
      }),
    ],
  }),
);
```

`PopoverTrigger` et `PopoverContent` lisent l’état du composant racine via le contexte et doivent être des nœuds enfants du même `Popover`. Le mode non contrôlé est utilisé par défaut (`defaultOpen`) ; passer `open` bascule en mode contrôlé. Le panneau est ancré sous le déclencheur par défaut ; une fois la relecture de mise en page activée, il bascule automatiquement de l’autre côté lorsque l’espace est insuffisant.

## Exemples

### Contenu arbitraire

Le `children` de `PopoverContent` accepte n’importe quel `PingoNode`, ce qui permet d’y placer des formulaires, des listes ou du contenu typographique.

:::preview popover-rich
:::

## Props

### Popover

| Prop | Type | Défaut | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | — | État d’ouverture contrôlé |
| `defaultOpen` | `boolean` | `false` | Ouverture initiale non contrôlée |
| `onOpenChange` | `(open: boolean) => void` | — | Rappel lors du changement d’ouverture |
| `children` | `PingoNode` | — | Trigger et Content (requis) |
| `className` | `string` | — | Ajouté après le nom de classe du conteneur d’ancrage |

### PopoverTrigger

| Prop | Type | Défaut | Description |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | Élément déclencheur (requis) |
| `className` | `string` | — | Nom de classe supplémentaire |

### PopoverContent

| Prop | Type | Défaut | Description |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | Contenu du panneau (requis) |
| `className` | `string` | — | Nom de classe supplémentaire |

## Accessibilité

Le déclencheur possède la sémantique d’un bouton et expose l’état expanded/collapsed ; `Escape` ferme le panneau et redonne le focus au déclencheur.
