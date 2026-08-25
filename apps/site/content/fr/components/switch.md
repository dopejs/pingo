---
title: Switch
description: Interrupteur contrôlé pour les réglages booléens à effet immédiat, rendu sur le canvas pingo.
---

# Switch

L'interrupteur sert aux réglages booléens à effet immédiat. L'aperçu ci-dessous est rendu en temps réel par le moteur pingo et bascule entre clair et sombre selon le thème du site. Switch est un composant contrôlé : l'aperçu présente des combinaisons statiques activé/désactivé/désactivé, l'interaction étant pilotée par l'état détenu par l'appelant.

:::preview switch-basic
:::

## Utilisation

```tsx
import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
import { Switch } from "@dopejs/pingo-ui";

// useSignal est un hook, il doit s'exécuter dans la portée d'un composant.
function AirplaneMode(): PingoNode {
  const on = useSignal(false);
  return createElement(Switch, {
    checked: on.get(),
    semanticLabel: "Mode avion",
    onCheckedChange: (next) => on.set(next),
  });
}

root.render(createElement(AirplaneMode));
```

`checked` est détenu par le composant parent, `onCheckedChange` se charge de le mettre à jour — le composant lui-même ne conserve aucun état.

## Exemples

### Désactivation

Une fois `disabled` transmis, l'interrupteur ne répond plus au pointeur ni au clavier, et la valeur sémantique devient `disabled`.

## Props

| Prop              | Type                         | Valeur par défaut | Description                                    |
| ----------------- | ---------------------------- | ----------------- | ---------------------------------------------- |
| `checked`         | `boolean`                    | —                 | État de l'interrupteur (obligatoire, contrôlé) |
| `onCheckedChange` | `(checked: boolean) => void` | —                 | Rappel de changement d'état                    |
| `disabled`        | `boolean`                    | `false`           | État désactivé                                 |
| `className`       | `string`                     | —                 | Ajouté après le nom de classe du composant     |
| `semanticLabel`   | `string`                     | —                 | Nom d'accessibilité                            |

## Accessibilité

Le composant porte le rôle sémantique `switch`, la valeur sémantique bascule entre `on` / `off` / `disabled` selon l'état. La focalisation se fait automatiquement à l'appui du pointeur. L'interrupteur n'ayant aucun texte visible, fournissez toujours un `semanticLabel`.
