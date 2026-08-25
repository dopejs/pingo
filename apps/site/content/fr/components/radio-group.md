---
title: Groupe de boutons radio
description: Groupe d'options à sélection unique, prend en charge la navigation par touches fléchées, rendu sur le canevas pingo.
---

# Groupe de boutons radio

Le groupe de boutons radio sert à sélectionner une option parmi un ensemble d'options mutuellement exclusives. L'aperçu ci-dessous est rendu en temps réel par le moteur pingo — vous pouvez cliquer sur une option ou utiliser les touches fléchées pour déplacer la sélection, et suivre le thème du site pour basculer entre clair et sombre.

:::preview radio-group-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { RadioGroup, RadioGroupItem } from "@dopejs/pingo-ui";

root.render(
  createElement(RadioGroup, {
    defaultValue: "b",
    onValueChange: (value) => console.log(value),
    children: [
      createElement(RadioGroupItem, { value: "a", label: "选项 A" }),
      createElement(RadioGroupItem, { value: "b", label: "选项 B" }),
      createElement(RadioGroupItem, { value: "c", label: "选项 C" }),
    ],
  }),
);
```

`RadioGroup` publie la valeur courante vers `RadioGroupItem` via le contexte, c'est pourquoi les deux doivent être montés en tant que composants avec `createElement`. Passer `value` active le mode contrôlé ; sinon, utilisez `defaultValue` pour laisser le composant gérer son propre état.

## Exemples

### Désactivation

Passer `disabled` à `RadioGroup` désactive tout le groupe, et la valeur sémantique de chaque option devient `disabled`.

## Props

### RadioGroup

| Prop            | Type                      | Valeur par défaut | Description                                |
| --------------- | ------------------------- | ----------------- | ------------------------------------------ |
| `value`         | `string`                  | —                 | Valeur sélectionnée contrôlée              |
| `defaultValue`  | `string`                  | —                 | Valeur sélectionnée initiale non contrôlée |
| `onValueChange` | `(value: string) => void` | —                 | Rappel lors du changement de sélection     |
| `disabled`      | `boolean`                 | `false`           | Désactive tout le groupe                   |
| `children`      | `PingoNode`               | —                 | Liste de `RadioGroupItem` (requis)         |
| `className`     | `string`                  | —                 | Ajouté après le nom de classe du composant |

### RadioGroupItem

| Prop        | Type     | Valeur par défaut | Description                                |
| ----------- | -------- | ----------------- | ------------------------------------------ |
| `value`     | `string` | —                 | Valeur de l'option (requis)                |
| `label`     | `string` | —                 | Texte de l'option                          |
| `className` | `string` | —                 | Ajouté après le nom de classe du composant |

## Accessibilité

Le conteneur du groupe porte la sémantique `radiogroup`, chaque option porte la sémantique `radio` et bascule entre `checked` / `unchecked` / `disabled`. Conforme à WAI-ARIA : quel que soit le sens de disposition, les deux paires de touches fléchées permettent de déplacer la sélection et de synchroniser le focus.
