---
title: Command
description: Panneau de commandes filtrable par recherche, avec sélection au clavier et confirmation par Entrée.
---

# Command

Command est un panneau de commandes avec champ de recherche : la saisie filtre instantanément les entrées, les flèches déplacent le curseur, Entrée confirme. L’aperçu ci-dessous est rendu en temps réel par le moteur pingo — saisissez directement dans le champ de recherche pour filtrer, et le thème suit automatiquement le mode clair/sombre du site.

:::preview command-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { Command } from "@dopejs/pingo-ui";

root.render(
  createElement(Command, {
    items: [
      { value: "open", label: "打开文件" },
      { value: "save", label: "保存文件" },
    ],
    onSelect: (value) => run(value),
    onDismiss: () => closePalette(),
  }),
);
```

Le filtrage est une correspondance de sous-chaîne sur le libellé, insensible à la casse — volontairement non floue : la stratégie de tri relève du produit, le composant ne la décide pas à la place de l’appelant. `onDismiss` répond à `Escape` lorsqu’aucune touche de navigation n’est interceptée, ce qui convient pour intégrer le panneau dans une Dialog afin d’offrir une expérience « ⌘K ».

## Props

| Prop          | Type                      | Valeur par défaut | Description                                                 |
| ------------- | ------------------------- | ----------------- | ----------------------------------------------------------- |
| `items`       | `readonly CommandItem[]`  | —                 | Entrées de commande (requis)                                |
| `onSelect`    | `(value: string) => void` | —                 | Rappel de sélection d’une entrée (clic ou Entrée)           |
| `onDismiss`   | `() => void`              | —                 | Rappel sur `Escape`                                         |
| `placeholder` | `string`                  | `"搜索"`          | Nom accessible du champ de recherche                        |
| `emptyLabel`  | `string`                  | `"无结果"`        | Texte affiché lorsque le filtrage ne renvoie aucun résultat |
| `className`   | `string`                  | —                 | Classe supplémentaire                                       |

### CommandItem

| Champ   | Type     | Description                                              |
| ------- | -------- | -------------------------------------------------------- |
| `value` | `string` | Valeur de l’entrée (requis)                              |
| `label` | `string` | Texte affiché et utilisé pour la correspondance (requis) |

## Accessibilité

Le conteneur expose la sémantique search, les entrées la sémantique option avec l’état selected ; les flèches haut/bas déplacent le curseur, `Enter` confirme, `Escape` déclenche `onDismiss`.
