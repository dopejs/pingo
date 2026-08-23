---
title: Input
description: Champ de saisie de texte sur une seule ligne, piloté par le moteur d'édition pingo et rendu sur un canvas.
---

# Input

Saisie de texte sur une seule ligne. L’aperçu ci-dessous est rendu en temps réel par le moteur pingo — vous pouvez réellement saisir, sélectionner et supprimer du texte après avoir cliqué, et l’affichage suit le thème clair ou sombre du site.

:::preview input-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { Input } from "@dopejs/pingo-ui";

root.render(
  createElement(Input, {
    semanticLabel: "邮箱",
    width: 320,
    onValueChange: (value) => console.log(value),
  }),
);
```

`Input` maintient en interne un `TextEditingController` stable via des hooks ; il doit donc être monté sous forme de composant avec `createElement(Input, props)`, et ne peut pas être appelé directement comme une fonction. Pour les détails sur l’édition, consultez le [guide d’édition de texte](/guide/editing).

## Exemples

### Préfixe, suffixe et mot de passe

Les emplacements `prefix`/`suffix` peuvent contenir des icônes ou des unités ; `password` active la saisie masquée ; `disabled` verrouille tout le champ.

:::preview input-adornments
:::

### Utilisation contrôlée

Fournir votre propre `controller` active le mode contrôlé : dans ce cas, `value` est ignoré et ne sert que de valeur initiale, tandis que l’appelant détient le contrôleur et conserve la même instance d’un rendu à l’autre.

## Props

| Prop | Type | Valeur par défaut | Description |
| --- | --- | --- | --- |
| `value` | `string` | `""` | Valeur initiale en utilisation non contrôlée ; ignorée lorsque `controller` est défini |
| `onValueChange` | `(value: string) => void` | — | Rappel déclenché après l’application de chaque transaction d’édition avec la dernière valeur |
| `controller` | `TextEditingController` | — | Échappatoire avancée : contrôleur persistant détenu par l’appelant |
| `onTransaction` | `(transaction: EditTransaction) => void` | — | Rappel brut pour chaque transaction d’édition |
| `onSubmit` | `() => void` | — | Rappel de soumission (touche Entrée) |
| `disabled` | `boolean` | `false` | État désactivé |
| `readOnly` | `boolean` | `false` | État en lecture seule |
| `password` | `boolean` | `false` | Saisie masquée |
| `inputMode` | `"decimal" \| "email" \| "none" \| "numeric" \| "search" \| "tel" \| "text" \| "url"` | `"text"` | Indication de disposition du clavier virtuel |
| `className` | `string` | — | Ajouté après le nom de classe du composant |
| `width` | `number` | — | Largeur fixe (px) |
| `semanticLabel` | `string` | — | Nom accessible |
| `prefix` | `PingoNode` | — | Décoration avant, comme une icône ou un symbole monétaire |
| `suffix` | `PingoNode` | — | Décoration arrière, comme une unité ou un bouton d’effacement |

## Accessibilité

Utilisez `semanticLabel` pour fournir le nom du champ ; `disabled` et `readOnly` font tous deux sortir le champ de la séquence d’édition. Limite connue actuelle : il n’existe pas encore de texte de remplacement (placeholder) ni de style d’anneau de focus.
