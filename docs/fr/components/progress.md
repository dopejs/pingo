---
title: Progress
description: Barre de progression affichant l'avancement d'une tâche, rendue sur le canvas pingo.
---

# Progress

Progress affiche une progression déterministe à l'aide d'une piste remplie, par exemple pour un téléchargement, un envoi ou une tâche en plusieurs étapes. L'aperçu ci-dessous est rendu en temps réel par le moteur pingo et bascule entre thème clair et sombre selon le site.

:::preview progress-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { Progress } from "@dopejs/pingo-ui";

root.render(createElement(Progress, { value: 60 }));
```

La largeur de la piste hérite du conteneur parent. Placez Progress dans un conteneur de largeur fixe pour contrôler la longueur de la barre :

```tsx
createElement("container", {
  width: 320,
  children: createElement(Progress, { value: 60 }),
});
```

## Exemples

### Valeur maximale personnalisée

`max` vaut 100 par défaut. Lorsqu'elle est fournie, le pourcentage de remplissage est calculé selon `value / max`, toujours borné entre 0 et 100 :

```tsx
createElement(Progress, { value: 3, max: 10 }); // 30%
```

## Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` | — | Progression actuelle (obligatoire), bornée en cas de dépassement |
| `max` | `number` | `100` | Valeur maximale, traitée au minimum comme 1 |
| `className` | `string` | — | Ajouté après le nom de classe du composant |

## Accessibilité

Progress est un élément purement visuel, sans rôle sémantique associé. Si la progression est essentielle à l'achèvement d'une tâche, accompagnez-la d'un texte indiquant le pourcentage actuel ou le nom de l'étape.
