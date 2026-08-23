---
title: "Widgets : briques moteur sans style"
description: "@dopejs/pingo-widgets fournit TextField, TextArea, Pressable, Button et d'autres briques moteur sans style, ainsi que la frontière avec @dopejs/pingo-ui."
---

# Widgets : briques moteur sans style

`@dopejs/pingo-widgets` est la première couche de composition au-dessus du moteur : il assemble les
[primitives éditables](/guide/elements-editing), le focus et les événements natifs en briques
utilisables, avec une décoration **minimale** (bordure, état d'erreur), sans présupposer aucun
système de design. Les applications ne dépendent pas directement de ce paquet interne — tous ses
exports sont ré-exportés par `@dopejs/pingo`. L'aperçu ci-dessous est rendu en direct et accepte
la saisie.

:::preview widgets-textfield
:::

## Exports et nommage

| Export | Description |
| --- | --- |
| `TextField` | Saisie monoligne : bordure + décoration d'état d'erreur, ne compose en interne que la primitive `editableText` |
| `TextArea` | Variante multiligne ; Entrée saute une ligne, la soumission reste au formulaire hôte |
| `Pressable` | Surface d'activation focalisable : View + focus + click/tap natif |
| `Button` | Combinaison pratique de `Pressable` + `Text` pour un bouton texte |

Attention au nommage : dans `@dopejs/pingo`, `TextArea` désigne ce widget décoré ; la
**primitive** multiligne est exportée sous le nom `UnstyledTextArea` (`TextAreaProps` a de même un
alias `UnstyledTextAreaProps`).

## TextField et TextArea

La décoration par défaut est une bordure de 1 px et une marge intérieure de 8 px ; passer une
chaîne `error` fait basculer sur une bordure couleur erreur et affiche sous le champ une
explication d'erreur de rôle `alert`. Le contrat contrôlé (`value` + `revision` + `onTransaction`)
est exactement celui des [éléments éditables](/guide/elements-editing) — le widget n'introduit
aucun nouveau chemin de saisie.

```tsx
import { createElement, TextField } from "@dopejs/pingo";

createElement(TextField, {
  value,
  revision,
  semanticLabel: "收件人",
  width: 320,
  error: value === "" ? "收件人不能为空" : undefined,
  onTransaction: (t) => apply(t),
});
```

### Props (TextField)

| Prop | Type | Valeur par défaut | Description |
| --- | --- | --- | --- |
| `value` | `string` | `""` | Texte contrôlé |
| `revision` | `number \| bigint` | `0n` | Revision faisant autorité de la valeur contrôlée |
| `controller` | `TextEditingController` | — | Controller local ; mutuellement exclusif avec `value`/`revision` |
| `readOnly` | `boolean` | — | Lecture seule |
| `password` | `boolean` | — | Mode mot de passe (le texte en clair n'entre ni dans le DisplayList ni dans la valeur d'accessibilité) |
| `maxGraphemes` | `number` | — | Limite de graphemes |
| `inputMode` | `EditableInputMode` | — | Indice de disposition du clavier logiciel |
| `width` | `number` | `240` | Largeur totale, bordure comprise |
| `height` | `number` | `lineHeight × rows + 16` | Hauteur totale, bordure comprise |
| `fontSize` | `number` | `14` | Taille de police |
| `lineHeight` | `number` | `round(fontSize × 1.5)` | Hauteur de ligne |
| `color` | `Color` | `#1f2329ff` | Couleur du texte |
| `backgroundColor` | `Color` | `#ffffffff` | Couleur de fond du champ |
| `borderColor` | `Color` | `#c0c4ccff` | Couleur de la bordure |
| `errorColor` | `Color` | `#d03050ff` | Couleur de la bordure et de l'explication en état d'erreur |
| `error` | `string` | — | Non vide = état d'erreur : bordure couleur erreur + explication sous le champ |
| `onTransaction` | `(t: EditTransaction) => void` | — | Callback des transactions d'édition du Core |
| `onSubmit` | `() => void` | — | Soumission par Entrée en monoligne |
| `semanticLabel` | `string` | — | Nom d'accessibilité (le rôle est toujours `textbox`) |

`TextArea` ajoute à cela un `rows` (`3` par défaut), utilisé pour calculer la hauteur par défaut.

## Pressable et Button

`Pressable` n'introduit aucune nouvelle sorte de nœud Scene : c'est simplement un `View` doté de la
sémantique `button`, qui prend automatiquement le focus à la pression et mappe le click/tap natif
sur `onPress`. Le style dépend entièrement de `style` et `children` ; à l'état `disabled`, l'opacité
est réduite et les événements retirés.

| Prop | Type | Valeur par défaut | Description |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | Contenu (`string \| number` pour Button, obligatoire) |
| `disabled` | `boolean` | `false` | État désactivé |
| `onPress` | `() => void` | — | Callback d'activation |
| `className` | `string` | — | Nom de classe (rattaché à une feuille de style) |
| `style` | `PingoStyle` | — | Style en ligne |
| `width` / `height` | `number` | — | Dimensions |
| `semanticLabel` | `string` | `Button` prend `children` | Nom d'accessibilité |

`Button` accepte en plus `color` et `fontSize` (transmis au texte interne).

## Frontière avec @dopejs/pingo-ui

Les deux couches répondent à des questions différentes :

- **widgets** — correction comportementale : transactions d'édition, focus, rôles sémantiques,
  décoration minimale. Aucune opinion de design ; couleurs et tailles de police sont toutes
  surchargeables.
- **@dopejs/pingo-ui** — système de design : des composants complets à la mentalité shadcn
  (variantes, tailles, thèmes, feuilles de style), qui composent en interne les widgets,
  `@dopejs/pingo-editing` et les hooks d'exécution, sans aucune modification du moteur.

Conseil de choix : pour un système de design prêt à l'emploi, utilisez directement les
[composants pingo-ui](/components) ; avec votre propre langage de design mais sans vouloir toucher
aux détails des transactions d'édition, prenez les widgets comme fondation ; pour du sur-mesure
complet (HUD de jeu, par exemple), utilisez directement les primitives des
[éléments de base](/guide/elements).

## Accessibilité

`TextField` / `TextArea` portent nativement le rôle `textbox`, et l'explication d'`error` le rôle
`alert` ; `Pressable` / `Button` portent le rôle `button`, et `disabled` est exposé via
`semanticValue`. Les noms reposent tous sur `semanticLabel` — ne l'omettez pas en l'absence de
label visible. Détails dans [Accessibilité](/guide/accessibility).
