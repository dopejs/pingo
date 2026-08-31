---
title: Combobox
description: Durchsuchbares Dropdown-Auswahlfeld, filtert die Optionsliste bei Eingabe und rendert auf der Pingo-Canvas.
---

# Combobox

Eine Combobox verbindet einen Trigger, der den ausgewählten Wert anzeigt, mit einer durchsuchbaren Optionsliste. Die folgende Vorschau wird live von der Pingo-Engine gerendert – die Liste ist bereits geöffnet, Sie können per Eingabe filtern, mit den Pfeiltasten auswählen und zwischen hellem und dunklem Modus passend zum Website-Theme wechseln.

:::preview combobox-basic
:::

## Verwendung

```tsx
import { Combobox } from "@dopejs/pingo-ui";

root.render(
  <Combobox
    items={[
      { value: "next", label: "Next.js" },
      { value: "remix", label: "Remix" },
      { value: "astro", label: "Astro" },
    ]}
    placeholder="Framework wählen"
    onValueChange={(value) => console.log(value)}
  />,
);
```

`items` ist ein Array aus `{ value, label }`-Objekten; die Filterung ist ein case-insensitiver Teilstring-Abgleich auf `label` – bewusst ohne Fuzzy-Sortierung, denn eine falsche Sortierung ist schlimmer als gar keine. Nach der Auswahl klappt die Liste automatisch zu, und der Suchbegriff wird **beim Schließen** geleert, damit beim erneuten Öffnen kein längst vergessener Filterbegriff stehen bleibt.

## Beispiele

### Kontrolliert

Sowohl `value` / `onValueChange` als auch `open` / `onOpenChange` können kontrolliert werden; standardmäßig verwaltet die Komponente den Zustand selbst über `defaultValue` / `defaultOpen`.

### Leerer Zustand

`emptyLabel` passt den Hinweistext an, der angezeigt wird, wenn die Filterung keine Treffer liefert.

## Props

| Prop            | Typ                                           | Standard         | Beschreibung                                                      |
| --------------- | --------------------------------------------- | ---------------- | ----------------------------------------------------------------- |
| `items`         | `readonly { value: string; label: string }[]` | —                | Optionsliste (erforderlich)                                       |
| `value`         | `string`                                      | —                | Kontrollierter ausgewählter Wert                                  |
| `defaultValue`  | `string`                                      | —                | Unkontrollierter anfänglich ausgewählter Wert                     |
| `onValueChange` | `(value: string) => void`                     | —                | Callback bei Auswahländerung (klappt nach Auswahl automatisch zu) |
| `open`          | `boolean`                                     | —                | Kontrolliertes Öffnen/Schließen                                   |
| `defaultOpen`   | `boolean`                                     | `false`          | Unkontrollierter anfänglicher Öffnungszustand                     |
| `onOpenChange`  | `(open: boolean) => void`                     | —                | Callback bei Öffnen/Schließen                                     |
| `placeholder`   | `string`                                      | `"Bitte wählen"` | Platzhaltertext auf dem Trigger, wenn nichts ausgewählt ist       |
| `emptyLabel`    | `string`                                      | —                | Hinweis bei leerem Filterergebnis                                 |
| `className`     | `string`                                      | —                | Wird an den Komponenten-Klassennamen angehängt                    |

## Barrierefreiheit

Der Trigger hat Button-Semantik und wechselt zwischen `expanded` und `collapsed`. Beim Öffnen der Liste wandert der Fokus in das Suchfeld, die Pfeiltasten bewegen die Hervorhebung, Enter wählt aus und schließt die Liste; nach dem Schließen kehrt der Fokus zum Trigger zurück.
