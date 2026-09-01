---
title: Typography
description: Composants typographiques pour les titres, le texte et les citations, rendus sur le canvas pingo.
---

# Typography

Un ensemble typographique : les titres `H1`–`H4`, le paragraphe `P`, ainsi que `Lead`,
`Large`, `Small`, `Muted`, `Blockquote` et `InlineCode`. L'aperçu ci-dessous est rendu en
temps réel par le moteur pingo et suit le thème clair/sombre du site.

:::preview typography-scale
:::

## Utilisation

```tsx
import { H1, Lead, P } from "@dopejs/pingo-ui";

root.render(
  <View style={{ flexDirection: "column" }}>
    <H1>Moteur de rendu</H1>
    <Lead>Écrivez du TSX sur un canvas, sans produire de DOM.</Lead>
    <P>Un paragraphe de texte.</P>
  </View>,
);
```

::: warning Ce ne sont pas des conteneurs englobants
La typographie de shadcn stylise de vrais éléments `h1`/`p` et laisse la cascade porter la
taille de police dans tout le sous-arbre. Dans pingo, les métriques de texte **sont
résolues par nœud et ne s'héritent pas** : envelopper du texte dans `H1` ne l'agrandit pas.
Chaque composant est un nœud de texte et `children` n'accepte qu'une chaîne.
:::

## Exemples

### Titres et texte

`H1`–`H4` correspondent aux quatre tailles de titre de shadcn ; `P` est le paragraphe
16px/24px. L'aperçu ci-dessus les présente dans l'ordre.

### Citation et code en ligne

`Blockquote` est une boîte avec un filet à gauche, `InlineCode` un fragment sur fond. Les
deux sont en deux couches — la boîte porte la bordure et le remplissage, le nœud de texte
porte la taille et la graisse — pour la raison indiquée ci-dessus.

:::preview typography-blocks
:::

### Séparer le niveau annoncé du palier visuel

`H1` est signalé au niveau 1 par défaut. Quand le plan de la page impose de commencer au
niveau 2 mais que vous voulez visuellement la taille de `H1`, utilisez `level` :

```tsx
<H1 level={2}>Visuellement H1, niveau 2 dans le plan</H1>
```

## Props

### Titres (`H1` / `H2` / `H3` / `H4`)

| Prop        | Type                         | Par défaut             | Description                           |
| ----------- | ---------------------------- | ---------------------- | ------------------------------------- |
| `children`  | `string`                     | —                      | Texte du titre (obligatoire)          |
| `level`     | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | le palier du composant | Remplace le niveau annoncé            |
| `className` | `string`                     | —                      | Ajouté après les classes du composant |

### Les autres

`P`, `Lead`, `Large`, `Small`, `Muted`, `Blockquote` et `InlineCode` n'acceptent que
`children: string` et `className`.

| Composant    | Taille / interligne | Usage                        |
| ------------ | ------------------- | ---------------------------- |
| `P`          | 16 / 24             | Paragraphe de texte          |
| `Lead`       | 20 / 28             | Chapeau, couleur atténuée    |
| `Large`      | 18 / 28             | Texte accentué d'un palier   |
| `Small`      | 14 / 20             | Texte secondaire             |
| `Muted`      | 14 / 20             | Texte d'appoint atténué      |
| `Blockquote` | 16 / 24             | Citation avec filet à gauche |
| `InlineCode` | 14 / 20             | Code en ligne sur fond       |

## Accessibilité

`H1`–`H4` portent la sémantique `heading` et exportent `aria-level`. **Un titre sans niveau
est annoncé au niveau 2 par la plupart des lecteurs d'écran**, si bien qu'un H1 et un H4
sonneraient pareil : le niveau fait partie de ces composants, ce n'est pas une option.

Les autres sont du texte pur, sans rôle : le corps de texte ne doit pas faire s'arrêter un
lecteur d'écran à chaque paragraphe. Si vous devez leur donner du sens, placez-les dans un
conteneur portant `semanticRole` plutôt que d'ajouter un rôle au paragraphe.
