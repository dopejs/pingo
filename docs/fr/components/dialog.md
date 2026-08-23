---
title: Dialog
description: Boîte de dialogue modale, interrompt le flux pour obtenir une saisie ou une confirmation de l'utilisateur, rendue sur le canevas pingo.
---

# Dialog

La boîte de dialogue ouvre un panneau modal au-dessus du contenu actuel, accompagné d'un voile. L'aperçu ci-dessous est rendu en temps réel par le moteur pingo : un clic sur le voile ou la touche `Escape` déclenche `onOpenChange(false)`, et le thème clair/sombre suit celui du site.

:::preview dialog-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import {
  Button,
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@dopejs/pingo-ui";

root.render(
  createElement(Dialog, {
    open,
    onOpenChange: (next) => setOpen(next),
    children: [
      createElement(DialogHeader, {
        children: [
          createElement(DialogTitle, { children: "Modifier le profil" }),
          createElement(DialogDescription, { children: "Les modifications sont synchronisées immédiatement." }),
        ],
      }),
      createElement(DialogFooter, {
        children: createElement(Button, { children: "Enregistrer", onPress: () => save() }),
      }),
    ],
  }),
);
```

La surcouche de Dialog remplit **son propre conteneur parent** (et non la fenêtre d'affichage) : montez-la à un emplacement proche du nœud racine. `open` est une prop contrôlée : le composant ne conserve pas l'état d'ouverture/fermeture ; à la fermeture, il notifie l'appelant via `onOpenChange(false)`.

## Exemples

### Blocs combinables

`DialogHeader` / `DialogTitle` / `DialogDescription` / `DialogFooter` sont de purs composants de mise en page et de typographie, à combiner selon les besoins ; `children` accepte n'importe quel `PingoNode`, formulaires et listes peuvent être placés dans le panneau.

## Props

### Dialog

| Prop | Type | Défaut | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | — | Indique si la boîte est ouverte (obligatoire, contrôlée) |
| `onOpenChange` | `(open: boolean) => void` | — | Rappel lors d'une demande de fermeture/ouverture |
| `children` | `PingoNode` | — | Contenu du panneau (obligatoire) |
| `className` | `string` | — | Ajouté après le nom de classe de la surcouche |

### DialogHeader / DialogFooter

| Prop | Type | Défaut | Description |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | Contenu du bloc (obligatoire) |
| `className` | `string` | — | Nom de classe supplémentaire |

### DialogTitle / DialogDescription

| Prop | Type | Défaut | Description |
| --- | --- | --- | --- |
| `children` | `string` | — | Contenu textuel (obligatoire) |
| `className` | `string` | — | Nom de classe supplémentaire |

## Accessibilité

Le panneau possède la sémantique dialog ; à l'ouverture, le focus est déplacé dans le panneau, et après fermeture par `Escape`, le focus revient à l'élément déclencheur. Les éléments interactifs du panneau sont intégrés dans le cycle de tabulation. Utilisez `DialogTitle` pour le titre (sémantique de titre).
