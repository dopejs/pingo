---
title: Table de données
description: Tableau à défilement virtuel avec en-têtes triables, le tri étant remonté sous forme de rappel et le rendu effectué sur le canevas pingo.
---

# Table de données

Ajoute des en-têtes triables au-dessus de [Table](/components/table). Le tri est **remonté et non exécuté** : le composant signale le nouvel état de tri via `onSortChange`, et c’est à vous de réorganiser la source de données de `getRow` — pour un tableau virtuel, les données de ligne se trouvent souvent côté serveur ou dans un store, et le composant ne matérialise pas toutes les lignes uniquement pour trier. L’aperçu ci-dessous est rendu en temps réel par le moteur pingo : cliquez sur les en-têtes « Membre », « Commits » ou « Dernière activité » pour parcourir le cycle croissant → décroissant → annulé, tout en suivant le thème clair ou sombre du site.

:::preview data-table-sortable
:::

## Utilisation

```tsx
import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
import { DataTable, type SortState } from "@dopejs/pingo-ui";

function MemberTable(): PingoNode {
  const sort = useSignal<SortState | undefined>(undefined);
  const current = sort.get();
  const rows = sortMembers(members, current); // réorganisez vous-même la source de données
  return DataTable<Member>({
    columns: [
      {
        key: "name",
        header: "Membre",
        sortable: true,
        cell: (row) => createElement("text", { value: row.name }),
      },
      {
        key: "commits",
        header: "Commits",
        width: 80,
        align: "end",
        sortable: true,
        cell: (row) => createElement("text", { value: String(row.commits) }),
      },
    ],
    sort: current,
    onSortChange: (next) => sort.set(next),
    rowCount: rows.length,
    getRow: (index) => rows[index],
  });
}
```

Cliquer sur une colonne déjà triée suit le cycle croissant → décroissant → annulé (règle de `nextSort`) ; le troisième état existe parce qu’un utilisateur qui déclenche un tri par erreur a besoin d’un moyen de revenir à l’ordre d’origine des données. Comme pour Table, le corps du tableau est une liste virtuelle et le conteneur parent doit avoir une hauteur définie.

## Props

### DataTableProps\<Row\>

Hérite de tous les champs de `TableProps<Row>` (`columns` est remplacé par une version triable) :

| Prop | Type | Valeur par défaut | Description |
| --- | --- | --- | --- |
| `columns` | `readonly DataTableColumn<Row>[]` | — | Définition des colonnes (obligatoire), avec un champ `sortable` en plus par rapport à `TableColumn` |
| `sort` | `SortState` | — | État de tri actuel ; omis signifie non trié |
| `onSortChange` | `(sort: SortState \| undefined) => void` | — | Rappel de changement de tri ; `undefined` signifie que le tri est annulé. Si ce rappel n’est pas fourni, les en-têtes ne sont pas cliquables |
| `rowCount` | `number` | — | Nombre total de lignes (obligatoire) |
| `getRow` | `(index: number) => Row` | — | Renvoie les données d’une ligne à partir de son numéro (obligatoire) |
| `estimatedRowHeight` | `number` | `44` | Hauteur de ligne estimée |
| `onRowPress` | `(index: number) => void` | — | Rappel de clic sur une ligne |
| `emptyLabel` | `string` | `"Aucune donnée"` | Texte de l’état vide |
| `renderHeaderCell` | `(column, index) => PingoNode` | — | Existe dans les types, mais le composant l’utilise en interne pour implémenter les en-têtes triables ; toute valeur fournie sera écrasée |
| `className` | `string` | — | Ajouté après le nom de classe du composant |

### DataTableColumn\<Row\>

Extension de `TableColumn<Row>`, avec en plus :

| Champ | Type | Valeur par défaut | Description |
| --- | --- | --- | --- |
| `sortable` | `boolean` | `false` | Indique si l’en-tête est cliquable pour trier |

### SortState

| Champ | Type | Description |
| --- | --- | --- |
| `key` | `string` | La `key` de la colonne triée |
| `direction` | `"ascending" \| "descending"` | Direction du tri |

L’en-tête de la colonne actuellement triée porte un indicateur `▲` / `▼`.

## Accessibilité

Les cellules d’en-tête ont la sémantique `columnheader` ; l’état de tri des colonnes triables (`ascending` / `descending` / `none`) est exposé aux technologies d’assistance via la valeur sémantique, et l’en-tête reçoit le focus avant le clic. Voir le [guide d’accessibilité](/guide/accessibility) pour en savoir plus.
