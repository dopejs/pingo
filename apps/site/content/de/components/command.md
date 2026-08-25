---
title: Command
description: Durchsuchbare, filterbare Befehlspalette mit Tastaturauswahl und Bestätigung per Eingabetaste.
---

# Command

Command ist eine Befehlspalette mit Suchfeld: Eingaben filtern Einträge sofort, Pfeiltasten bewegen den Cursor, die Eingabetaste bestätigt. Die folgende Vorschau wird von der pingo-Engine in Echtzeit gerendert – tippen Sie einfach in das Suchfeld, um zu filtern, und folgen Sie dem Hell-/Dunkelthema der Website.

:::preview command-basic
:::

## Verwendung

```tsx
import { createElement } from "@dopejs/pingo";
import { Command } from "@dopejs/pingo-ui";

root.render(
  createElement(Command, {
    items: [
      { value: "open", label: "打开文件" },
      { value: "save", label: "保存文件" },
    ],
    onSelect: (value) => run(value),
    onDismiss: () => closePalette(),
  }),
);
```

Die Filterung erfolgt über eine Teilstringsuche in Labels ohne Beachtung der Groß-/Kleinschreibung – bewusst kein Fuzzy-Matching: Die Sortierstrategie ist eine Produktentscheidung, die die Komponente dem Aufrufer nicht abnimmt. `onDismiss` reagiert auf `Escape`, wenn keine Navigationstaste getroffen wird – geeignet, um die Palette in einen Dialog einzubetten und ein „⌘K“-Erlebnis zu realisieren.

## Props

| Prop          | Typ                       | Standardwert | Beschreibung                                                  |
| ------------- | ------------------------- | ------------ | ------------------------------------------------------------- |
| `items`       | `readonly CommandItem[]`  | —            | Befehlseinträge (erforderlich)                                |
| `onSelect`    | `(value: string) => void` | —            | Callback bei Auswahl eines Eintrags (Klick oder Eingabetaste) |
| `onDismiss`   | `() => void`              | —            | Callback für `Escape`                                         |
| `placeholder` | `string`                  | `"搜索"`     | Barrierefreier Name des Suchfelds                             |
| `emptyLabel`  | `string`                  | `"无结果"`   | Hinweistext, wenn die Filterung keine Treffer ergibt          |
| `className`   | `string`                  | —            | Zusätzliche Klassenbezeichnung                                |

### CommandItem

| Feld    | Typ      | Beschreibung                             |
| ------- | -------- | ---------------------------------------- |
| `value` | `string` | Eintragswert (erforderlich)              |
| `label` | `string` | Anzeige- und Abgleichtext (erforderlich) |

## Barrierefreiheit

Der Container besitzt die Semantik einer Suche, Einträge besitzen die Semantik einer Option und legen den Zustand „selected“ offen; die Pfeiltasten Hoch/Runter bewegen den Cursor, `Enter` bestätigt, `Escape` löst `onDismiss` aus.
