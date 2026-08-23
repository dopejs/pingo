---
title: "Éléments de base : View, Text et Image"
description: Conteneur View et mise en page flex, rendu de texte Text, bitmap Image et polices explicites PingoFont.
---

# Éléments de base : View, Text et Image

Les éléments hôtes de pingo correspondent directement à des nœuds du Scene, sans le coût d'une
cascade CSS ni d'une correspondance de sélecteurs (pour les capacités de style, voir
[Styles](/guide/styling)). Cette page couvre les trois éléments les plus fondamentaux : la boîte
générique `View`, le texte `Text` et le bitmap `Image`. L'aperçu ci-dessous est rendu en direct
par le moteur pingo et suit le thème clair/sombre du site.

:::preview elements-layout
:::

## View et la mise en page

`View` est la boîte de regroupement générique (correspondant à l'élément hôte `container`) et
n'introduit aucune nouvelle sorte de nœud Scene :

- `width` / `height` / `minWidth` / `maxWidth` / `padding` / `backgroundColor` / `opacity` /
  `transform` sont des props directes ; `padding` accepte un nombre ou un quadruplet
  `[haut, droite, bas, gauche]`.
- `flexDirection`, `justifyContent`, `alignItems`, les bordures et les rayons passent par le canal
  en ligne `style` (subset CSS typé, voir [Styles](/guide/styling)).
- L'espacement entre enfants s'exprime explicitement avec des conteneurs de taille fixe — c'est
  ainsi que sont implémentés les assistants `row` / `column` de l'aperçu.

## Utilisation

```tsx
import { createElement, Text, View } from "@dopejs/pingo";

root.render(
  createElement(View, {
    width: 420,
    padding: 16,
    backgroundColor: "#ffffffff",
    style: { flexDirection: "column", borderRadius: 10 },
    children: [
      createElement(Text, { value: "标题", fontSize: 24, lineHeight: 32, fontWeight: 700 }),
      createElement(View, { height: 8 }),
      createElement(Text, { value: "正文", fontSize: 14, lineHeight: 22 }),
    ],
  }),
);
```

## Text : suite de texte

Le shaping, les retours à la ligne et la mesure du texte sont entièrement réalisés par le Core —
le mélange chinois-anglais, les emoji et les caractères combinants ne demandent aucune
participation du Shell. Le contenu est fourni par `value` ou par des `children` de type chaîne.

:::preview elements-text
:::

### Props (Text)

| Prop | Type | Valeur par défaut | Description |
| --- | --- | --- | --- |
| `value` | `string` | — | Contenu texte (au choix avec `children`) |
| `children` | `string \| number` | — | Contenu texte |
| `color` | `Color` | `#000000ff` | Couleur du texte, héritable |
| `fontSize` | `number` | — | Taille de police (pixels logiques) |
| `lineHeight` | `number` | — | Hauteur de ligne (pixels logiques) |
| `fontWeight` | `number` | — | Graisse |
| `fontFamily` | `string` | — | Famille de polices CSS |
| `font` | `PingoFont` | — | Police explicite immuable ; une entrée non prise en charge fait tout basculer sur le repli |

`Text` hérite aussi de toutes les [CommonProps](/api) (dimensions, padding, événements,
`semanticRole` / `semanticLabel`, etc.).

## Image : bitmap

La `source` d'`Image` est une `PingoImage` — un **bitmap RGBA8 immuable** détenu côté Shell,
synchronisé en ligne comme ressource du Scene à la frontière de commit. Créez-la avec
`createImage`, qui copie et valide les pixels :

```ts
import { createImage, Image } from "@dopejs/pingo";

const icon = createImage(pixels, 96, 96, { label: "应用图标" });
createElement(Image, { source: icon, width: 48, height: 48 });
```

Sans `width` / `height`, le nœud prend la taille en pixels de l'image ; sinon l'image est mise à
l'échelle dans la boîte du nœud. `label` est le nom d'accessibilité ; laissez-le vide pour une
image décorative.

:::preview elements-image
:::

Le choix des pixels plutôt que des octets encodés est délibéré : la transaction de ressources
prend effet de façon synchrone à la frontière de commit, alors que tout format encodé exige un
décodage asynchrone. Ce chemin convient aux petites images comme les vignettes de listes ; les
grandes images doivent passer par le chemin encodé avec staging asynchrone.

## Polices : PingoFont et loadFont

La prop `font` de `Text` et des éléments éditables accepte une police SFNT explicite et immuable
(TTF/OTF/TTC), shapeée de façon déterministe par le Core. `createFont` reçoit des octets SFNT déjà
décodés ; `loadFont` gère en plus le chargement réseau et le décodage WOFF/WOFF2 :

```ts
import { loadFont } from "@dopejs/pingo";

const inter = await loadFont("/fonts/Inter-Regular.woff2", {
  fallbackFamily: "sans-serif",
});
createElement(Text, { value: "Hello", font: inter, fontSize: 16 });
```

`PingoFontOptions` : `faceIndex` (index de la face dans une collection TTC, `0` par défaut) et
`fallbackFamily` (famille CSS utilisée quand tout le chemin de police explicite bascule sur le
repli, `"sans-serif"` par défaut). Un échec de chargement lève une `PingoFontLoadError` dotée d'un
`code` stable (comme `fetch-failed`, `decode-failed`, `unsupported-format`).

## Accessibilité

`semanticRole` et `semanticLabel` sont des props communes à tous les éléments : titres, boutons et
régions doivent être annotés sémantiquement sur l'élément, et le nom d'une `Image` vient du
`label` de `createImage`. L'instantané sémantique est reflété en un arbre DOM fantôme à côté du
canvas — détails dans [Accessibilité](/guide/accessibility).
