---
title: Form
description: Conteneur de formulaire et enveloppe de champ, responsable de la disposition, de la sémantique et des emplacements d’erreur/de description, rendu sur le canvas pingo.
---

# Form

`Form` est le conteneur de formulaire, `FormField` assemble l’étiquette, le contrôle et l’information d’erreur/de description en un champ. L’aperçu ci-dessous est rendu en temps réel par le moteur pingo — les champs de saisie sont réellement modifiables et suivent le thème clair/sombre du site.

:::preview form-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { Form, FormField, Input } from "@dopejs/pingo-ui";

root.render(
  createElement(Form, {
    children: createElement(FormField, {
      label: "邮箱",
      required: true,
      error: emailError, // 校验规则由调用方持有
      children: createElement(Input, {
        semanticLabel: "邮箱",
        onValueChange: (value) => validate(value),
      }),
    }),
  }),
);
```

La validation n’est pas dans le composant : quand valider, quelle erreur signaler, comment les combiner sont des décisions produit. L’appelant détient les règles et passe `error`, le composant ne fait que la disposition, la sémantique et les emplacements d’information.

## Exemples

### Erreur et description

Quand `error` existe, le champ est marqué comme invalide et **remplace** le texte de description — s’il y a deux lignes d’indication et qu’une seule est un message d’échec, l’autre la noierait. `required` ajoute un `*` après l’étiquette.

## Props

### Form

| Prop        | 类型        | 默认值 | 说明                                       |
| ----------- | ----------- | ------ | ------------------------------------------ |
| `children`  | `PingoNode` | —      | Contenu du formulaire (obligatoire)        |
| `className` | `string`    | —      | Ajouté après le nom de classe du composant |

### FormField

| Prop          | 类型        | 默认值  | 说明                                                                                      |
| ------------- | ----------- | ------- | ----------------------------------------------------------------------------------------- |
| `label`       | `string`    | —       | Étiquette du champ (obligatoire)                                                          |
| `children`    | `PingoNode` | —       | Contrôle du champ (obligatoire)                                                           |
| `error`       | `string`    | —       | Message d’erreur ; s’il existe, marque le champ comme invalide et remplace la description |
| `description` | `string`    | —       | Texte d’aide descriptif                                                                   |
| `required`    | `boolean`   | `false` | Marque obligatoire, ajoute un `*` après l’étiquette                                       |
| `className`   | `string`    | —       | Ajouté après le nom de classe du composant                                                |

## Accessibilité

`Form` porte le rôle sémantique `form` ; `FormField` porte le rôle sémantique `group` et est nommé par l’étiquette, avec la valeur sémantique `invalid` lorsqu’il est invalide. L’annotation sémantique est posée sur le groupe et non sur le contrôle — le contrôle appartient à l’appelant, le groupe est le seul élément dont l’existence est garantie.
