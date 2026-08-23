---
title: Tabs
description: Les onglets basculent entre un ensemble de panneaux de même niveau, rendus sur le canvas pingo.
---

# Tabs

Les onglets basculent entre plusieurs panneaux de contenu de même niveau dans une même zone. L'aperçu ci-dessous est rendu en temps réel par le moteur pingo : vous pouvez cliquer sur les onglets pour basculer, ou utiliser les flèches gauche/droite pour vous déplacer entre eux.

:::preview tabs-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@dopejs/pingo-ui";

root.render(
  createElement(Tabs, {
    defaultValue: "account",
    children: [
      createElement(TabsList, {
        children: [
          createElement(TabsTrigger, { value: "account", children: "账户" }),
          createElement(TabsTrigger, { value: "password", children: "密码" }),
        ],
      }),
      createElement(TabsContent, {
        value: "account",
        children: createElement("text", { value: "管理你的账户信息。" }),
      }),
      createElement(TabsContent, {
        value: "password",
        children: createElement("text", { value: "修改你的登录密码。" }),
      }),
    ],
  }),
);
```

`Tabs` prend en charge à la fois le mode non contrôlé (`defaultValue`) et le mode contrôlé (`value` + `onValueChange`).

## Props

### Tabs

| Prop            | Type                      | Défaut | Description                                                    |
| --------------- | ------------------------- | ------ | -------------------------------------------------------------- |
| `value`         | `string`                  | —      | Contrôlé : la `value` de l'onglet actuellement sélectionné     |
| `defaultValue`  | `string`                  | —      | Non contrôlé : la `value` de l'onglet initialement sélectionné |
| `onValueChange` | `(value: string) => void` | —      | Rappel lors du changement de sélection                         |
| `children`      | `PingoNode`               | —      | `TabsList` et plusieurs `TabsContent` (obligatoire)            |
| `className`     | `string`                  | —      | Ajouté après le nom de classe du composant                     |

### TabsList

| Prop        | Type        | Défaut | Description                                |
| ----------- | ----------- | ------ | ------------------------------------------ |
| `children`  | `PingoNode` | —      | Liste de `TabsTrigger` (obligatoire)       |
| `className` | `string`    | —      | Ajouté après le nom de classe du composant |

### TabsTrigger

| Prop        | Type     | Défaut | Description                                                      |
| ----------- | -------- | ------ | ---------------------------------------------------------------- |
| `value`     | `string` | —      | Identifiant associé au `TabsContent` correspondant (obligatoire) |
| `children`  | `string` | —      | Texte de l'onglet (obligatoire)                                  |
| `className` | `string` | —      | Ajouté après le nom de classe du composant                       |

### TabsContent

| Prop        | Type        | Défaut | Description                                                      |
| ----------- | ----------- | ------ | ---------------------------------------------------------------- |
| `value`     | `string`    | —      | Identifiant associé au `TabsTrigger` correspondant (obligatoire) |
| `children`  | `PingoNode` | —      | Contenu du panneau (obligatoire)                                 |
| `className` | `string`    | —      | Ajouté après le nom de classe du composant                       |

## Accessibilité

La liste d'onglets possède la sémantique tablist, chaque onglet la sémantique tab et expose l'état de sélection aux technologies d'assistance. Les flèches gauche/droite ainsi que Home/End permettent de se déplacer entre les onglets tout en les sélectionnant, le focus suivant la sélection ; les panneaux inactifs sont masqués avec `display: none` plutôt que démontés, préservant ainsi la position de défilement et l'état d'édition du panneau.
