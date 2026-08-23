# Architecture

## Propriété des deux côtés

```
TSX / hooks          →  Mutation Stream  →   Scene / Layout / Paint
（TypeScript Shell）      二进制、批量        （Rust Core，wasm）
                                                    ↓
Canvas2D 回放器      ←   DisplayList      ←    Picture
```

**Le Shell possède l'arbre de composants, le Core possède le Scene. Les deux ne partagent aucun
objet mutable.**
Toute communication transfrontalière est un flux binaire versionné : little-endian, aligné sur
quatre octets, découpé en instructions ; le récepteur valide opcode, longueur, alignement, ID et
arithmétique avant tout accès mémoire, et une entrée malformée est rejetée atomiquement plutôt
qu'appliquée partiellement.

Cette frontière n'est pas une optimisation de performance mais une frontière de correction : même si
les octets proviennent en général de l'encodeur de ce projet, le décodeur les traite comme une
entrée non fiable, avec une couverture de fuzzing.

## Deux horloges

L'horloge de l'interface (thread principal) et l'horloge de rendu (Worker) sont indépendantes :

- Le thread principal collecte les entrées, exécute l'arbre de composants et soumet les frames de
  Mutation.
- Le Worker pilote la physique du défilement, les animations, la mise en page et la composition.

**En régime établi, le défilement n'appelle pas le Shell.** Les données manquantes sont rendues avec
des substituts, puis reconstruites lors d'images ultérieures. Ainsi, quand le thread principal est
bloqué 200 ms par du code métier, défilement et animations restent continus — ce scénario est gardé
par un test automatique d'injection de panne.

## Chaîne de repli

La détection de capacités choisit le transport dans l'ordre, avec trois paliers fonctionnellement
équivalents :

1. **SharedArrayBuffer** — nécessite l'isolation cross-origin (COOP/COEP)
2. **postMessage** — quand SAB est absent
3. **Canvas2D sur le thread principal** — quand Worker / OffscreenCanvas sont absents

```ts
const root = await createHostedCanvasRoot(canvas, {
  transport: { preference: "sab" }, // préférence facultative, repli si non satisfaite
});
console.log(root.mode); // "sab" | "post-message" | "main-thread"
```

Le [Playground](/playground) de ce site en est un exemple vivant : GitHub Pages ne peut pas émettre
les en-têtes COOP/COEP, donc la production tourne sur le chemin postMessage, et le badge de
transport en haut de page l'affiche fidèlement.

## Modèle d'invalidation

**La sémantique des props détermine le domaine d'invalidation** : l'appelant ne marque rien
manuellement et il n'existe pas de porte de sortie de type `forceUpdate`.

Chaque propriété déclare dans un schéma à source unique si elle affecte la mise en page, le rendu,
le hit testing ou la sémantique. Modifier une `opacity` ne déclenche pas de reflow ; modifier
`width`, si. Les bitmaps de saleté sont entretenus par domaine, et `onFrame` expose le nombre de
nœuds sales de chaque domaine.

Ce choix est « invalidation la plus étroite possible + filet de tests de propriétés » : le rendu
incrémental doit être identique au pixel près au rendu complet, et les tests différentiels réduisent
tout contre-exemple au cas d'échec minimal.

## Représentation du Scene

Le Scene dans le Core est en SoA (structure de tableaux) :

- Les ID de nœuds contiennent une **génération** : la réutilisation d'un emplacement ne réactive
  jamais un ID périmé.
- Après chaque commit, le Scene reste **trié topologiquement** : un parent précède toujours ses
  enfants.
- Les éditions structurelles sont compactées une fois par commit, et non à chaque mutation.
- Les résultats de mise en page sont comparés en masse via un double tampon SoA — aucune allocation
  de fermeture ou d'écouteur par nœud sur le chemin chaud.

## Backends interchangeables

Le Core produit un DisplayList binaire plat ; les backends ne sont que des relecteurs. Le backend
Canvas2D est une boucle sur typed arrays avare en allocations — **appeler le wasm→JS une fois par
dessin n'est pas un chemin de rendu acceptable**.

Le même DisplayList alimente aussi un prototype wgpu isolé, et les deux sorties sont comparées par
différence de pixels. L'adoption de WebGPU est une décision fondée sur les données, voir
[ADR-0006](/adr/0006-webgpu-backend-decision).

## Déterminisme

Le temps, les sources aléatoires et les flux d'entrée sont injectables ou rejouables, et la sortie
du Core ne dépend pas de l'ordonnancement des threads. Les archives `DOPR` enregistrent les flux de
Mutation et d'Input dans l'ordre d'origine et se rejouent de façon déterministe en environnement
headless, hors navigateur — un problème de production devient ainsi reproductible en local ; les
flux d'édition sensibles sont explicitement exclus de l'enregistrement.

## Composants et styles

Au-dessus de ce noyau se trouvent trois couches d'API orientées auteur :

- **Éléments de base** — View/Text/Image, Input/TextArea, SVG/Path et autres éléments de niveau
  moteur, voir [Éléments de base](/guide/elements).
- **Styles** — un subset CSS versionné analysé côté Shell (table de prise en charge
  [ici](/style-support)), plus la [pipeline SCSS/Less](/guide/scss-less) à la construction ; le Core
  ne consomme que des valeurs typées normalisées et n'analyse jamais de texte CSS.
- **Bibliothèque de composants UI** — `@dopejs/pingo-ui`, des composants prêts à l'emploi alignés
  sur shadcn/ui, tous rendus dans le canvas, voir la [documentation des composants](/components).

## Pour aller plus loin

Les algorithmes complets, les structures de données et les critères d'acceptation figurent dans le
[document de conception technique](/design).
