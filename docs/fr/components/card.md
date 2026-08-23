---
title: Card
description: Conteneur carte composable — Header, Title, Description, Content, Footer — rendu dans le canvas pingo.
---

# Card

La carte regroupe du contenu lié dans un conteneur à bordure et ombre, composé de six emplacements
combinables. L'aperçu ci-dessous est rendu en direct par le moteur pingo et suit le thème
clair/sombre du site.

:::preview card-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@dopejs/pingo-ui";

root.render(
  createElement(Card, {
    children: [
      createElement(CardHeader, {
        children: [
          createElement(CardTitle, { children: "账户设置" }),
          createElement(CardDescription, { children: "管理你的账户偏好与通知。" }),
        ],
      }),
      createElement(CardContent, {
        children: createElement("text", { value: "卡片正文内容。" }),
      }),
      createElement(CardFooter, {
        children: createElement(Button, { children: "保存", onPress: () => {} }),
      }),
    ],
  }),
);
```

Tous les emplacements sont facultatifs — ne composez que ceux dont vous avez besoin ; leur contenu
est transmis tel quel, sans aucun enrobage.

## Props

`Card`, `CardHeader`, `CardContent` et `CardFooter` acceptent des props de conteneur :

| Prop        | Type        | Valeur par défaut | Description                            |
| ----------- | ----------- | ----------------- | -------------------------------------- |
| `children`  | `PingoNode` | —                 | Contenu de l'emplacement (obligatoire) |
| `className` | `string`    | —                 | Ajouté après les classes du composant  |

`CardTitle` et `CardDescription` acceptent des props de texte :

| Prop        | Type     | Valeur par défaut | Description                           |
| ----------- | -------- | ----------------- | ------------------------------------- |
| `children`  | `string` | —                 | Contenu texte (obligatoire)           |
| `className` | `string` | —                 | Ajouté après les classes du composant |

## Accessibilité

Card est un conteneur purement visuel, sans sémantique supplémentaire ; le nom lisible et la
structure de la carte sont portés par les titres, boutons et autres composants placés à
l'intérieur. Les couleurs du titre et du corps héritent de la couleur de premier plan de la carte
et conservent leur contraste dans les thèmes clair comme sombre.
