---
title: Text Area
description: Champ de saisie de texte multiligne, piloté par le moteur d’édition pingo et rendu sur canvas.
---

# Text Area

Saisie de texte multiligne, destinée aux remarques, biographies et autres contenus longs. L’aperçu ci-dessous est rendu en temps réel par le moteur pingo — cliquez pour saisir réellement du texte multiligne, et suivez la bascule clair/sombre du thème du site.

:::preview text-area-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { TextArea } from "@dopejs/pingo-ui";

root.render(
  createElement(TextArea, {
    semanticLabel: "个人简介",
    width: 360,
    rows: 4,
    onValueChange: (value) => console.log(value),
  }),
);
```

`rows` détermine le nombre de lignes visibles et verrouille la hauteur minimale de l’enveloppe (`rows × hauteur de ligne + remplissage vertical`). Comme pour [Input](/components/input), `TextArea` doit être monté en tant que composant via `createElement`. Consultez le [guide d’édition de texte](/guide/editing) pour les détails d’édition.

## Exemples

### Désactivé

Lorsque `disabled` est passé, le champ ne reçoit plus de saisie et applique un style désactivé.

## Props

| Prop            | Type                                     | Valeur par défaut | Description                                                                                |
| --------------- | ---------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------ |
| `value`         | `string`                                 | `""`              | Valeur initiale pour l’utilisation non contrôlée ; ignorée lorsque `controller` est défini |
| `onValueChange` | `(value: string) => void`                | —                 | Rappelle la dernière valeur après l’application de chaque transaction d’édition            |
| `controller`    | `TextEditingController`                  | —                 | Échappatoire avancée : contrôleur persistant détenu par l’appelant                         |
| `onTransaction` | `(transaction: EditTransaction) => void` | —                 | Rappel brut pour chaque transaction d’édition                                              |
| `onSubmit`      | `() => void`                             | —                 | Rappel de soumission                                                                       |
| `disabled`      | `boolean`                                | `false`           | État désactivé                                                                             |
| `readOnly`      | `boolean`                                | `false`           | État en lecture seule                                                                      |
| `rows`          | `number`                                 | —                 | Nombre de lignes visibles, détermine la hauteur minimale de l’enveloppe                    |
| `className`     | `string`                                 | —                 | Ajouté après le nom de classe du composant                                                 |
| `width`         | `number`                                 | —                 | Largeur fixe (px)                                                                          |
| `semanticLabel` | `string`                                 | —                 | Nom accessible                                                                             |

## Accessibilité

Fournit le nom du champ via `semanticLabel` ; `disabled` et `readOnly` font tous deux sortir le champ de la séquence d’édition. Partage les lacunes connues avec Input : pas encore de texte indicatif ni de style d’anneau de focus.
