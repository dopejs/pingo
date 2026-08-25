---
title: Date Picker
description: Aufklappbarer Kalender-Selektor für gebundene Daten, gerendert auf der pingo canvas.
---

# Date Picker

Der Datumsselektor ist ein an einen Wert gebundener [Calendar](/components/calendar): ein Trigger plus ein aufklappbarer Monatskalender. Die folgende Vorschau wird live von der pingo-Engine gerendert – der Kalender ist bereits ausgeklappt, Sie können blättern, Daten auswählen und zwischen hellem und dunklem Theme der Website wechseln.

:::preview date-picker-basic
:::

## Verwendung

```tsx
import { createElement } from "@dopejs/pingo";
import { DatePicker, type CalendarDate } from "@dopejs/pingo-ui";

root.render(
  createElement(DatePicker, {
    placeholder: "选择日期",
    onSelect: (date: CalendarDate) => console.log(date),
  }),
);
```

Daten werden als `CalendarDate` (`{ year, month, day }`) dargestellt – in Felder aufgeteilt gespeichert, sodass keine Zeitzone sie um einen Tag verschieben kann. Nach der Auswahl eines Datums klappt das Popover automatisch zu: Bleibt der Selektor geöffnet, handelt es sich lediglich um einen Kalender.

## Beispiele

### Formatierung und Platzhalter

Der Trigger zeigt das ausgewählte Datum standardmäßig als `YYYY-MM-DD` an; mit `format` lässt sich das Rendering anpassen, mit `placeholder` der Platzhaltertext, wenn nichts ausgewählt ist.

### Kontrolliertes Öffnen und Schließen

`open` und `onOpenChange` bilden das kontrollierte Öffnen und Schließen; ohne diese verwaltet die Komponente den Zustand selbst.

## Props

| Prop            | Typ                               | Standardwert                           | Beschreibung                                                      |
| --------------- | --------------------------------- | -------------------------------------- | ----------------------------------------------------------------- |
| `value`         | `CalendarDate`                    | —                                      | Ausgewähltes Datum                                                |
| `month`         | `CalendarDate`                    | —                                      | Kontrollierter Anzeigemonat                                       |
| `defaultMonth`  | `CalendarDate`                    | `value ?? 2026-01-01`                  | Nicht kontrollierter Anfangsmonat                                 |
| `onSelect`      | `(date: CalendarDate) => void`    | —                                      | Callback bei Datumsauswahl (anschließend automatisches Zuklappen) |
| `onMonthChange` | `(month: CalendarDate) => void`   | —                                      | Callback beim Blättern                                            |
| `weekdayLabels` | `readonly string[]`               | `["日","一","二","三","四","五","六"]` | Wochentags-Kopfzeile                                              |
| `monthLabel`    | `(month: CalendarDate) => string` | —                                      | Benutzerdefinierter Monatstitel                                   |
| `isDisabled`    | `(date: CalendarDate) => boolean` | —                                      | Bestimmte Daten deaktivieren                                      |
| `open`          | `boolean`                         | —                                      | Kontrolliertes Öffnen/Schließen                                   |
| `onOpenChange`  | `(open: boolean) => void`         | —                                      | Callback beim Öffnen/Schließen                                    |
| `placeholder`   | `string`                          | `"选择日期"`                           | Platzhaltertext, wenn nichts ausgewählt ist                       |
| `format`        | `(date: CalendarDate) => string`  | `formatDate`（`YYYY-MM-DD`）           | Datums-Rendering im Trigger                                       |
| `className`     | `string`                          | —                                      | Wird nach dem Komponenten-Klassennamen angehängt                  |

## Barrierefreiheit

Der Trigger hat Button-Semantik und wechselt zwischen `expanded` und `collapsed`; der Kalenderteil übernimmt die Raster-Semantik des Calendar. Beim Öffnen des Popovers wandert der Fokus in das Panel, beim Zuklappen zurück zum Trigger.
