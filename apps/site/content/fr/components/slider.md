---
title: Slider
description: Curseur numérique, avec prise en charge du glisser-déposer et de l’ajustement fin au clavier, rendu sur le canvas pingo.
---

# Slider

Le curseur sert à sélectionner une valeur dans un intervalle. L’aperçu ci-dessous est rendu en temps réel par le moteur pingo : vous pouvez faire glisser la poignée ou l’ajuster finement avec les flèches, et il bascule entre thème clair et sombre en suivant le site.

:::preview slider-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { Slider } from "@dopejs/pingo-ui";

root.render(
  createElement(Slider, {
    defaultValue: 40,
    min: 0,
    max: 100,
    step: 1,
    semanticLabel: "音量",
    onValueChange: (value) => console.log(value),
  }),
);
```

`Slider` conserve en interne l’état de glissement via des hooks et doit être monté comme composant avec `createElement`. Fournir `value` active le mode contrôlé ; sinon, utiliser `defaultValue` pour que le composant gère lui-même son état.

## Exemples

### Intervalle et incrément

`min` / `max` délimitent l’intervalle de valeurs (par défaut 0–100), `step` définit la granularité de l’ajustement au clavier (par défaut 1).

### Désactivation

Avec `disabled`, le curseur ne répond plus ni au glisser-déposer ni au clavier.

## Props

| Prop            | Type                      | Valeur par défaut | Description                                |
| --------------- | ------------------------- | ----------------- | ------------------------------------------ |
| `value`         | `number`                  | —                 | Valeur actuelle contrôlée                  |
| `defaultValue`  | `number`                  | `min`             | Valeur initiale non contrôlée              |
| `onValueChange` | `(value: number) => void` | —                 | Rappel lors d’un changement de valeur      |
| `min`           | `number`                  | `0`               | Valeur minimale                            |
| `max`           | `number`                  | `100`             | Valeur maximale                            |
| `step`          | `number`                  | `1`               | Incrément au clavier                       |
| `disabled`      | `boolean`                 | `false`           | État désactivé                             |
| `semanticLabel` | `string`                  | —                 | Nom d’accessibilité                        |
| `className`     | `string`                  | —                 | Ajouté après le nom de classe du composant |

## Accessibilité

Le composant porte le rôle sémantique `slider`, avec comme valeur sémantique la représentation en chaîne de la valeur actuelle. `←`/`↓` diminue d’un `step`, `→`/`↑` augmente d’un `step`, `Home`/`End` amène aux extrémités de l’intervalle ; la valeur est toujours bornée dans `[min, max]`.
