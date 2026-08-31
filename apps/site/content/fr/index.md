---
layout: home

hero:
  name: Pingo
  text: moteur de rendu canvas
  tagline: Cœur Rust/WASM + enveloppe TypeScript + backends enfichables. Conçu pour les interactions hautes performances, le défilement virtuel natif et l’édition de texte dans le canvas, avec des composants de base, des styles CSS et une bibliothèque de composants UI alignée sur shadcn.
  image:
    light: /pingo-mark.svg
    dark: /pingo-mark-dark.svg
    alt: Pingo
  actions:
    - theme: brand
      text: Démarrage rapide
      link: /guide/getting-started
    - theme: alt
      text: Playground
      link: /playground
    - theme: alt
      text: GitHub
      link: https://github.com/dopejs/pingo

features:
  - title: Double horloge, pas de perte d’images même si le thread principal est bloqué
    details: L’horloge UI et l’horloge de rendu sont indépendantes. Le défilement, l’animation, la mise en page et la composition progressent en boucle fermée dans le Worker ; même si le thread principal est bloqué pendant 200 ms, l’image reste fluide.
  - title: Défilement virtuel natif
    details: Arbre de sommes préfixes, préchargement prédictif directionnel et reconstruction des espaces réservés sont intégrés au Core. Sur une fixture fixe d’un million de lignes, la relecture de 20 000 trames atteint des P95/P99 inférieurs à la microseconde, et le défilement en régime stable ne rappelle jamais le Shell.
  - title: Édition native dans le canvas
    details: Caret, sélection, sélection par glisser, sélection de mot par double-clic, composition IME, positionnement de la fenêtre de candidats, presse-papiers et annulation/rétablissement sont tous implémentés par le moteur. La logique métier n’a plus besoin de créer des contrôles HTML pour la saisie.
  - title: L’accessibilité fait partie de l’architecture
    details: Le Core exporte un arbre sémantique, que l’hôte reflète en arbre DOM fantôme à côté du canvas. Les lecteurs d’écran fonctionnent, et les tests E2E peuvent sélectionner les éléments par rôle/libellé au lieu de comparer des pixels.
  - title: Déterminisme et tests différentiels
    details: Flux binaires versionnés, horloge et source aléatoire injectables, enregistrement et relecture, ainsi que des oracles différentiels entre incrémental et complet, optimisé et naïf, wasm et natif.
  - title: Dégradation automatique, toujours un repli
    details: SharedArrayBuffer → postMessage → Canvas2D sur le thread principal est choisi automatiquement selon les capacités, avec une fonctionnalité équivalente. La couche de migration prend en charge le déploiement progressif par page et le retour arrière en un clic.
  - title: Composants de base prêts à l’emploi
    details: View/Text/Image, Input/TextArea, SVG/Path et d’autres éléments de niveau moteur correspondent directement aux nœuds de Scene ; la mise en forme du texte, la géométrie du caret et les capacités d’édition proviennent du Core, sans avoir à assembler des contrôles DOM.
  - title: Support CSS, SCSS et Less
    details: "Sous-ensemble CSS versionné analysé côté Shell : sélecteurs de classe, états d’interaction, héritage et styles calculés ont des limites claires ; SCSS/Less sont compilés et validés à la construction, les préprocesseurs n’entrent pas dans le bundle du navigateur."
  - title: Bibliothèque de composants UI alignée sur shadcn
    details: "L’API des composants et la sémantique de skin de @dopejs/pingo-ui sont alignées sur shadcn/ui — Button, Dialog, Table, Calendar, etc. sont tous rendus dans le canvas, avec prise en charge des thèmes clair/sombre et de la surcharge par feuilles de style."
---

## Prise en main en 30 secondes

```sh
pnpm add @dopejs/pingo
```

```ts
import { createHostedCanvasRoot, Text, View } from "@dopejs/pingo";

const root = await createHostedCanvasRoot(document.querySelector("canvas")!);

root.render(
  View({
    style: { width: 480, height: 640, overflowY: "auto" },
    virtual: {
      itemCount: 1_000_000,
      estimatedItemSize: 32,
      renderItem: (index) => Text({ value: `第 ${index} 行` }),
    },
  }),
);
```

Un million de lignes n’est jamais matérialisé côté Shell, et le défilement ne rappelle pas l’arbre de composants — le calcul de la fenêtre et la reconstruction des éléments se produisent dans le Core.

## Ce qu’il ne fait pas

Pingo est un moteur de rendu, pas un navigateur. Il **ne fait pas** le SSR/premier écran HTML, la compatibilité CSS générale (modèle de boîte, cascade, sélecteurs), les adaptateurs pour mini-programmes ou natifs, ni la sémantique de texte riche métier (collaboration, formules, commandes Markdown).

Le moteur **possède bien** le caret, la sélection, l’IME, le presse-papiers, l’annulation/rétablissement et les primitives de texte éditable — cela n’est pas renvoyé à la couche métier pour être assemblé avec des contrôles DOM.

Les performances sur appareils réels, les méthodes de saisie réelles, les lecteurs d’écran et la matrice de consommation multimédia relèvent de la collecte de qualification de plateforme, suivie séparément ; la navigation visuelle bidi et l’activation par défaut du backend WebGPU restent des [éléments différés documentés](https://github.com/dopejs/pingo/blob/main/docs/plan.md).
