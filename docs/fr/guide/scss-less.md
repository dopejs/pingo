---
title: SCSS / Less
description: Écrire des feuilles de style pingo en SCSS ou Less — pipeline de compilation à la construction, plugin Vite, limites de sécurité et diagnostics d'erreur.
---

# SCSS / Less

Le subset CSS de pingo (voir le [guide des styles](/guide/styling)) n'accepte à l'exécution que du
texte CSS ou un objet. Pour bénéficier de variables, mixins, `@use` / import et du confort
d'écriture associé, passez par la **compilation à la construction** : le SCSS/Less est compilé en
CSS côté Node par `@dopejs/pingo-style-preprocess`, puis validé par le `compileStyleSheet`
existant, pour produire un module JavaScript dont l'export par défaut est un `PingoStyleSheet`.

**Sass et Less n'entrent ni dans le bundle navigateur, ni dans la facade, ni dans le Core** — il
n'y a aucun préprocesseur à l'exécution, seulement le léger compilateur CSS qui existait déjà. Les
limites du subset ne s'élargissent pas pour autant : sélecteurs descendants, `@media`, `var()`,
`calc()`, `em/rem/vw/vh` et autres restent rejetés par les diagnostics existants — la construction
échoue au lieu de les laisser passer silencieusement.

## Deux sémantiques d'import à ne pas confondre

### Styles DOM ordinaires (Vite natif)

```ts
import "./site.scss";
import "./probe.less";
```

Ce chemin relève de la capacité de prétraitement CSS intégrée à Vite, qui produit du **CSS DOM**,
injecté ou extrait par Vite. Il ne convient qu'aux pages DOM comme le site de documentation ou une
coquille Storybook ; il **ne produit pas de `PingoStyleSheet`** et ne doit pas être utilisé pour le
style à l'intérieur du canvas.

### Feuilles de style pingo (`?pingo-style`)

```ts
import { createHostedCanvasRoot } from "@dopejs/pingo";
import buttonSheet from "./button.scss?pingo-style";
import themeSheet from "./theme.less?pingo-style";

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [buttonSheet, themeSheet],
});
```

`?pingo-style` est une frontière de type explicite : à la construction, le fichier est d'abord
prétraité puis validé contre le subset CSS ; le module ESM généré exporte par défaut un
`PingoStyleSheet` et **n'injecte aucun CSS dans le DOM**.

## Plugin Vite

Installez le paquet d'outillage Node-only (Node >= 22.12, Vite ^8 requis) :

```sh
pnpm add -D @dopejs/pingo-style-preprocess
```

Enregistrez-le dans `vite.config.ts` :

```ts
import { pingoStylePreprocess } from "@dopejs/pingo-style-preprocess/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    pingoStylePreprocess({
      // facultatif : load paths Sass / paths Less supplémentaires
      scssLoadPaths: ["styles"],
      lessPaths: ["styles"],
      // facultatif : les dépendances doivent rester dans ces répertoires
      // (par défaut : répertoire de l'entry + load paths)
      allowRoots: ["src", "styles"],
    }),
  ],
});
```

Les déclarations de types sont fournies par l'entrée `./client` du paquet ; une seule référence
dans `tsconfig.json` suffit :

```json
{
  "compilerOptions": {
    "types": ["@dopejs/pingo-style-preprocess/client"]
  }
}
```

Comportements du plugin :

- Ne correspond qu'au query flag exact `pingo-style` combiné aux extensions `.scss` / `.less` ;
  les autres fichiers ne sont pas affectés.
- Isole la pipeline CSS native de Vite via un virtual module — pas de double prétraitement ni
  d'injection de CSS DOM.
- L'entry et tous les partials/imports entrent dans le watch graph — **modifier un token ou une
  mixin déclenche le HMR et la reconstruction de production**, sans purge manuelle du cache.
- Tout diagnostic de niveau error fait échouer la construction ; les warnings sont émis avec leur
  position source. En cas d'échec de compilation pendant le HMR, le dernier module validé est
  conservé et l'erreur est signalée dans le dev server.
- Le module généré vérifie `CSS_SUBSET_VERSION` à l'initialisation : si la facade d'exécution et la
  validation à la construction utilisent des versions du subset différentes, le chargement du
  module lève une erreur au lieu de laisser deux sémantiques cohabiter.
