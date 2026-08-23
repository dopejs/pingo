---
title: Skeleton
description: Blocs de squelette de substitution pendant le chargement du contenu, rendus sur le canevas pingo.
---

# Skeleton

Skeleton affiche des blocs de substitution dont la forme se rapproche de la mise en page finale avant la fin du chargement du contenu, afin de réduire l'effet de saut pendant l'attente. L'aperçu ci-dessous est rendu en temps réel par le moteur pingo et suit le thème clair ou sombre du site.

:::preview skeleton-card
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { Skeleton } from "@dopejs/pingo-ui";

root.render(createElement(Skeleton, { width: 320, height: 16 }));
```

`width` / `height` peuvent tous deux être omis ; dans ce cas, les dimensions sont entièrement déterminées par la mise en page extérieure et votre feuille de style.

## Exemples

### Composer un squelette de page

Assemblez plusieurs Skeleton de tailles différentes pour esquisser la structure du contenu à venir — l'aperçu ci-dessus est justement un squelette de carte « avatar + titre + deux lignes de texte ». pingo ne possède pas de propriété gap ; l'espacement entre les blocs est réalisé avec des conteneurs vides de taille fixe, voir le [guide de style](/guide/styling).

## Props

| Prop | Type | Valeur par défaut | Description |
| --- | --- | --- | --- |
| `width` | `number` | — | Largeur du bloc de substitution (px), déterminée par la mise en page si omise |
| `height` | `number` | — | Hauteur du bloc de substitution (px), déterminée par la mise en page si omise |
| `className` | `string` | — | Ajouté après le nom de classe du composant |

## Accessibilité

Skeleton est un substitut décoratif, sans sémantique propre. Une fois le chargement terminé, il doit être entièrement remplacé par le contenu réel ; rester longtemps sur un écran squelette signifie que le chargement a échoué, auquel cas il convient de fournir un message d'erreur et une possibilité de réessayer.

Il s'agit actuellement d'un substitut statique (sans animation de pulsation) — le sous-ensemble d'animations de base ne prend pas encore en charge les keyframes CSS.
