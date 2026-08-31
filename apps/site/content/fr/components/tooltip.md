---
title: Tooltip
description: Texte descriptif bref affiché au survol, ancré au-dessus de l’élément cible.
---

# Tooltip

Tooltip affiche un court texte explicatif au survol du pointeur, ancré par défaut au-dessus de la cible. L’aperçu ci-dessous est rendu en temps réel par le moteur pingo — survolez le bouton pour voir la bulle apparaître, et suivez la bascule clair/sombre selon le thème du site.

:::preview tooltip-basic
:::

## Utilisation

```tsx
import { Button, Tooltip } from "@dopejs/pingo-ui";

root.render(
  <Tooltip content="Enregistrer dans le cloud">
    <Button onPress={() => save()}>Enregistrer</Button>
  </Tooltip>,
);
```

Tooltip est piloté par l’entrée et la sortie du pointeur (`pointerenter` / `pointerleave`), sans props contrôlées ; lors d’un rendu statique, seul l’élément déclencheur est affiché, la bulle apparaît au survol.

## Props

| Prop        | Type        | Valeur par défaut | Description                                          |
| ----------- | ----------- | ----------------- | ---------------------------------------------------- |
| `content`   | `string`    | —                 | Texte de la bulle (requis)                           |
| `children`  | `PingoNode` | —                 | Élément déclencheur (requis)                         |
| `className` | `string`    | —                 | Ajouté après le nom de classe du conteneur d’ancrage |

## Accessibilité

La bulle possède une sémantique de tooltip. Tooltip n’apparaît qu’au survol et ne répond pas à la focalisation clavier ; ne placez pas d’informations essentielles uniquement dans un Tooltip.
