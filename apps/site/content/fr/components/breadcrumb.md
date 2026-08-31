---
title: Breadcrumb
description: Fil d'Ariane de style shadcn, dont le dernier élément, page courante, n'est pas cliquable, rendu dans le canvas pingo.
---

# Breadcrumb

Fil d'Ariane : chaque élément sauf le dernier est un lien cliquable ; le dernier représente la
page courante — il n'est pas rendu comme un lien et ne propose pas d'action « aller à la position
courante » aux technologies d'assistance. L'aperçu ci-dessous est rendu en direct par le moteur
pingo — cliquez sur les éléments précédents, activez-les au clavier ; il suit le thème
clair/sombre du site.

:::preview breadcrumb-basic
:::

## Utilisation

```tsx
import { Breadcrumb } from "@dopejs/pingo-ui";

root.render(
  <Breadcrumb
    items={[
      { label: "首页", onNavigate: () => navigate("/") },
      { label: "组件", onNavigate: () => navigate("/components") },
      { label: "Breadcrumb" }, // 末项是当前页，无需 onNavigate
    ]}
  />,
);
```

## Exemples

### Séparateur personnalisé

`separator` vaut `/` par défaut et accepte n'importe quel symbole texte (en attendant le jeu
d'icônes, le séparateur est un glyphe texte) :

:::preview breadcrumb-separator
:::

## Props

### BreadcrumbProps

| Prop        | Type                        | Valeur par défaut | Description                                                      |
| ----------- | --------------------------- | ----------------- | ---------------------------------------------------------------- |
| `items`     | `readonly BreadcrumbItem[]` | —                 | Éléments du fil, le dernier étant la page courante (obligatoire) |
| `separator` | `string`                    | `"/"`             | Séparateur entre les éléments                                    |
| `className` | `string`                    | —                 | Ajouté après les classes du composant                            |

### BreadcrumbItem

| Champ        | Type         | Valeur par défaut | Description                                                                                                                                      |
| ------------ | ------------ | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `label`      | `string`     | —                 | Texte de l'élément (obligatoire)                                                                                                                 |
| `onNavigate` | `() => void` | —                 | Callback de clic ; sans lui, l'élément n'a aucun comportement d'activation (le dernier élément, page courante par définition, n'en a pas besoin) |

## Accessibilité

Le fil entier porte la sémantique `navigation` avec le nom « breadcrumb » ; les éléments
cliquables ont la sémantique link, s'activent au clavier avec `Enter` / `Space` et reçoivent le
focus avant le clic. La page courante est rendue en texte simple avec la valeur sémantique
`current` — un lecteur d'écran ne la prend pas pour un lien. Plus de détails dans le
[guide d'accessibilité](/guide/accessibility).
