---
title: Toggle
description: Bouton de basculement à deux états pour les activations instantanées comme le gras ou l’italique, rendu sur le canvas pingo.
---

# Toggle

Bouton de basculement à deux états : une pression le maintient activé, une nouvelle pression le désactive. L’aperçu ci-dessous est rendu en temps réel par le moteur pingo — vous pouvez cliquer pour changer l’état, et il bascule entre thème clair et sombre en suivant le thème du site.

:::preview toggle-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { Toggle } from "@dopejs/pingo-ui";

root.render(
  createElement(Toggle, {
    children: "加粗",
    defaultPressed: true,
    onPressedChange: (pressed) => console.log(pressed),
  }),
);
```

`Toggle` conserve son état en interne via les hooks et doit être monté en tant que composant avec `createElement`. Fournir `pressed` place le composant en mode contrôlé ; sinon, utilisez `defaultPressed` pour que le composant gère lui-même son état.

## Exemples

### Désactivé

Lorsque `disabled` est fourni, le bouton ne répond plus au pointeur ni au clavier, et n’accepte plus l’activation par Entrée ou Espace.

## Props

| Prop | Type | Valeur par défaut | Description |
| --- | --- | --- | --- |
| `children` | `string` | — | Texte du bouton (obligatoire) |
| `pressed` | `boolean` | — | État pressé contrôlé |
| `defaultPressed` | `boolean` | `false` | État pressé initial non contrôlé |
| `onPressedChange` | `(pressed: boolean) => void` | — | Rappel lors du changement d’état |
| `disabled` | `boolean` | `false` | État désactivé |
| `className` | `string` | — | Ajouté après le nom de classe du composant |

## Accessibilité

Le composant porte la sémantique d’un bouton, et la valeur sémantique alterne entre `on` et `off` selon l’état. Le focus est automatiquement donné à la pression du pointeur, et `Entrée` comme `Espace` permettent l’activation.
