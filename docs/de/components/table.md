---
title: Table
description: Virtuell scrollende Datentabelle, deren Spaltendefinition Kopfzeile und Zeilen steuert und die auf der pingo-Canvas gerendert wird.
---

# Table

Virtuell scrollende Tabelle: Die Spaltendefinition steuert sowohl die Kopfzeile als auch jede Zeile. Zehntausend Zeilen verursachen dieselben Rendering-Kosten wie eine Bildschirmseite. Die folgende Vorschau wird von der pingo-Engine in Echtzeit gerendert – Sie können scrollen, Zeilen anklicken und das Farbschema folgt dem Website-Theme.

:::preview table-basic
:::

## Verwendung

`Table` ist eine reine Builder-Funktion und keine Memo-Komponente. Ein direkter Aufruf gibt den Szenenknoten zurück. Rufen Sie die Funktion innerhalb des Render-Scopes einer Komponente auf (wie in der folgenden Funktionskomponente), damit ihre Theme-Abonnements auf Theme-Wechsel der Website reagieren.

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

Der Tabellenkörper ist eine [VirtualList](/guide/scrolling) und benötigt eine vom übergeordneten Container festgelegte Höhe (im Beispiel hat der äußere Container `height: 260`).

## Beispiele

### Leerer Zustand

Wenn `rowCount` `0` ist, wird `emptyLabel` gerendert (Standard: „暂无数据“), und es wird keine virtuelle Liste erstellt.

:::preview table-empty
:::

## Props

### TableProps\<Row\>

| Prop | Typ | Standardwert | Beschreibung |
| --- | --- | --- | --- |
| `columns` | `readonly TableColumn<Row>[]` | — | Spaltendefinition, die Kopfzeile und Zeilen steuert (erforderlich) |
| `rowCount` | `number` | — | Gesamtzahl der Zeilen (erforderlich); bei `0` wird der leere Zustand gerendert |
| `getRow` | `(index: number) => Row` | — | Liefert die Zeilendaten anhand der Zeilennummer; wird nur für das sichtbare Fenster aufgerufen (erforderlich) |
| `estimatedRowHeight` | `number` | `44` | Geschätzte Zeilenhöhe für die virtuelle Scroll-Planung |
| `onRowPress` | `(index: number) => void` | — | Callback bei Zeilenklick; sofern angegeben, werden Zeilen fokussierbar |
| `emptyLabel` | `string` | `"暂无数据"` | Text für den leeren Zustand |
| `renderHeaderCell` | `(column: TableColumn<Row>, index: number) => PingoNode` | — | Ersetzt die Standard-Kopfzelle einer Spalte |
| `className` | `string` | — | Wird an den Komponenten-Klassennamen angehängt |

### TableColumn\<Row\>

| Feld | Typ | Standardwert | Beschreibung |
| --- | --- | --- | --- |
| `key` | `string` | — | Spaltenkennung, als node key verwendet (erforderlich) |
| `header` | `string` | — | Kopfzeilentext (erforderlich) |
| `width` | `number` | — | Feste Breite (logische Pixel); wenn nicht angegeben, wird der verbleibende Platz nach `flex` verteilt |
| `flex` | `number` | `1` | Verteilungsanteil am verbleibenden Platz, wenn `width` nicht gesetzt ist |
| `align` | `"start" \| "center" \| "end"` | `"start"` | Horizontale Ausrichtung des Spalteninhalts; gilt für Kopfzeile und Zellen |
| `cell` | `(row: Row, index: number) => PingoNode` | — | Builder-Funktion für den Zelleninhalt (erforderlich) |

Bei virtuellen Tabellen lassen sich Spaltenbreiten nicht anhand des Inhalts messen: Nicht gerenderte Zeilen werden bei der Messung nicht berücksichtigt. Die Spaltenbreite kann daher nur aus der Spaltendefinition stammen – wodurch Kopfzeile und Zeilen von Natur aus ausgerichtet bleiben.

## Barrierefreiheit

Die Tabelle besitzt die Semantik `table`, die Kopfzeile ist `columnheader` und jede Zeile ist `row`. Wenn `onRowPress` übergeben wird, können Zeilen per Zeiger fokussiert und aktiviert werden. Weitere Informationen finden Sie im [Leitfaden zur Barrierefreiheit](/guide/accessibility).
