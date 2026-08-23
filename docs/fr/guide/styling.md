---
title: Styles
description: Le subset CSS de pingo — sélecteurs de classe, cascade et spécificité, limites de l'héritage, ainsi que les conventions de thème et de surcharge de pingo-ui.
---

# Styles

Le style de pingo est un **subset CSS versionné** (actuellement 1.6.0) : le texte CSS est analysé
et calculé côté Shell, et le Core ne consomme que des valeurs typées normalisées — le texte CSS et
la correspondance de sélecteurs n'entrent jamais dans le Core. La table complète des propriétés
prises en charge figure dans [Prise en charge du subset CSS](/style-support) ; cette page couvre
l'usage et les limites.

## Créer et enregistrer une feuille de style

Compilez le texte CSS avec `createStyleSheet` (qui lève `StyleSheetCompileError` si l'entrée est
invalide), puis enregistrez-le à la création du root :

```ts
import { createElement, createHostedCanvasRoot, createStyleSheet } from "@dopejs/pingo";

const sheet = createStyleSheet(
  `
  .card {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 16px;
  }
  `,
  { sourceName: "app.css" },
);

const root = await createHostedCanvasRoot(canvas, { styleSheets: [sheet] });

root.render(
  createElement("container", {
    className: "card",
    width: 320,
    children: createElement("text", { value: "你好", fontSize: 14 }),
  }),
);
```

Si vous ne voulez pas gérer d'exceptions, utilisez `compileStyleSheet` : il ne lève rien sur une
entrée d'auteur et renvoie des diagnostics stables. La feuille de style peut aussi s'écrire sous
forme d'objet type-sûr (`PingoStyleSheetObject`) : les clés sont des sélecteurs de classe avec ou
sans point initial, les valeurs des `PingoStyle` :

```ts
const sheet = createStyleSheet({
  card: { backgroundColor: "#ffffffff", borderRadius: 8, padding: 16 },
  "card:hover": { backgroundColor: "#f5f5f5ff" },
});
```

Un élément reçoit ses classes via la prop `className` (plusieurs noms séparés par des espaces
ASCII) et des déclarations en ligne via la prop `style` (`PingoStyle`, analysée par le Shell avant
d'entrer dans le Core).

## Sélecteurs et cascade

Le subset ne prend en charge que les **sélecteurs de classe sur un même nœud**, plus quatre
pseudo-classes d'état interactif :

- Classe unique `.card` ; classes composées `.pui-card.pui-dark` (le nœud doit porter toutes les
  classes pour correspondre).
- États `:hover`, `:active`, `:focus`, `:focus-visible`, composables avec des classes, comme
  `.btn:hover`.

Non pris en charge : sélecteurs d'élément, combinateurs descendant/enfant et autres, `@media` /
`@supports` / `@keyframes`, `var()` / `calc()`. Seules les unités de longueur `px` et `%` existent
(`em` / `rem` / `vw` / `vh` sont rejetées) ; les couleurs s'écrivent en hex ou
`rgb()` / `rgba()` / `hsl()` / `hsla()` (les deux syntaxes, ancienne et nouvelle, sont acceptées),
et les mots-clés de couleur (comme `red`) ne sont pas pris en charge.

Les règles de cascade sont isomorphes à celles du CSS mais plus simples :

1. **Spécificité = nombre de classes + nombre d'états**. `.pui-card.pui-dark` (2) bat `.card` (1).
2. **À spécificité égale, l'ordre des sources décide** : la feuille enregistrée plus tard, et dans
   une même feuille la règle placée plus bas, l'emporte.
3. **La prop `style` en ligne bat toutes les règles de feuille de style** ; les props directes de
   l'élément (comme `width`, `backgroundColor`) ont la priorité maximale et battent `style`.

Attention au corollaire du point 2 : ce qui fait qu'une surcharge s'applique, c'est **l'ordre
d'enregistrement des feuilles de style**, sans rapport avec l'ordre des noms de classe dans la
chaîne `className`.

## Héritage et limites du style calculé

Seules quelques propriétés héritent : `color`, `visibility`, `font-family` / `font-size` /
`font-weight` / `font-style`, `line-height`, `text-align`, `white-space`, `overflow-wrap`,
`pointer-events`, `cursor`. Toutes les autres (y compris toutes les propriétés de mise en page)
partent de leur valeur initiale sur chaque nœud — rien n'existe si vous ne l'écrivez pas ; il n'y a
pas de comportement du type « hériter de la largeur du parent ».

Chaque propriété déclare son domaine d'invalidation (mise en page / rendu / hit testing /
sémantique) dans le schéma à source unique. Modifier `opacity` ne déclenche pas de reflow,
modifier `width` si ; c'est le même mécanisme que le modèle d'invalidation de
l'[architecture](/guide/architecture).

