---
title: Select
description: Sélecteur déroulant composable, avec navigation au clavier, rendu sur le canvas pingo.
---

# Select

Le sélecteur déroulant est composé de `Select`, `SelectTrigger`, `SelectContent` et `SelectItem`. L'aperçu ci-dessous est rendu en temps réel par le moteur pingo — la liste est déjà ouverte, vous pouvez naviguer avec les flèches, valider avec Entrée, et le thème clair/sombre suit celui du site.

:::preview select-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@dopejs/pingo-ui";

root.render(
  createElement(Select, {
    value: "pingo-ui",
    onValueChange: (value) => console.log(value),
    children: [
      createElement(SelectTrigger, { placeholder: "选择一个包" }),
      createElement(SelectContent, {
        children: [
          createElement(SelectItem, { value: "pingo", children: "@dopejs/pingo" }),
          createElement(SelectItem, { value: "pingo-ui", children: "@dopejs/pingo-ui" }),
        ],
      }),
    ],
  }),
);
```

Toutes les parties collaborent via le context et doivent être montées sous forme de composants avec `createElement`. Le déclencheur affiche la `value` actuellement sélectionnée ; lorsqu'aucune valeur n'est sélectionnée, il affiche le `placeholder`.

## Exemples

### Ouvert par défaut

`defaultOpen` permet d'ouvrir initialement la liste (comme dans l'aperçu ci-dessus) ; `onOpenChange` écoute les changements d'ouverture/fermeture.

## Props

### Select

| Prop | Type | Défaut | Description |
| --- | --- | --- | --- |
| `value` | `string` | — | Valeur sélectionnée, affichée sur le déclencheur |
| `defaultOpen` | `boolean` | `false` | Ouvert initialement |
| `onValueChange` | `(value: string) => void` | — | Rappel lors d'un changement de sélection (la liste se referme automatiquement après la sélection) |
| `onOpenChange` | `(open: boolean) => void` | — | Rappel lors de l'ouverture ou de la fermeture |
| `children` | `PingoNode` | — | Déclencheur et contenu (obligatoire) |
| `className` | `string` | — | Ajouté après le nom de classe du composant |

### SelectTrigger

| Prop | Type | Défaut | Description |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | Contenu personnalisé du déclencheur ; par défaut, affiche la valeur sélectionnée ou le texte de substitution |
| `placeholder` | `string` | — | Texte de substitution lorsqu'aucune valeur n'est sélectionnée |
| `className` | `string` | — | Ajouté après le nom de classe du composant |

### SelectContent

| Prop | Type | Défaut | Description |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | Liste de `SelectItem` (obligatoire) |
| `className` | `string` | — | Ajouté après le nom de classe du composant |

### SelectItem

| Prop | Type | Défaut | Description |
| --- | --- | --- | --- |
| `value` | `string` | — | Valeur de l'option (obligatoire) |
| `children` | `string` | — | Texte de l'option (obligatoire) |
| `className` | `string` | — | Ajouté après le nom de classe du composant |

## Accessibilité

Le déclencheur possède la sémantique d'un bouton et bascule entre `expanded` / `collapsed` ; le contenu possède la sémantique d'un menu. Les flèches déplacent la surbrillance, `Entrée`/`Espace` valident la sélection, `Échap` ferme la liste ; après la sélection, le focus revient au déclencheur.