- Les environnements dev, production et SSR produisent des feuilles de style à sémantique
  identique.

## API de compilation Node

Les systèmes de construction hors Vite (CLI, codegen) peuvent utiliser directement l'API Node :

```ts
import {
  compileLessString,
  compilePingoStyleFile,
  compileScssString,
  createStyleSheetFromLess,
  createStyleSheetFromScss,
} from "@dopejs/pingo-style-preprocess";
```

- `compileScssString(source, options)` : synchrone, donc **ne traite que du code sans import** ;
  avec des imports, renvoie le diagnostic `file-api-required`.
- `compileLessString(source, options)` : asynchrone (le `render` de Less est une Promise) ; les
  imports relatifs ne sont résolus que si `sourceName` est un chemin absolu.
- `compilePingoStyleFile(filename, options)` : API fichier asynchrone, celle qu'utilise le plugin
  Vite — base de résolution relative explicite et graphe de dépendances complet.
- La famille `compile*` **ne lève pas d'exception** sur les erreurs d'auteur : elle renvoie
  `styleSheet: null` et des diagnostics triés de façon stable ; `createStyleSheetFromScss` /
  `createStyleSheetFromLess` sont des enveloppes pratiques qui lèvent une exception — toute erreur
  d'auteur lève `StylePreprocessError` en conservant tous les diagnostics.

Le `StylePreprocessResult` renvoyé contient `cssText`, `styleSheet`, `diagnostics` et
`dependencies` (liste complète des fichiers dépendants, utilisable pour un watch maison).

## Source maps et diagnostics d'erreur

Chaque diagnostic porte un marqueur d'étape :

| `stage`       | Origine                                                                  |
| ------------- | ------------------------------------------------------------------------ |
| `"scss"`      | Exception de compilation Sass (erreur de syntaxe, variable non définie…) |
| `"less"`      | Rejection de compilation Less                                            |
| `"pingo-css"` | Diagnostic `compileStyleSheet` quand le produit dépasse le subset CSS    |

Les deux compilateurs activent les source maps, et la position générée d'un diagnostic pingo CSS
est **mappée au mieux vers le fichier SCSS/Less d'origine, ligne et colonne comprises**
(`sourceLocation`) ; quand le mapping est impossible, la position générée (`generatedLocation`)
et le nom de l'entry sont conservés — aucune position d'origine n'est fabriquée. Les diagnostics
sont triés de façon stable par position générée puis par code, pour une sortie CI et des snapshots
reproductibles.

## Limites de sécurité

Le préprocesseur exécute du code d'auteur à la construction, donc les réglages par défaut sont
resserrés :

- **Sass** : pas de custom importer, de custom function ni de Node package importer ; seules les
  dépendances `file:` sont acceptées.
- **Less** : `javascriptEnabled: false` fixé, aucun plugin, pré-scan qui refuse `@plugin` ; imports
  HTTP(S) ou relatifs à un protocole interdits.
- **Limites communes** : après canonicalisation, les dépendances doivent rester dans les allow
  roots (répertoire de l'entry + load paths explicites) ; évasion par symlink, dépendances non
  fichier et dépendances distantes sont systématiquement refusées. Le CSS compilé passe d'abord
  une limite de 1 048 576 code units avant la validation du subset ; l'entry, le nombre de
  dépendances et leur taille totale en octets ont des budgets explicites, dont le dépassement
  produit des erreurs de construction stables.
- Les versions des compilateurs sont figées par le lockfile, et le CSS, les diagnostics et la
  liste des dépendances des fixtures font l'objet de snapshots de reproductibilité ; toute montée
  de version de Sass/Less exige une revue explicite des différences de sortie.

Ces limites ne contraignent que la chaîne d'outillage `?pingo-style` ; les `.scss` / `.less`
destinés au DOM ordinaire suivent la propre configuration de Vite.

## Fonctions de couleur

Les préprocesseurs émettent souvent des fonctions de couleur ; le subset prend donc en charge
`rgb()` / `rgba()` / `hsl()` / `hsla()` (formes legacy à virgules comme modernes à espaces/slash),
normalisées en RGBA 8 bits. Toute sortie au-delà de cet ensemble — `color(display-p3 ...)`,
propriétés personnalisées CSS, `calc()` — continue de faire échouer la construction.
