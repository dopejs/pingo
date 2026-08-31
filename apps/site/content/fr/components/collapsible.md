---
title: Collapsible
description: Zone de contenu unique dépliable et repliable, rendue dans le canvas pingo.
---

# Collapsible

Collapsible est la primitive à panneau unique d'Accordion : un déclencheur commande l'ouverture et
la fermeture d'un bloc de contenu — idéal quand il ne faut qu'une seule zone repliable. L'aperçu
ci-dessous est rendu en direct par le moteur pingo — cliquez sur le déclencheur pour basculer.

:::preview collapsible-basic
:::

## Utilisation

```tsx
import { Collapsible } from "@dopejs/pingo-ui";

root.render(
  <Collapsible trigger="高级选项" defaultOpen>
    <text value="折叠区内容。" />
  </Collapsible>,
);
```

Accepte aussi bien l'usage non contrôlé (`defaultOpen`) que contrôlé (`open` + `onOpenChange`).

## Exemples

### Désactivé

Avec `disabled`, le déclencheur ne répond plus ni au pointeur ni au clavier et le style désactivé
s'applique.

:::preview collapsible-disabled
:::

## Props

| Prop           | Type                      | Valeur par défaut | Description                                   |
| -------------- | ------------------------- | ----------------- | --------------------------------------------- |
| `trigger`      | `string`                  | —                 | Texte du déclencheur (obligatoire)            |
| `children`     | `PingoNode`               | —                 | Contenu affiché une fois ouvert (obligatoire) |
| `open`         | `boolean`                 | —                 | Contrôlé : état d'ouverture actuel            |
| `defaultOpen`  | `boolean`                 | `false`           | Non contrôlé : état d'ouverture initial       |
| `onOpenChange` | `(open: boolean) => void` | —                 | Callback de changement d'état d'ouverture     |
| `disabled`     | `boolean`                 | `false`           | Désactive le déclencheur                      |
| `className`    | `string`                  | —                 | Ajouté après les classes du composant         |

## Accessibilité

Le déclencheur possède la sémantique button et expose l'état expanded/collapsed aux technologies
d'assistance ; Entrée et Espace basculent l'ouverture. Le contenu fermé est masqué par
`display: none` plutôt que démonté, ce qui préserve la position de défilement et l'état d'édition
internes.
