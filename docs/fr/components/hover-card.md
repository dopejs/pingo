---
title: Hover Card
description: Carte de contenu riche qui se déplie au survol, avec des délais d'ouverture et de fermeture.
---

# Hover Card

La Hover Card déplie une carte de contenu riche au survol (ou au focus) du déclencheur — elle transporte plus d'informations qu'une infobulle, comme un aperçu de profil utilisateur. L'aperçu ci-dessous est rendu en temps réel par le moteur pingo (affiché en permanence avec `open` contrôlé), et bascule entre thème clair et sombre selon le thème du site.

:::preview hover-card-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { HoverCard } from "@dopejs/pingo-ui";

root.render(
  createElement(HoverCard, {
    openDelayMs: 300,
    closeDelayMs: 200,
    children: createElement("text", { value: "@pingo" }),
    content: createElement("text", { value: "Canvas 渲染引擎与 UI 组件库。" }),
  }),
);
```

Une fois ouverte, la carte ne se ferme pas même lorsque le pointeur la survole, donc `closeDelayMs` laisse le temps au pointeur de franchir l'espace entre le déclencheur et la carte. Passer `open` bascule en mode contrôlé, et vous gérez l'état vous-même avec `onOpenChange`.

## Props

| Prop | Type | Défaut | Description |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | Élément déclencheur (obligatoire) |
| `content` | `PingoNode` | — | Contenu de la carte (obligatoire) |
| `open` | `boolean` | — | État d'ouverture contrôlé |
| `onOpenChange` | `(open: boolean) => void` | — | Rappel de changement d'ouverture |
| `openDelayMs` | `number` | `300` | Délai d'ouverture (millisecondes) |
| `closeDelayMs` | `number` | `200` | Délai de fermeture (millisecondes) |
| `className` | `string` | — | Ajouté après le nom de classe du conteneur d'ancrage |

## Accessibilité

Le déclencheur ouvre également la carte au focus, et la ferme à la perte de focus, afin que les utilisateurs au clavier ne perdent pas le contenu.
