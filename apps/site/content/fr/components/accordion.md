---
title: Accordion
description: Accordéon vertical à un seul panneau ouvert à la fois, rendu dans le canvas pingo.
---

# Accordion

L'accordéon organise du contenu lié en groupes verticaux dépliables et repliables, avec un seul
panneau ouvert à la fois. L'aperçu ci-dessous est rendu en direct par le moteur pingo — cliquez
sur les en-têtes pour basculer, ou déplacez le focus avec les flèches et ouvrez avec Entrée/Espace.

:::preview accordion-basic
:::

## Utilisation

```tsx
import { Accordion, AccordionItem } from "@dopejs/pingo-ui";

root.render(
  <Accordion defaultOpenValue="intro">
    <AccordionItem value="intro" title="什么是 pingo-ui？">
      <text value="渲染在 pingo canvas 上的组件库。" />
    </AccordionItem>
    <AccordionItem value="theme" title="支持暗色主题吗？">
      <text value="支持，跟随主题自动切换。" />
    </AccordionItem>
  </Accordion>,
);
```

`Accordion` accepte aussi bien l'usage non contrôlé (`defaultOpenValue`) que contrôlé
(`openValue` + `onValueChange`).

## Props

### Accordion

| Prop               | Type                                   | Valeur par défaut | Description                                                                  |
| ------------------ | -------------------------------------- | ----------------- | ---------------------------------------------------------------------------- |
| `openValue`        | `string`                               | —                 | Contrôlé : `value` du panneau actuellement ouvert                            |
| `defaultOpenValue` | `string`                               | —                 | Non contrôlé : `value` du panneau ouvert initialement                        |
| `onValueChange`    | `(value: string \| undefined) => void` | —                 | Callback de changement de panneau ouvert ; `undefined` quand tout est replié |
| `children`         | `PingoNode`                            | —                 | Liste d'`AccordionItem` (obligatoire)                                        |
| `className`        | `string`                               | —                 | Ajouté après les classes du composant                                        |

### AccordionItem

| Prop        | Type        | Valeur par défaut | Description                                   |
| ----------- | ----------- | ----------------- | --------------------------------------------- |
| `value`     | `string`    | —                 | Identifiant unique du panneau (obligatoire)   |
| `title`     | `string`    | —                 | Titre du déclencheur (obligatoire)            |
| `children`  | `PingoNode` | —                 | Contenu affiché une fois ouvert (obligatoire) |
| `className` | `string`    | —                 | Ajouté après les classes du composant         |

## Accessibilité

Les flèches (haut/bas) déplacent le focus entre les en-têtes sans changer l'état d'ouverture,
Home/End vont au premier/dernier ; Entrée ou Espace bascule l'ouverture — conformément à la
séparation focus/sélection exigée par WAI-ARIA. La zone de contenu repliée est masquée par
`display: none` plutôt que démontée, ce qui préserve son état.
