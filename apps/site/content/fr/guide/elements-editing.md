---
title: "Éléments éditables : Input et TextArea"
description: Primitives de texte éditable natives du moteur — contrat de transactions à revision contrôlée, pont de saisie EditContext, mot de passe et lecture seule.
---

# Éléments éditables : Input et TextArea

`Input` et `TextArea` (exporté depuis `@dopejs/pingo` sous le nom `UnstyledTextArea`, voir plus
bas) sont des primitives de texte éditable natives du moteur : caret, sélection, composition IME,
presse-papiers et annulation/rétablissement sont implémentés par le Core, **sans poser le moindre
contrôle de saisie HTML au-dessus du canvas**. L'aperçu ci-dessous accepte réellement la saisie —
cliquez pour donner le focus, essayez une méthode de saisie chinoise, la sélection par glissement
et Ctrl+Z.

:::preview elements-input
:::

## Utilisation

Écriture contrôlée : `value` + une `revision` strictement croissante, en confirmant dans
`onTransaction` les transactions envoyées par le Core :

```tsx
import { Input, type EditTransaction } from "@dopejs/pingo";

let value = "订单备注";
let revision = 1n;

function applyDelta(current: string, transaction: EditTransaction): string {
  const delta = transaction.delta;
  return delta === undefined
    ? current
    : current.slice(0, delta.range.start) + delta.text + current.slice(delta.range.end);
}

<Input
  value={value}
  revision={revision}
  semanticLabel="订单备注"
  onTransaction={(transaction) => {
    value = applyDelta(value, transaction);
    revision = transaction.revision;
  }}
/>;
```

Pour un état purement local, vous pouvez omettre `value` / `revision` et utiliser un
`TextEditingController` (avec des hooks, `useTextEditingController`) ; `controller` et
`value`/`revision` sont mutuellement exclusifs.

## Contrat de transactions à revision

La propriété de l'état est explicite : **le Shell possède les données métier, le Core possède
l'état transitoire de la session d'édition active.**

1. L'entrée arrive dans le Core, qui vérifie que `base_revision` correspond à la session courante ;
2. En cas de succès, elle est **appliquée et redessinée immédiatement** — chaque frappe n'a pas
   besoin de traverser toute la pipeline de rendu ;
3. Le Core émet en retour une `EditTransaction` versionnée ;
4. Le Shell confirme (met à jour son `value` / `revision`), ou, en cas d'échec de validation
   métier, envoie une valeur corrigée avec une nouvelle `revision`. Une revision périmée
   n'écrase jamais une saisie Core plus récente ; une confirmation à revision identique ne vide
   pas la pile d'annulation.

Champs d'`EditTransaction` :

| Champ          | Type                                                        | Description                                                                                                                  |
| -------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `nodeId`       | `number`                                                    | Nœud d'édition à l'origine de la transaction                                                                                 |
| `baseRevision` | `bigint`                                                    | Revision sur laquelle la transaction se fonde                                                                                |
| `revision`     | `bigint`                                                    | Nouvelle revision après la transaction                                                                                       |
| `delta`        | `{ range: { start, end }, text }`                           | Différence de texte ; décalages en UTF-16, alignés sur EditContext/InputEvent. Absent pour une transaction de pure sélection |
| `selection`    | `{ anchor, focus, anchorAffinity, focusAffinity }`          | Sélection après la transaction                                                                                               |
| `composition`  | `{ start, end }`                                            | Intervalle de composition IME en cours                                                                                       |
| `kind`         | `"edit" \| "composition" \| "external" \| "undo" \| "redo"` | Catégorie de transaction                                                                                                     |

## Pont de saisie : EditContext et proxy de repli

Le thread principal se connecte aux services de saisie du système par ordre de priorité :

1. **EditContext** — lié au canvas, reçoit texte/sélection/composition et rapporte à la méthode de
   saisie le contrôle, la sélection et les limites de caractères, ce qui permet à la fenêtre de
   candidats de rester collée au caret.
2. **Proxy de saisie hébergé par le moteur** — quand EditContext est indisponible, l'hôte entretient
   **un** `textarea` global masqué qui traite `beforeinput`, la composition, le clavier logiciel et
   le presse-papiers.

C'est une implémentation de repli de plateforme, pas un modèle de composants EmbedDOM : il n'existe
dans le Scene aucun DOM en correspondance un-à-un avec chaque nœud d'édition. Les deux chemins
passent la même suite de tests de contrat du comportement d'édition.

## Multiligne : la primitive TextArea

La primitive `TextArea` partage le même sous-système `editableText` qu'`Input` ; la seule
différence est que l'invariant `multiline` est fixé par le composant. Entrée insère un saut de
ligne sans déclencher `onSubmit` ; les flèches haut/bas conservent la colonne souhaitée
(desired-x) lors des déplacements entre lignes.

:::preview elements-textarea
:::

## Props (Input / UnstyledTextArea)

Les deux partagent `EditableTextProps` (`multiline` n'est pas exposé, il est fixé par le
composant) :

| Prop            | Type                           | Valeur par défaut | Description                                                                                                     |
| --------------- | ------------------------------ | ----------------- | --------------------------------------------------------------------------------------------------------------- |
| `value`         | `string`                       | —                 | Texte contrôlé                                                                                                  |
| `revision`      | `number \| bigint`             | —                 | Revision faisant autorité de la valeur contrôlée ; une valeur périmée n'écrase pas une saisie Core plus récente |
| `controller`    | `TextEditingController`        | —                 | Controller local stable ; mutuellement exclusif avec `value`/`revision`                                         |
| `readOnly`      | `boolean`                      | `false`           | Lecture seule                                                                                                   |
| `password`      | `boolean`                      | `false`           | Mode mot de passe (voir plus bas)                                                                               |
| `maxGraphemes`  | `number`                       | —                 | Limite de graphemes                                                                                             |
| `inputMode`     | `EditableInputMode`            | `"text"`          | Indice de clavier logiciel : `decimal` `email` `none` `numeric` `search` `tel` `text` `url`                     |
| `onTransaction` | `(t: EditTransaction) => void` | —                 | Callback des transactions d'édition du Core                                                                     |
| `onSubmit`      | `() => void`                   | —                 | Soumission par Entrée en monoligne ; en multiligne, Entrée reste dédiée au saut de ligne                        |

L'apparence du texte hérite de `TextProps` : `color`, `fontSize`, `fontWeight`, `lineHeight`,
`fontFamily`, `font` ; dimensions, `padding`, `backgroundColor`, bordures (canal `style`), etc.
viennent des [CommonProps](/api).

## Accessibilité et confidentialité

- Un nœud d'édition porte nativement la sémantique `textbox` ; fournissez un nom via
  `semanticLabel` (particulièrement important en l'absence de label visible).
- Le contenu d'un mot de passe n'est dessiné dans le Core qu'avec des glyphes masqués : le texte en
  clair n'entre ni dans le DisplayList, ni dans l'enregistrement-rejeu, ni dans les devtools, ni
  dans la valeur d'accessibilité, et une cible de mot de passe n'écrit jamais dans le
  presse-papiers.

Pour la conception approfondie (modèle de positions de texte, limites bidi, matrice de tests de
contrat), voir [Texte et édition](/guide/editing).
