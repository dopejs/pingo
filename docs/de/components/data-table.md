---
title: Data Table
description: Virtuell scrollende Tabelle mit sortierbaren Tabellenköpfen. Die Sortierung wird als Callback gemeldet, das Rendering erfolgt auf dem pingo canvas.
---

# Data Table

Erweitert [Table](/components/table) um sortierbare Tabellenköpfe. Die Sortierung wird **gemeldet statt ausgeführt**: Die Komponente informiert über `onSortChange` über den neuen Sortierzustand, und du ordnest die Datenquelle von `getRow` selbst neu – bei virtuellen Tabellen liegen die Zeilendaten häufig auf dem Server oder im Store, und die Komponente materialisiert nicht alle Zeilen nur für die Sortierung. Die folgende Vorschau wird live von der pingo-Engine gerendert: Ein Klick auf die Tabellenköpfe „Mitglieder“, „Commits“ oder „Zuletzt aktiv“ wechselt zyklisch zwischen aufsteigend → absteigend → aufgehoben und folgt dem Hell-/Dunkeldesign der Website.

:::preview data-table-sortable
:::

## Verwendung

```tsx
import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
import { DataTable, type SortState } from "@dopejs/pingo-ui";

function MemberTable(): PingoNode {
  const sort = useSignal<SortState | undefined>(undefined);
  const current = sort.get();
  const rows = sortMembers(members, current); // Datenquelle selbst neu ordnen
  return DataTable<Member>({
    columns: [
      {
        key: "name",
        header: "Mitglieder",
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

Ein Klick auf eine bereits sortierte Spalte wechselt zyklisch zwischen aufsteigend → absteigend → aufgehoben (Regel von `nextSort`). Der dritte Zustand existiert, weil Nutzer, die versehentlich sortiert haben, einen Weg zurück zur ursprünglichen Datenreihenfolge benötigen. Wie bei Table ist der Tabellenkörper eine virtuelle Liste; das übergeordnete Containerelement muss eine Höhe vorgeben.

## Props

### DataTableProps\<Row\>

Erbt alle Felder von `TableProps<Row>` (`columns` wird durch eine sortierbare Version ersetzt):

| Prop | Typ | Standard | Beschreibung |
| --- | --- | --- | --- |
| `columns` | `readonly DataTableColumn<Row>[]` | — | Spaltendefinition (erforderlich), besitzt gegenüber `TableColumn` ein zusätzliches `sortable` |
| `sort` | `SortState` | — | Aktueller Sortierzustand; wird er weggelassen, ist nichts sortiert |
| `onSortChange` | `(sort: SortState \| undefined) => void` | — | Callback bei Sortierungsänderung; `undefined` bedeutet, dass die Sortierung aufgehoben wird. Ohne Angabe sind die Tabellenköpfe nicht anklickbar |
| `rowCount` | `number` | — | Gesamtzahl der Zeilen (erforderlich) |
| `getRow` | `(index: number) => Row` | — | Liefert die Zeilendaten anhand der Zeilennummer (erforderlich) |
| `estimatedRowHeight` | `number` | `44` | Geschätzte Zeilenhöhe |
| `onRowPress` | `(index: number) => void` | — | Callback bei Zeilenklick |
| `emptyLabel` | `string` | `"Keine Daten"` | Text für den Leerzustand |
| `renderHeaderCell` | `(column, index) => PingoNode` | — | Existiert im Typ, wird aber intern für den sortierbaren Tabellenkopf verwendet; eine Übergabe wird überschrieben |
| `className` | `string` | — | Wird an den Komponenten-Klassennamen angehängt |

### DataTableColumn\<Row\>

Erweiterung von `TableColumn<Row>` mit folgender Ergänzung:

| Feld | Typ | Standard | Beschreibung |
| --- | --- | --- | --- |
| `sortable` | `boolean` | `false` | Gibt an, ob der Tabellenkopf per Klick sortierbar ist |

### SortState

| Feld | Typ | Beschreibung |
| --- | --- | --- |
| `key` | `string` | `key` der sortierten Spalte |
| `direction` | `"ascending" \| "descending"` | Sortierrichtung |

Der Tabellenkopf der aktuell sortierten Spalte erhält eine Anzeige mit `▲` / `▼`.

## Barrierefreiheit

Tabellenkopfzellen besitzen die Semantik `columnheader`; der Sortierzustand sortierbarer Spalten (`ascending` / `descending` / `none`) wird assistiven Technologien über semantische Werte zugänglich gemacht. Vor dem Klick wird zunächst der Tabellenkopf fokussiert. Weitere Informationen im [Leitfaden zur Barrierefreiheit](/guide/accessibility).
