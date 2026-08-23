---
layout: home

hero:
  name: Pingo
  text: moteur de rendu canvas
  tagline: Cœur Rust/WASM + couche TypeScript + backend interchangeable. Conçu pour l'interaction haute performance, le défilement virtuel natif et l'édition de texte dans le canvas, avec des éléments de base, des styles CSS et une bibliothèque de composants UI alignée sur shadcn.
  image:
    light: /pingo-mark.svg
    dark: /pingo-mark-dark.svg
    alt: Pingo
  actions:
    - theme: brand
      text: Démarrage
      link: /guide/getting-started
    - theme: alt
      text: Playground
      link: /playground
    - theme: alt
      text: GitHub
      link: https://github.com/dopejs/pingo

features:
  - title: Deux horloges — le thread principal se fige, l'image ne saute pas
    details: L'horloge de l'interface et l'horloge de rendu sont indépendantes. Défilement, animations, mise en page et composition avancent en boucle fermée dans le Worker ; l'affichage reste continu même quand le thread principal est bloqué 200 ms.
  - title: Défilement virtuel natif
    details: L'arbre de sommes préfixées, le préchauffage avec prédiction de direction et la reconstruction par substituts vivent dans le Core. Rejouer 20 000 images d'un fixture fixe d'un million de lignes donne des P95/P99 sous la microseconde, et le défilement en régime établi ne rappelle jamais le Shell.
  - title: Édition native dans le canvas
    details: Caret, sélection, sélection par glissement, sélection de mot au double-clic, composition IME, positionnement de la fenêtre de candidats, presse-papiers et annulation/rétablissement sont tous implémentés par le moteur. L'application ne crée plus de contrôles HTML pour saisir du texte.
  - title: L'accessibilité fait partie de l'architecture
    details: Le Core exporte un arbre sémantique, que l'hôte reflète en un arbre DOM fantôme à côté du canvas. Les lecteurs d'écran fonctionnent, et les tests E2E ciblent les éléments par role/label au lieu de comparer des pixels.
  - title: Déterminisme et tests différentiels
    details: Flux binaires versionnés, horloges et sources aléatoires injectables, enregistrement-rejeu, et oracle différentiel entre incrémental et complet, optimisé et naïf, wasm et natif.
  - title: Repli automatique, toujours une issue de secours
    details: SharedArrayBuffer → postMessage → Canvas2D sur le thread principal, choisi automatiquement selon les capacités, avec équivalence fonctionnelle. La couche de migration permet un déploiement progressif par page et un retour arrière en un clic.
  - title: Éléments de base prêts à l'emploi
    details: Les éléments moteur View/Text/Image, Input/TextArea, SVG/Path correspondent directement à des nœuds du Scene ; le shaping du texte, la géométrie du caret et l'édition viennent du Core, sans assemblage de contrôles DOM.
  - title: Prise en charge du CSS et de SCSS/Less
    details: "Un subset CSS versionné, analysé côté Shell : sélecteurs de classe, états interactifs, héritage et style calculé ont des limites explicites ; SCSS/Less sont compilés et validés à la construction, le préprocesseur n'entre jamais dans le bundle navigateur."
  - title: Bibliothèque de composants UI alignée sur shadcn
    details: "@dopejs/pingo-ui aligne l'API de ses composants et la sémantique des habillages sur shadcn/ui — Button, Dialog, Table, Calendar et les autres sont tous rendus dans le canvas, avec thèmes clair/sombre et surcharge par feuilles de style."
---

## Prise en main en 30 secondes

```sh
pnpm add @dopejs/pingo
```

```ts
import { createElement, createHostedCanvasRoot } from "@dopejs/pingo";

const root = await createHostedCanvasRoot(document.querySelector("canvas")!);

root.render(
  createElement("virtualList", {
    width: 480,
    height: 640,
    itemCount: 1_000_000,
    estimatedItemHeight: 32,
    renderItem: (index) => createElement("text", { value: `第 ${index} 行` }),
  }),
);
```

Un million de lignes ne sont jamais matérialisées côté Shell, et le défilement ne rappelle pas
l'arbre de composants — le calcul de la fenêtre et la reconstruction ont lieu dans le Core.

## Ce qu'il ne fait pas

Pingo est un moteur de rendu, pas un navigateur. **Pas de** SSR/premier rendu HTML, pas de
compatibilité CSS générale (modèle de boîte, cascade, sélecteurs), pas de couche d'adaptation
mini-programme ou native, ni de sémantique de texte riche métier (collaboration, formules,
commandes Markdown).

Le moteur **possède bel et bien** caret, sélection, IME, presse-papiers, annulation/rétablissement
et primitives de texte éditable — tout cela ne sera jamais repoussé vers la couche métier pour être
bricolé avec des contrôles DOM.

## État actuel

Tous les jalons d'ingénierie P0–M8 sont terminés ; M9 « qualification production, composition
incrémentale et durcissement de publication » est planifié mais pas encore implémenté — voir le
[plan M9](/m9-production-plan). Les changements du dépôt restent dans Unreleased : aucune nouvelle
version npm n'a été publiée.

Les performances sur appareils réels, les vraies méthodes de saisie, les lecteurs d'écran et la
matrice de consommation multimédia relèvent de la qualification de plateforme et sont suivis
séparément ; la navigation visuelle bidi et l'activation par défaut du backend WebGPU restent des
[reports documentés](/plan).
