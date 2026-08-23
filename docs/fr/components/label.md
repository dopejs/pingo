---
title: Libellé
description: Texte de libellé de formulaire, utilisé avec les contrôles de saisie, rendu sur le canevas pingo.
---

# Libellé

Les libellés servent à fournir un nom visible aux contrôles de formulaire. L’aperçu ci-dessous est rendu en temps réel par le moteur pingo et suit le thème clair/sombre du site.

:::preview label-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { Input, Label } from "@dopejs/pingo-ui";

root.render(
  createElement("container", {
    style: { flexDirection: "column" },
    children: [
      createElement(Label, { children: "邮箱" }),
      createElement("container", { height: 8 }),
      createElement(Input, { semanticLabel: "邮箱", width: 320 }),
    ],
  }),
);
```

pingo ne possède pas de propriété `gap` ; l’espacement entre le libellé et le contrôle est réalisé avec un conteneur de taille fixe.

## Exemples

### Nom sémantique

L’association de contrôles n’existe pas encore dans pingo, aussi la liaison entre le libellé et le contrôle repose sur une convention : transmettez au contrôle un `semanticLabel` identique au libellé, afin que le lecteur d’écran puisse lire le même nom.

## Props

| Prop            | Type     | Valeur par défaut | Description                                                              |
| --------------- | -------- | ----------------- | ------------------------------------------------------------------------ |
| `children`      | `string` | —                 | Texte du libellé (obligatoire)                                           |
| `className`     | `string` | —                 | Ajouté après le nom de classe du composant                               |
| `semanticLabel` | `string` | —                 | Remplace le nom d’accessibilité ; utilise par défaut le texte du libellé |

## Accessibilité

pingo ne dispose pas encore de mécanisme d’association libellé–contrôle, Libellé n’est qu’un texte mis en forme. Définissez toujours `semanticLabel` sur le contrôle correspondant, afin que le nom d’accessibilité ne dépende pas de la proximité visuelle.
