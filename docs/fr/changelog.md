---
title: Journal des modifications
---

# Changelog

La politique de versions figure dans `docs/release.md` : les 12 paquets sont publiés atomiquement dans
la même version, et le semver npm et la version de l'ABI binaire sont gérés séparément.

## 0.3.0 - 2026-08-25

- Les éléments d'une liste virtuelle s'étirent désormais sur la largeur de la liste : les
  lignes du corps d'un tableau s'alignent sur les colonnes de son en-tête. La mise en page
  de l'enveloppe appartient au Core et ne passe pas par la cascade de styles.
- Une boîte étirée dans un conteneur défilant retrouve sa taille transversale définie et sa
  base de pourcentage : les boîtes d'un panneau défilant ne retombent plus sur
  l'ajustement au contenu, et `100%` dans un élément virtuel ne vaut plus zéro.
- Les éléments flex reçoivent la taille minimale automatique de CSS sur l'axe de bloc : un
  très grand frère ne peut plus écraser un élément dimensionné par son contenu.
  Sous-ensemble CSS 1.8.0 : `min-width`/`min-height` valent désormais `auto` par défaut.
- Composants : Skeleton pulse ; NavigationMenu ne porte plus la bordure de Menubar et gagne
  un chevron ; l'en-tête d'un tableau ne se comprime plus ; StatCard/TopBar/ListRow
  conservent la largeur de leur contenu lorsqu'aucune largeur n'est donnée.
- Publication : l'ensemble publié et la liste d'artefacts proviennent de la liste du
  vérificateur ; la vérification de build reproductible passe en fin de chaîne.
- La licence du projet passe de MIT à Apache-2.0 à partir de la version 0.3.0 ;
  les versions publiées jusqu'à la v0.2.1 restent sous licence MIT.
- La courbe de transfert de la molette s'aligne sur le navigateur : les crans discrets défilent en
  animation, tandis que les deltas haute précision (pavé tactile) restent appliqués 1:1 immédiatement.
  `DispatchEvent` du flux d'entrée gagne un champ de drapeaux et la version de l'ABI passe de 1 à 2.
- Le site officiel est disponible en chinois simplifié, chinois traditionnel, espagnol, français,
  allemand, russe, hébreu, arabe, japonais et coréen.

## 0.1.0

Première version publiable. Tous les jalons d'ingénierie P0–M5 sont terminés et `pnpm m5:check`
(la chaîne automatique de M0 à M5) passe au vert.

- Core Rust/WASM déterministe + couche TypeScript : schéma à source unique, flux binaires versionnés
  Mutation/Input/DisplayList et flux inverse, rejet atomique des entrées malformées.
- Rendu à deux horloges : chaîne SAB → postMessage → Canvas2D sur le thread principal ; le Worker
  continue d'afficher même quand le thread principal est bloqué 200 ms.
- Défilement virtuel natif (rejeu P95/P99 sous la microseconde sur un million de lignes) et sous-système
  de texte (shaping explicite des polices, atlas de glyphes, repli sur les polices système).
- Édition native dans le canvas : double chemin EditContext/proxy de saisie, composition IME, navigation
  du curseur au pointeur et au clavier, presse-papiers, undo/redo, masquage des mots de passe et
  scroll-into-view du curseur.
- Hit testing (BVH incrémental et tests de propriétés face à un oracle naïf) et événements en trois phases
  capture/cible/bouillonnement, avec le protocole de `preventDefault` synchrone sur les zones non passives.
- Accessibilité : export de l'arbre sémantique, projection vers l'arbre DOM fantôme, sélecteurs E2E
  sémantiques `getByRole` et transmission du focus clavier.
- Migration et industrialisation : `@dopejs/pingo-compat` pour le déploiement et le retour arrière page par
  page, scanner de migration, vérification d'intégrité SHA-256 du paquet et du WASM, diagnostic et manuel
  d'exploitation.
- Prototype WebGPU isolé et comparaison sans écart face à l'oracle headless (ADR-0006 :
  Continue Experiment, désactivé par défaut).

Reports explicites : navigation visuelle bidi, placeholder des widgets, activation de WebGPU par défaut.
La qualification de plateforme (performances sur appareils réels, IME réels, lecteurs d'écran) est suivie
séparément et n'est pas promise par la version du paquet.
