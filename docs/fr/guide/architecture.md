# Aperçu de l'architecture

## Propriété des deux côtés

```
TSX / hooks          →   Flux de mutations  →   Scène / Disposition / Peinture
（Coquille TypeScript）      binaire, par lots      （Cœur Rust, wasm）
                                                    ↓
Relecteur Canvas2D   ←   DisplayList        ←    Picture
```

**La coquille possède l'arbre de composants, le cœur possède la scène. Ils ne partagent aucun objet mutable.**
Toutes les communications transfrontalières sont des flux binaires versionnés : petit-boutiste, alignés sur quatre octets, sous forme d'instructions. Le récepteur effectue la validation de l'opcode, de la longueur, de l'alignement, de l'ID et les vérifications arithmétiques avant d'accéder à la mémoire ; les entrées malformées sont rejetées de manière atomique plutôt que partiellement appliquées.

Cette frontière n'est pas une optimisation de performance, mais une frontière de correction : même si les octets proviennent généralement de l'encodeur de ce projet, le décodeur traite les données comme non fiables et dispose d'une couverture par fuzzing.

## Double horloge

L'horloge de l'interface utilisateur (thread principal) et l'horloge de rendu (Worker) sont indépendantes l'une de l'autre :

- Le thread principal collecte les entrées, parcourt l'arbre de composants et soumet des trames de mutations.
- Le Worker pilote la physique du défilement, les animations, la disposition et la composition.

**L'état stationnaire du défilement n'appelle pas la coquille.** Les données manquantes sont rendues avec des espaces réservés, puis reconstruites dans les trames suivantes. Par conséquent, lorsque le thread principal est bloqué pendant 200 ms par du code métier, le défilement et les animations restent continus — ce scénario est protégé par des tests d'injection de pannes automatiques.

## Chaîne de repli

La détection de capacités sélectionne le chemin de transport dans l'ordre, avec trois niveaux fonctionnellement équivalents :

1. **SharedArrayBuffer** — nécessite l'isolation cross-origin (COOP/COEP)
2. **postMessage** — en l'absence de SAB
3. **Canvas2D sur thread principal** — en l'absence de Worker / OffscreenCanvas

```ts
const root = await createHostedCanvasRoot(canvas, {
  transport: { preference: "sab" }, // Préférence facultative, repli automatique si non satisfaite
});
console.log(root.mode); // "sab" | "post-message" | "main-thread"
```

Le [Playground](/playground) de ce site en est un exemple vivant : GitHub Pages ne peut pas envoyer les en-têtes de réponse COOP/COEP, donc la version en ligne fonctionne sur le chemin postMessage, et le marqueur de transport en haut de page l'affiche fidèlement.

## Modèle d'invalidation

**La sémantique des props détermine le domaine d'invalidation**, l'appelant ne marque pas manuellement les éléments comme sales, et il n'existe pas d'échappatoire `forceUpdate`.

Chaque propriété est déclarée dans un schéma source unique indiquant si elle affecte la disposition, la peinture, le test de collision ou la sémantique. Modifier une `opacity` ne déclenche pas de redisposition ; modifier `width` le fait. Les bitmaps de saleté sont maintenus par domaine, et `onFrame` expose le nombre de nœuds sales dans chaque domaine.

Ce choix repose sur une « invalidation la plus étroite possible + tests de propriétés en filet de sécurité » : le résultat du rendu incrémental doit être identique pixel par pixel au rendu complet, et les tests différentiels convergent les contre-exemples vers le cas d'échec minimal.

## Représentation de la scène

La scène dans le cœur est en SoA (structure de tableaux plutôt que tableau de structures) :

- Les ID de nœuds contiennent une **génération**, la réutilisation des emplacements ne réactive pas les ID périmés.
- Après le commit, l'**ordre topologique** est maintenu : les nœuds parents précèdent toujours les nœuds enfants.
- Les modifications structurelles sont compactées une fois par commit, et non une fois par mutation.
- Les résultats de disposition sont comparés par lots avec des SoA à double tampon ; aucun closure par nœud ni allocation d'écouteur sur le chemin critique.

## Backend enfichable

Le cœur produit une DisplayList binaire aplatie, le backend n'est qu'un relecteur. Le backend Canvas2D est une boucle sur tableaux typés à allocation parcimonieuse — **appeler wasm→JS à chaque dessin n'est pas un chemin de rendu acceptable**.

La même DisplayList est également transmise à un prototype wgpu isolé, et les sorties des deux font l'objet d'une comparaison différentielle pixel par pixel.
L'adoption de WebGPU est une décision fondée sur les données, voir [ADR-0006](/adr/0006-webgpu-backend-decision).

## Déterminisme

Le temps, les sources aléatoires et les flux d'entrée sont injectables ou rejouables ; la sortie du cœur ne dépend pas de l'ordre d'ordonnancement des threads.
L'archive `DOPR` enregistre les flux de mutations et d'entrées dans l'ordre d'origine, et peut être rejouée de manière déterministe hors navigateur dans un environnement headless — les problèmes en production peuvent ainsi être reproduits localement ; les flux d'édition sensibles sont explicitement exclus de l'enregistrement.

## Composants et styles

Au-dessus de ce noyau se trouvent trois couches d'API destinées aux auteurs :

- **Composants de base** — éléments au niveau du moteur tels que View/Text/Image, Input/TextArea, SVG/Path, voir [Composants de base](/guide/elements).
- **Styles** — un sous-ensemble CSS versionné analysé côté coquille (tableau de prise en charge [ici](/style-support)), ainsi que le pipeline de build [SCSS/Less](/guide/scss-less) ; le cœur ne consomme que des valeurs typées normalisées et n'analyse pas le texte CSS.
- **Bibliothèque de composants UI** — `@dopejs/pingo-ui`, des composants finis alignés sur shadcn/ui, tous rendus sur canvas, voir [documentation des composants](/components).

## Pour aller plus loin

Les algorithmes complets, les structures de données et les critères d'acceptation sont détaillés dans le [document de conception technique](/design).
