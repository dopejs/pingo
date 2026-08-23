---
title: Alert Dialog
description: "Bestätigungsdialog für destruktive Aktionen mit eingebautem Abbrechen/Bestätigen-Buttonpaar."
---

# Alert Dialog

Der Bestätigungsdialog ist ein Dialog mit eingebautem „Abbrechen / Bestätigen“-Buttonpaar für die
zweite Bestätigung vor irreversiblen Aktionen. Die Vorschau unten wird von der pingo-Engine in
Echtzeit gerendert und folgt dem Hell-/Dunkel-Theme der Website.

:::preview alert-dialog-basic
:::

## Verwendung

```tsx
import { createElement } from "@dopejs/pingo";
import { AlertDialog } from "@dopejs/pingo-ui";

root.render(
  createElement(AlertDialog, {
    open,
    onOpenChange: (next) => setOpen(next),
    title: "确认退出？",
    description: "未保存的修改将会丢失。",
    onCancel: () => {},
    onAction: () => quit(),
    children: null,
  }),
);
```

Wie jeder Dialog füllt das Overlay seinen eigenen Elterncontainer; hängen Sie es nahe am Wurzelknoten
ein. Beachten Sie: `children` bleibt von `DialogProps` geerbt Pflicht, wird aber von der eingebauten
Titel-/Beschreibungs-/Button-Struktur der Komponente überschrieben — übergeben Sie `null`. Ein Klick
auf Abbrechen oder Bestätigen löst zuerst den jeweiligen Callback aus und fordert dann über
`onOpenChange(false)` das Schließen an; ein Klick auf die Maske schließt ebenfalls.

## Beispiele

### Destruktive Aktion

`destructive` rendert den Bestätigen-Button in der Gefahrenfarbe.

:::preview alert-dialog-destructive
:::

## Props

Erbt `DialogProps` (`open`, `onOpenChange`, `children`, `className`), zusätzlich:

| Prop          | Typ          | Standardwert | Beschreibung                                  |
| ------------- | ------------ | ------------ | --------------------------------------------- |
| `title`       | `string`     | —            | Titel (Pflicht)                               |
| `description` | `string`     | —            | Ergänzende Beschreibung                       |
| `cancelLabel` | `string`     | `"取消"`     | Text des Abbrechen-Buttons                    |
| `actionLabel` | `string`     | `"确定"`     | Text des Bestätigen-Buttons                   |
| `onCancel`    | `() => void` | —            | Abbrechen-Callback (danach wird geschlossen)  |
| `onAction`    | `() => void` | —            | Bestätigen-Callback (danach wird geschlossen) |
| `destructive` | `boolean`    | `false`      | Bestätigen-Button in Gefahrenfarbe            |

## Barrierefreiheit

Trägt Dialog-Semantik; Abbrechen- und Bestätigen-Button stehen beide im Tab-Zyklus, Tastaturnutzer
bleiben nicht im Dialog gefangen.
