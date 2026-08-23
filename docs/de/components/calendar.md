---
title: Calendar
description: "Monatskalender im shadcn-Stil mit festem Sechs-Zeilen-Raster; Datumsangaben als Jahr-Monat-Tag-Teile, damit keine Zeitzone sie verschiebt."
---

# Calendar

Monatskalender im shadcn-Stil. Datumsangaben bestehen aus den drei Teilen `{ year, month, day }`
(`month` beginnt bei 1), sodass keine Zeitzone das Datum verschieben kann; das Raster hat immer
sechs Zeilen, und beim Monatswechsel bleibt die Komponentenhöhe konstant. Die Vorschau unten wird
von der pingo-Engine in Echtzeit gerendert — klicken Sie, um ein Datum zu wählen, blättern Sie mit
den Pfeilen durch die Monate; die Vorschau folgt dem Hell-/Dunkel-Theme der Website.

:::preview calendar-basic
:::

## Verwendung

Die Auswahl ist **kontrolliert**: Ein Klick auf ein Datum löst `onSelect` aus, und Sie schreiben
`value` zurück. Der angezeigte Monat kann dagegen intern verwaltet werden (`defaultMonth`) oder über
`month` + `onMonthChange` vollständig kontrolliert sein.

```tsx
import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
import { Calendar, type CalendarDate } from "@dopejs/pingo-ui";

function DateField(): PingoNode {
  const selected = useSignal<CalendarDate>({ year: 2026, month: 8, day: 22 });
  return createElement(Calendar, {
    defaultMonth: { year: 2026, month: 8, day: 1 },
    value: selected.get(),
    onSelect: (date) => selected.set(date),
  });
}
```

## Beispiele

### Deaktivierte Tage

`isDisabled` entscheidet pro Datum, ob es wählbar ist; deaktivierte Tage reagieren weder auf Zeiger
noch auf Tastatur. Das Beispiel deaktiviert die Wochenenden:

:::preview calendar-disabled
:::

## Props

### CalendarProps

| Prop | Typ | Standardwert | Beschreibung |
| --- | --- | --- | --- |
| `value` | `CalendarDate` | — | Gewähltes Datum (kontrolliert) |
| `month` | `CalendarDate` | — | Angezeigter Monat (kontrolliert); ohne Angabe intern verwaltet |
| `defaultMonth` | `CalendarDate` | `value` ?? Januar 2026 | Anfangsmonat im unkontrollierten Modus |
| `onSelect` | `(date: CalendarDate) => void` | — | Callback beim Anklicken eines Datums |
| `onMonthChange` | `(month: CalendarDate) => void` | — | Callback beim Monatswechsel (kontrolliert wie unkontrolliert) |
| `weekdayLabels` | `readonly string[]` | `["日","一","二","三","四","五","六"]` | Wochentag-Köpfe, beginnend mit Sonntag |
| `monthLabel` | `(month: CalendarDate) => string` | Format `"2026 年 8 月"` | Eigener Monatstitel |
| `isDisabled` | `(date: CalendarDate) => boolean` | — | Bestimmte Tage deaktivieren |
| `className` | `string` | — | Wird hinter die Komponentenklassen gehängt |

### CalendarDate

| Feld | Typ | Beschreibung |
| --- | --- | --- |
| `year` | `number` | Jahr |
| `month` | `number` | Monat, 1–12 |
| `day` | `number` | Tag, 1–31 |

Das Paket exportiert außerdem reine Funktionen wie `daysInMonth`, `monthGrid`, `shiftMonth` und
`sameDate` für eigene Datumslogik.

## Barrierefreiheit

Der Kalender als Ganzes trägt die Semantik `group`; die Blätterpfeile heißen "previous month" /
"next month", Datumszellen haben Button-Semantik, und der gewählte Tag trägt den Semantikwert
`selected`. Per Tastatur blättern `PageUp` / `PageDown` von jeder Position im Raster aus durch die
Monate — Tastaturnutzer bleiben nicht im aktuellen Monat gefangen. Mehr im
[Barrierefreiheits-Leitfaden](/guide/accessibility).
