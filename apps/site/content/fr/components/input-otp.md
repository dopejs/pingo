---
title: Input OTP
description: Saisie de code de vérification à usage unique de longueur fixe, avec saisie case par case et collage complet, rendu sur le canevas pingo.
---

# Input OTP

Saisie de code de vérification à usage unique, composée de plusieurs cases de longueur fixe. L’aperçu ci-dessous est rendu en temps réel par le moteur pingo — vous pouvez saisir les chiffres case par case, coller un code complet et suivre la bascule clair/sombre selon le thème du site.

:::preview input-otp-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { InputOTP } from "@dopejs/pingo-ui";

root.render(
  createElement(InputOTP, {
    length: 6,
    semanticLabel: "一次性验证码",
    onValueChange: (value) => console.log(value),
    onComplete: (code) => verify(code),
  }),
);
```

La valeur interne est une **chaîne de longueur fixe, complétée par des espaces** : un espace représente une case vide. `onValueChange` reçoit cette valeur complétée ; `onComplete` est déclenché une seule fois lorsque toutes les cases sont remplies, et reçoit le code complet sans les espaces. Le collage est traité comme un remplissage complet à partir de la case courante, la suppression efface uniquement la case courante sans décaler vers la gauche les chiffres suivants.

## Exemples

### Longueur

`length` détermine le nombre de cases (6 par défaut). Chaque case utilise le clavier numérique (`inputMode: "numeric"`).

## Props

| Prop            | Type                      | Valeur par défaut | Description                                                                                                |
| --------------- | ------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------- |
| `length`        | `number`                  | `6`               | Nombre de cases                                                                                            |
| `value`         | `string`                  | —                 | Valeur contrôlée courante (complétée par des espaces)                                                      |
| `defaultValue`  | `string`                  | —                 | Valeur initiale non contrôlée                                                                              |
| `onValueChange` | `(value: string) => void` | —                 | Rappel lors du changement de valeur, la valeur étant une chaîne de longueur fixe complétée par des espaces |
| `onComplete`    | `(value: string) => void` | —                 | Rappel lorsque toutes les cases sont remplies, la valeur étant le code complet sans les espaces            |
| `disabled`      | `boolean`                 | `false`           | Désactive toutes les cases                                                                                 |
| `semanticLabel` | `string`                  | —                 | Nom accessible du groupe                                                                                   |
| `className`     | `string`                  | —                 | Ajouté après le nom de classe du composant                                                                 |

## Accessibilité

Le composant porte le rôle sémantique `group` ; chaque case reçoit automatiquement un nom accessible sous la forme `numéro/total` (par exemple `3/6`), et il est également possible de nommer l’ensemble du groupe via `semanticLabel`.
