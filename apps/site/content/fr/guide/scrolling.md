# Défilement et virtualisation

## Le défilement vient d'overflow

Dès qu'un View déclare `overflow-x` / `overflow-y` à `auto`, `scroll` ou `hidden` sur un
axe, il devient un conteneur de défilement sur cet axe. Aucun autre élément n'est
nécessaire :

```ts
View({
  style: { height: 480, overflowY: "auto" },
  children: rows,
});
```

Les gestes, la molette, le chaînage et la barre de défilement découlent tous de cette
seule déclaration : le chemin de hit remonte jusqu'au plus proche ancêtre défilant, et la
barre est dessinée par le Core à partir de l'état de défilement qu'il détient déjà -- une
frame de défilement n'atteint donc pas le Shell. `hidden` se comporte comme en CSS : pas
de barre pour l'utilisateur, mais le défilement programmatique reste valide.

**Défiler n'est pas virtualiser.** `overflow` fait défiler la boîte et ne devine pas s'il
faut fenêtrer les données. Le `virtual` ci-dessous est un contrat explicite, jamais
déduit d'`overflow` ni des enfants déjà matérialisés.

## Pourquoi la virtualisation vit dans le moteur

La latence de queue des listes virtuelles en DOM vient de l'enchaînement : l'événement de défilement
remonte au thread principal, déclenche un setState, un diff, puis un recalcul de mise en page. Dès que le
thread principal est occupé, des images sautent.

pingo place le calcul de la fenêtre dans le Core : en régime établi, le défilement **n'appelle jamais la
couche TypeScript**. Celle-ci se contente de matérialiser la plage visible selon la fenêtre de préchauffe
planifiée par le Core ; si les données ne sont pas prêtes, on dessine un substitut et on complète lors
d'images ultérieures.

## Donner une fenêtre de données à un View

La virtualisation est une propriété du View, pas un autre composant : la même boîte défilante porte des enfants ordinaires comme un million de lignes.

```ts
View({
  style: { width: 480, height: 640, overflowY: "auto" },
  virtual: {
    axis: "y",
    itemCount: 1_000_000,
    estimatedItemSize: 32,
    getItemKey: (index: number) => `order-${index}`,
    renderItem: (index: number) =>
      View({
        style: { height: 32 },
        children: Text({ value: `Ligne ${index}` }),
      }),
  },
});
```

`estimatedItemSize` n'est qu'une estimation initiale. Une fois la taille réelle mesurée, le
Core corrige la position de l'ancre via un arbre de sommes préfixes (Fenwick), et la barre
ne saute pas.

`axis` est mono-axe : une fenêtre sert `x` ou `y`, pas les deux.

Le composant `VirtualList` existe toujours : c'est le raccourci pour une liste verticale, et il
aboutit au même contrat Core. Pour l'axe horizontal, pour `getItemKey`, ou lorsque la même boîte
doit porter du contenu ordinaire et une fenêtre, utilisez `virtual` sur le View.

## Paramètres ajustables

| Champ de `virtual`       | Rôle                                                                  |
| ------------------------ | --------------------------------------------------------------------- |
| `axis`                   | Axe unique de la fenêtre, `x` ou `y` (par défaut `y`)                 |
| `itemCount`              | Nombre total d'éléments logiques                                      |
| `estimatedItemSize`      | Estimation initiale, corrigée par le Core après mesure                |
| `getItemKey`             | Identité stable d'un élément, pour la réutilisation entre fenêtres    |
| `renderItem`             | Matérialise un élément, appelé seulement pour les index de la fenêtre |
| `baseOverscanViewports`  | Plage de préchauffage symétrique (multiples du viewport)              |
| `velocityHorizonSeconds` | Durée de projection de la vitesse, pour la prédiction de direction    |
| `maximumAheadViewports`  | Plafond de préchauffage dans une direction                            |

La prédiction de direction préchauffe en priorité le sens du mouvement lors d'un lancer rapide, au lieu
de gaspiller le budget symétriquement des deux côtés.

## Défilement programmatique

`scrollX` / `scrollY` sont des propriétés du View lui-même, indépendantes de la
virtualisation. Seul un changement de valeur émet une mutation `ScrollTo` :

```ts
View({ style: { height: 480, overflowY: "auto" }, scrollY: 500_000 * 32, children: rows });
```

Ou l'API de manipulation directe du root, prévue pour des gestes personnalisés :

```ts
root.beginScroll(handle);
root.scrollBy(handle, 0, deltaY, elapsedMs);
root.endScroll(handle); // le Core estime la vitesse du lancer
```

`handle` provient du callback `ref` de l'élément (`NodeHandle`).

## Molette et pavé tactile

La **distance** parcourue à la molette correspond à celle du navigateur, mais la courbe de transfert
dépend de la source : les deltas haute précision (pavé tactile) sont appliqués 1:1 immédiatement et
l'inertie continue d'être fournie par le flux d'événements du système ; les crans discrets de molette
s'accumulent vers une cible animée que l'on rejoint par une courbe exponentielle, strictement bornée aux
limites du contenu et sans dépassement, exactement comme dans un navigateur.

## Imbrication et édition

La molette fait défiler le plus proche ancêtre défilant, c'est-à-dire le plus proche View
qui déclare `overflow`. Si un glisser du pointeur commence sur du texte éditable, la
sélection de texte prime sur le glisser de défilement. Cette priorité découle de la
profondeur dans le chemin de hit ; l'application n'a rien à faire.

## Critère de performance

Le benchmark automatique sur fixture fixe (un million de lignes, 20 000 images) fait partie de la porte de
fusion. Les P95/P99 de rejeu sont aujourd'hui sous la microseconde et trente minutes de défilement continu
ne montrent pas de croissance mémoire incontrôlée.

Les P95/P99 sur appareils réels et la latence d'entrée relèvent de la qualification de plateforme et ne
constituent pas une condition de sortie d'ingénierie. Cette limite est délibérée : elle évite de bloquer le
travail avec des données d'appareil non reproductibles, et évite tout autant de faire passer des chiffres
d'ingénierie pour une promesse sur les appareils.

La [démo de défilement du Playground](/fr/playground#/scroll) affiche les métriques d'image en direct.
