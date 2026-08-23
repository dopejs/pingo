---
title: ListRow
description: Molécule de ligne de liste, combinant avatar, badge et autres éléments de base avec les états sélectionné/désactivé, rendue sur le canvas pingo.
---

# ListRow

ListRow est une molécule produit propre à pingo : une ligne d'élément de liste, avec le titre et la description occupant la colonne flexible centrale, et les slots `leading` (avatar, icône) et `trailing` (badge, interrupteur, flèche) disposés aux extrémités. L'aperçu ci-dessous est rendu en temps réel par le moteur pingo — les lignes cliquables bénéficient d'un retour de pointeur complet et suivent le thème clair/sombre du site.

:::preview list-row-basic
:::

Relation de composition avec les éléments de base shadcn : ListRow définit la disposition de la ligne et les états d'interaction, sans intégrer aucun composant de contenu ; les slots `leading`/`trailing` acceptent tout `PingoNode`, la combinaison typique étant Avatar, Badge ou Switch. Lorsqu'un espacement est nécessaire entre des lignes adjacentes, utilisez un conteneur à hauteur fixe pour l'espacement (pingo ne possède pas de propriété gap).

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { Avatar, Badge, ListRow } from "@dopejs/pingo-ui";

root.render(
  createElement(ListRow, {
    title: "张三",
    description: "zhangsan@example.com",
    leading: createElement(Avatar, { fallback: "张", size: 32 }),
    trailing: createElement(Badge, { children: "管理员" }),
    onPress: () => openMember("zhangsan"),
  }),
);
```

## Exemples

### Sélection et désactivation

`selected` applique le style de sélection et expose l'état sélectionné vers l'extérieur ; une ligne `disabled` ne porte aucun gestionnaire d'événement — plus robuste qu'une vérification dans le gestionnaire.

:::preview list-row-states
:::

### Ligne purement informative

Sans `onPress`, elle se comporte comme un élément purement informatif : le rôle sémantique est `listitem`, sans style interactif ni événement.

## Props

| Prop | Type | Valeur par défaut | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Texte du titre (obligatoire) |
| `description` | `string` | — | Texte de description secondaire |
| `leading` | `PingoNode` | — | Slot avant, pour un avatar ou une icône |
| `trailing` | `PingoNode` | — | Slot arrière, pour un badge, un interrupteur ou une flèche |
| `selected` | `boolean` | — | État sélectionné ; lorsqu'il est fourni, expose les valeurs sémantiques `selected`/`unselected` |
| `disabled` | `boolean` | `false` | État désactivé, n'enregistre aucun gestionnaire d'événement |
| `onPress` | `() => void` | — | Rappel de clic ; une fois fourni, la ligne devient interactive |
| `className` | `string` | — | Ajouté après le nom de classe du composant |

## Accessibilité

Les lignes interactives ont le rôle sémantique `button`, les lignes purement informatives `listitem` ; le nom accessible est tiré de `title`. Lorsque `selected` est fourni, les valeurs sémantiques `selected`/`unselected` sont exposées. Les lignes désactivées ne portent aucun gestionnaire de pointeur ni de clavier, et sont présentées aux technologies d'assistance comme des éléments purement statiques.
