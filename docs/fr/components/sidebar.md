---
title: Sidebar
description: "Barre latérale de navigation produit : groupes, entrées et état sélectionné, rendu sur le canevas pingo."
---

# Sidebar

Sidebar est une colonne de navigation au niveau de l’application, composée de sections (Section) et d’entrées (Item), avec état sélectionné et navigation au clavier intégrés. L’aperçu ci-dessous est rendu en temps réel par le moteur pingo — cliquez sur une entrée ou utilisez les flèches après avoir mis le focus.

:::preview sidebar-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { Sidebar, SidebarItem, SidebarSection } from "@dopejs/pingo-ui";

root.render(
  createElement(Sidebar, {
    defaultValue: "stats",
    onValueChange: (value) => navigate(value),
    children: [
      createElement(SidebarSection, {
        title: "工作区",
        children: [
          createElement(SidebarItem, { value: "home", label: "首页" }),
          createElement(SidebarItem, { value: "stats", label: "统计" }),
        ],
      }),
      createElement(SidebarSection, {
        title: "系统",
        children: createElement(SidebarItem, { value: "settings", label: "设置" }),
      }),
    ],
  }),
);
```

`Sidebar` prend en charge à la fois le mode non contrôlé (`defaultValue`) et le mode contrôlé (`value` + `onValueChange`). La largeur de la barre latérale est déterminée par le jeton de thème (240px par défaut).

## Props

### Sidebar

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | — | Contrôlé : `value` de l’entrée actuellement sélectionnée |
| `defaultValue` | `string` | — | Non contrôlé : `value` de l’entrée sélectionnée initialement |
| `onValueChange` | `(value: string) => void` | — | Rappel lors du changement de sélection |
| `children` | `PingoNode` | — | Liste de `SidebarSection` (obligatoire) |
| `className` | `string` | — | Ajouté après le nom de classe du composant |

### SidebarSection

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | — | Titre du groupe ; s’il est omis, la ligne de titre n’est pas rendue |
| `children` | `PingoNode` | — | Liste de `SidebarItem` (obligatoire) |
| `className` | `string` | — | Ajouté après le nom de classe du composant |

### SidebarItem

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | — | Identifiant unique de l’entrée (obligatoire) |
| `label` | `string` | — | Texte de l’entrée, également utilisé comme nom accessible (obligatoire) |
| `icon` | `PingoNode` | — | Emplacement avant, pour une icône |
| `className` | `string` | — | Ajouté après le nom de classe du composant |

## Accessibilité

La barre latérale possède la sémantique navigation ; les entrées possèdent la sémantique lien, avec `label` comme nom accessible, et exposent l’état sélectionné/non sélectionné. Les flèches haut/bas et Home/End permettent de se déplacer entre les entrées ; la sélection se déplace avec le focus.

Pour personnaliser la largeur de la barre latérale et les couleurs, consultez le [guide de style](/guide/styling).
