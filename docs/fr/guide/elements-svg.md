---
title: "Graphiques vectoriels : Path et SVG"
description: Contours vectoriels Path et subset de documents SVG — syntaxe d, mise à l'échelle viewBox, contour et icônes en currentColor.
---

# Graphiques vectoriels : Path et SVG

Les graphiques vectoriels sont une capacité de premier ordre du rendu moteur dans pingo : les
chemins existent comme ressources immuables côté Core, et dessiner 50 fois la même icône ne
duplique pas la géométrie. Deux points d'entrée : `Path` accepte directement une donnée de path
SVG ; `Svg` accepte un document entier analysé par `createSvg` / `loadSvg`. L'aperçu ci-dessous
est rendu en direct par le moteur, et la couleur des icônes suit le thème du site.

:::preview elements-svg-icon
:::

## Path : un contour unique

```tsx
import { createElement, Path, View } from "@dopejs/pingo";

createElement(View, {
  style: { color: "#3157dfff" }, // le contour est peint dans la color du nœud et hérite comme le texte
  children: createElement(Path, {
    d: "M20 6 9 17l-5-5",
    viewBox: [0, 0, 24, 24],
    width: 24,
    height: 24,
    strokeWidth: 2,
  }),
});
```

- `d` prend en charge la syntaxe complète des paths SVG (`M L H V C S Q T A Z` et leurs formes
  relatives en minuscules) ; les arcs `A` sont convertis en Bézier cubiques à l'analyse, le Core
  n'a pas besoin d'un type de courbe dédié.
- `viewBox` est la boîte dans l'espace auteur, mise à l'échelle dans la boîte du nœud au moment du
  dessin — la même ressource s'utilise directement dans un nœud de 16 px comme de 48 px, sans
  conversion côté appelant.
- Sans `strokeWidth`, le contour est rempli ; avec une valeur non nulle, il est tracé à cette
  largeur (cap/join round).
- `geometryTransform` est cuit dans les points de la géométrie avant l'encodage (dans un document
  SVG, la transformation d'un groupe déplace la figure, pas la boîte qui la contient) — ce n'est
  pas la même chose que le `transform` visuel du nœud.

:::preview elements-path
:::

## Svg : subset de document

`createSvg(markup)` utilise un analyseur écrit à la main plutôt que `DOMParser` — le moteur doit
produire une géométrie strictement identique dans le navigateur, le Worker et les tests
différentiels headless, or `DOMParser` n'existe pas dans un Worker. Le subset correspond à ce que
les jeux d'icônes contiennent réellement :

- Éléments de forme : `path` `circle` `ellipse` `rect` `line` `polyline` `polygon` ;
- Éléments de structure : `svg` `g` `title` `desc` `defs` `metadata` ;
- Attributs : `fill` `stroke` `stroke-width` `fill-rule` `transform`
  (`translate`/`scale`/`rotate`/`matrix` ; skew n'est pas dans le subset).

Les éléments hors subset sont **rejetés par nom** avec une `PingoSvgError` — l'appelant sait
exactement ce qui a été perdu au lieu de se retrouver face à une boîte vide. Les couleurs CSS
nommées sont rejetées de la même façon : une demi-table de couleurs rendrait une partie des
documents correcte et ferait silencieusement virer l'autre au noir. Les couleurs hexadécimales,
`none`, `transparent` et `currentColor` sont dans le subset ; `currentColor` se résout en
« hériter de la couleur du nœud », ce qui permet à une icône de changer de couleur avec le thème,
comme du texte (c'est l'approche de l'aperçu).

Le composant `Svg` déploie le document en **un nœud path par forme**, empilées en positionnement
absolu ; une forme à la fois remplie et tracée devient deux nœuds — remplissage et contour sont
deux paints, pas les deux moitiés d'un même nœud.

```ts
import { createSvg, loadSvg, Svg } from "@dopejs/pingo";

const icon = createSvg(`<svg viewBox="0 0 24 24" stroke="currentColor" …>…</svg>`);
createElement(Svg, { source: icon, width: 24, height: 24, style: { color: "#3157df" } });

const remote = await loadSvg("/assets/logo.svg");
```

Pour un accès programmatique, `PingoSvg.shapes` donne pour chaque forme son `d`, son `transform`,
son remplissage/contour et sa `fillRule` ; `shapeData(name, attributes)` convertit un élément de
forme individuel en donnée de path équivalente.

## Props (Path)

| Prop | Type | Valeur par défaut | Description |
| --- | --- | --- | --- |
| `d` | `string` | — | Donnée de path SVG (obligatoire, syntaxe de path uniquement, pas un document) |
| `viewBox` | `readonly [number, number, number, number]` | — | Boîte de l'espace auteur, mise à l'échelle dans la boîte du nœud |
| `strokeWidth` | `number` | — | Non nul : trace le contour au lieu de remplir |
| `fillRule` | `"nonzero" \| "evenodd"` | `"nonzero"` | Règle de remplissage |
| `geometryTransform` | `readonly [number, number, number, number, number, number]` | Matrice identité | Transformation cuite dans la géométrie avant l'encodage |

## Props (Svg)

| Prop | Type | Valeur par défaut | Description |
| --- | --- | --- | --- |
| `source` | `PingoSvg` | — | Document analysé par `createSvg` / `loadSvg` (obligatoire) |

Les deux héritent des [CommonProps](/api) (`width`/`height`, événements, props sémantiques, etc.).

## Accessibilité

Un graphique vectoriel n'a pas de sémantique en soi. Une icône décorative n'a pas besoin
d'annotation ; pour un bouton icône cliquable, donnez-lui `semanticRole: "button"` et un
`semanticLabel` — détails dans [Accessibilité](/guide/accessibility).