### Propriétés restreintes dans les états interactifs

Une règle d'état (comme `.btn:hover`) n'accepte que des propriétés de rendu : `background-color`,
`color`, `opacity`, les `border-*-color` de chaque côté, `border-radius`, `box-shadow`,
`visibility`, `transform` / `transform-origin`, `pointer-events`, `cursor`. Écrire une propriété
de mise en page dans une règle d'état est refusé à la compilation — un changement d'état ne doit
pas déclencher de changement de mise en page.

## Écarts principaux avec le CSS

Le subset ne vise délibérément pas la compatibilité CSS complète. Écarts clés (liste complète dans
[Prise en charge du subset CSS](/style-support)) :

- Le bloc conteneur de `position: absolute` est le **nœud parent**, pas l'ancêtre positionné le
  plus proche ; il n'y a pas de `position: relative`, les décalages visuels passent par
  `transform`.
- Pas de `flex-wrap` : un conteneur flex reste sur une ligne, le débordement de l'axe principal
  est rogné ou défile.
- Un item flex n'a pas de taille minimale automatique et peut être comprimé jusqu'à 0 (équivalent
  à écrire `min-width: 0` dans un navigateur) ; `min-width: auto` / `min-height: auto` échouent
  directement à la compilation.
- Quand la taille de l'axe principal est indéterminée, un pourcentage se résout en `0` et non en
  `auto` comme en CSS.
- `box-shadow` ne prend en charge que les ombres externes, au plus 4 couches par nœud ; `inset`
  est rejeté.
- `z-index` ne fait qu'une réorganisation stable entre frères, sans stacking context.

## Conventions de thème et de surcharge de pingo-ui

L'habillage de la bibliothèque `@dopejs/pingo-ui` est une feuille de style compilée avec les
mécanismes ci-dessus :

```ts
import { createHostedCanvasRoot, createStyleSheet } from "@dopejs/pingo";
import { createPingoUiStyleSheet } from "@dopejs/pingo-ui";

const myOverrides = createStyleSheet(`
  .pui-button { border-radius: 4px; }
`);

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [createPingoUiStyleSheet(), myOverrides], // l'ordre ne doit pas être inversé
});
```

- **`createPingoUiStyleSheet()` crée pour chaque root une feuille immuable indépendante**.
- **La feuille utilisateur doit être enregistrée après la feuille pingo-ui** : à spécificité égale,
  l'ordre des sources décide et la règle écrite plus tard l'emporte. La prop `className` d'un
  composant s'ajoute après ses propres classes (par exemple `pui-input pui-input--disabled mine`),
  mais la possibilité de surcharger ne dépend que de l'ordre d'enregistrement ci-dessus.
- Pour augmenter la priorité d'une surcharge, utilisez une classe composée pour élever la
  spécificité (comme `.pui-button.mine`) au lieu de compter sur la position d'écriture.

### Thème clair et sombre

```ts
import { setTheme, useTheme } from "@dopejs/pingo-ui";

setTheme("dark"); // tous les composants abonnés se re-rendent automatiquement
useTheme();       // lecture et abonnement dans le render d'un composant
```

Le thème est un signal au niveau du module : `useTheme()` dans le render d'un composant crée
l'abonnement automatiquement, et `setTheme` déclenche le re-rendu de tous les composants abonnés.
Le mode sombre est réalisé par classe composée — sous le thème dark, les composants portent la
classe marqueur `pui-dark`, et les règles composées `.pui-x.pui-dark` de l'habillage correspondent
(comme `.pui-card.pui-dark`).

**La personnalisation de marque est une opération de construction** : créez un preset avec
`@use "@dopejs/pingo-ui/styles/tokens" with ($primary: ...)` pour surcharger les tokens, puis
recompilez l'habillage des composants via le plugin Vite de `@dopejs/pingo-style-preprocess` —
changer la couleur de marque = reconstruire, pas de bascule à l'exécution. Les couleurs des tokens
ne peuvent elles aussi s'écrire qu'en hex ou `rgb()` / `rgba()` / `hsl()` / `hsla()`. La pipeline
SCSS/Less est décrite dans le [guide SCSS / Less](/guide/scss-less).
