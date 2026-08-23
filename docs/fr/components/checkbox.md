---
title: Checkbox
description: Case à cocher contrôlée, avec étiquette texte facultative, rendue dans le canvas pingo.
---

# Checkbox

La case à cocher sert d'interrupteur booléen indépendant. L'aperçu ci-dessous est rendu en direct
par le moteur pingo et suit le thème clair/sombre du site. Checkbox est un composant contrôlé :
l'aperçu montre des combinaisons statiques coché/décoché/désactivé, et l'interaction est pilotée
par l'état que détient l'appelant.

:::preview checkbox-basic
:::

## Utilisation

```tsx
import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
import { Checkbox } from "@dopejs/pingo-ui";

// useSignal 是 hook，必须运行在组件作用域内。
function NotificationSetting(): PingoNode {
  const enabled = useSignal(false);
  return createElement(Checkbox, {
    checked: enabled.get(),
    label: "已启用通知",
    onCheckedChange: (next) => enabled.set(next),
  });
}

root.render(createElement(NotificationSetting));
```

`checked` est détenu par le parent et `onCheckedChange` se charge de le mettre à jour — le
composant ne conserve aucun état. `label` est facultatif : fourni, il affiche un texte à droite de
la case.

## Exemples

### Désactivé

Avec `disabled`, la case ne répond plus ni au pointeur ni au clavier, et la valeur sémantique
devient `disabled`.

## Props

| Prop | Type | Valeur par défaut | Description |
| --- | --- | --- | --- |
| `checked` | `boolean` | — | État coché (obligatoire, contrôlé) |
| `onCheckedChange` | `(checked: boolean) => void` | — | Callback de bascule d'état |
| `disabled` | `boolean` | `false` | État désactivé |
| `label` | `string` | — | Étiquette texte à droite de la case |
| `className` | `string` | — | Ajouté après les classes du composant |
| `semanticLabel` | `string` | — | Nom d'accessibilité |

## Accessibilité

Le composant porte le rôle sémantique `checkbox`, et sa valeur sémantique bascule entre `checked`
/ `unchecked` / `disabled` selon l'état. Une pression du pointeur lui donne automatiquement le
focus. L'indicateur ✓ dépend de la couverture de glyphes de la police et sert d'implémentation
provisoire en attendant les assets d'icônes.
