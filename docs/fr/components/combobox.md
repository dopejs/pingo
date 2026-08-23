---
title: Combobox
description: Sélecteur déroulant avec recherche, filtre une liste d’options saisie au clavier et s’affiche sur le canvas pingo.
---

# Combobox

Une combobox associe un déclencheur affichant la valeur sélectionnée à une liste d’options consultable. L’aperçu ci-dessous est rendu en temps réel par le moteur pingo — la liste est déjà ouverte, vous pouvez saisir un filtre, naviguer avec les flèches et suivre le thème clair ou sombre du site.

:::preview combobox-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { Combobox } from "@dopejs/pingo-ui";

root.render(
  createElement(Combobox, {
    items: [
      { value: "next", label: "Next.js" },
      { value: "remix", label: "Remix" },
      { value: "astro", label: "Astro" },
    ],
    placeholder: "选择框架",
    onValueChange: (value) => console.log(value),
  }),
);
```

`items` est un tableau de `{ value, label }` ; le filtrage repose sur une correspondance de sous-chaîne insensible à la casse sur `label` — volontairement sans tri approximatif, car un mauvais tri est pire que l’absence de tri. Une fois la sélection faite, la liste se referme automatiquement et la requête est effacée **à la fermeture**, afin d’éviter de rouvrir la liste avec un filtre oublié depuis longtemps.

## Exemples

### Contrôlé

`value` / `onValueChange` ainsi que `open` / `onOpenChange` peuvent être contrôlés ; à défaut, le composant conserve son propre état via `defaultValue` / `defaultOpen`.

### État vide

`emptyLabel` personnalise le texte affiché lorsque le filtrage ne renvoie aucun résultat.

## Props

| Prop | Type | Défaut | Description |
| --- | --- | --- | --- |
| `items` | `readonly { value: string; label: string }[]` | — | Liste d’options (obligatoire) |
| `value` | `string` | — | Valeur sélectionnée contrôlée |
| `defaultValue` | `string` | — | Valeur sélectionnée initiale non contrôlée |
| `onValueChange` | `(value: string) => void` | — | Rappel au changement de sélection (la liste se referme automatiquement après la sélection) |
| `open` | `boolean` | — | Ouverture contrôlée |
| `defaultOpen` | `boolean` | `false` | Ouverture initiale non contrôlée |
| `onOpenChange` | `(open: boolean) => void` | — | Rappel d’ouverture ou de fermeture |
| `placeholder` | `string` | `"请选择"` | Texte indicatif sur le déclencheur lorsqu’aucune valeur n’est sélectionnée |
| `emptyLabel` | `string` | — | Message affiché lorsque le filtrage ne renvoie aucun résultat |
| `className` | `string` | — | Ajouté après le nom de classe du composant |

## Accessibilité

Le déclencheur possède la sémantique d’un bouton et bascule entre `expanded` et `collapsed`. Lorsque la liste s’ouvre, le focus entre dans la zone de recherche, les flèches déplacent la surbrillance, Entrée sélectionne puis referme ; à la fermeture, le focus revient au déclencheur.
