---
title: Table
description: Table de données à défilement virtuel, où la définition des colonnes pilote à la fois l’en-tête et les lignes, rendues sur le canvas pingo.
---

# Table

Table à défilement virtuel : la définition des colonnes pilote à la fois l’en-tête et chaque ligne, si bien que le coût de rendu est identique pour dix mille lignes ou pour un seul écran de lignes. L’aperçu ci-dessous est rendu en temps réel par le moteur pingo — vous pouvez faire défiler, cliquer sur les lignes et suivre la bascule entre thème clair et sombre du site.

:::preview table-basic
:::

## Utilisation

`Table` est une fonction de construction pure et non un composant mémo : il suffit de l’appeler directement pour obtenir un nœud de scène. Appelée dans la portée de rendu d’un composant (comme le composant fonction ci-dessous), sa lecture du thème s’abonne alors à la bascule de thème du site.

```tsx
import { createElement, type PingoNode } from "@dopejs/pingo";
import { Table } from "@dopejs/pingo-ui";

type FileRow = { name: string; size: string };

function FileTable(): PingoNode {
  return Table<FileRow>({
    columns: [
      {
        key: "name",
        header: "名称",
        cell: (row) => createElement("text", { value: row.name }),
      },
      {
        key: "size",
        header: "大小",
        width: 96,
        align: "end",
        cell: (row) => createElement("text", { value: row.size }),
      },
    ],
    rowCount: files.length,
    getRow: (index) => files[index],
    onRowPress: (index) => open(files[index]),
  });
}
```

Le corps de la table est une [VirtualList](/guide/scrolling) : le conteneur parent doit définir une hauteur (dans l’exemple, le conteneur externe utilise `height: 260`).

## Exemples

### État vide

Lorsque `rowCount` vaut `0`, `emptyLabel` est rendu (par défaut « 暂无数据 ») et aucune liste virtuelle n’est créée.

:::preview table-empty
:::

## Props

### TableProps\<Row\>

| Prop                 | Type                                                     | Valeur par défaut | Description                                                                                            |
| -------------------- | -------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------ |
| `columns`            | `readonly TableColumn<Row>[]`                            | —                 | Définition des colonnes, pilote à la fois l’en-tête et les lignes (obligatoire)                        |
| `rowCount`           | `number`                                                 | —                 | Nombre total de lignes (obligatoire) ; rend l’état vide lorsque la valeur est `0`                      |
| `getRow`             | `(index: number) => Row`                                 | —                 | Récupère la donnée d’une ligne par son numéro, appelé uniquement pour la fenêtre visible (obligatoire) |
| `estimatedRowHeight` | `number`                                                 | `44`              | Hauteur de ligne estimée, utilisée pour la planification du défilement virtuel                         |
| `onRowPress`         | `(index: number) => void`                                | —                 | Rappel de clic sur une ligne ; lorsqu’il est fourni, les lignes deviennent focalisables                |
| `emptyLabel`         | `string`                                                 | `"暂无数据"`      | Texte de l’état vide                                                                                   |
| `renderHeaderCell`   | `(column: TableColumn<Row>, index: number) => PingoNode` | —                 | Remplace la cellule d’en-tête par défaut d’une colonne donnée                                          |
| `className`          | `string`                                                 | —                 | Ajouté après le nom de classe du composant                                                             |

### TableColumn\<Row\>

| Champ    | Type                                     | Valeur par défaut | Description                                                                                              |
| -------- | ---------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------- |
| `key`    | `string`                                 | —                 | Identifiant de la colonne, utilisé comme clé du nœud (obligatoire)                                       |
| `header` | `string`                                 | —                 | Texte d’en-tête (obligatoire)                                                                            |
| `width`  | `number`                                 | —                 | Largeur fixe (en pixels logiques) ; lorsqu’elle est omise, la largeur restante est répartie selon `flex` |
| `flex`   | `number`                                 | `1`               | Part de la largeur restante lorsque `width` n’est pas défini                                             |
| `align`  | `"start" \| "center" \| "end"`           | `"start"`         | Alignement horizontal du contenu de la colonne, partagé par l’en-tête et les cellules                    |
| `cell`   | `(row: Row, index: number) => PingoNode` | —                 | Fonction de construction du contenu de la cellule (obligatoire)                                          |

Une table virtuelle ne peut pas mesurer la largeur des colonnes d’après leur contenu : les lignes non rendues ne participent pas à la mesure. La largeur des colonnes ne peut donc provenir que de la définition des colonnes — ce qui garantit aussi un alignement naturel entre l’en-tête et les lignes.

## Accessibilité

La table porte la sémantique `table`, l’en-tête correspond à `columnheader` et chaque ligne à `row` ; lorsque `onRowPress` est fourni, les lignes peuvent être focalisées au pointeur et activées. Pour en savoir plus, consultez le [guide d’accessibilité](/guide/accessibility).
