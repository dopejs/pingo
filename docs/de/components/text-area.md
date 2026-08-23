---
title: Text Area
description: Mehrzeiliges Texteingabefeld, angetrieben von der pingo-Editier-Engine und auf der Leinwand gerendert.
---

# Text Area

Mehrzeilige Texteingabe für längere Inhalte wie Anmerkungen oder Kurzbiografien. Die folgende Vorschau wird in Echtzeit von der pingo-Engine gerendert – nach einem Klick können Sie tatsächlich mehrzeiligen Text eingeben, und die Darstellung folgt dem Hell-/Dunkel-Thema der Website.

:::preview text-area-basic
:::

## Verwendung

```tsx
import { createElement } from "@dopejs/pingo";
import { TextArea } from "@dopejs/pingo-ui";

root.render(
  createElement(TextArea, {
    semanticLabel: "个人简介",
    width: 360,
    rows: 4,
    onValueChange: (value) => console.log(value),
  }),
);
```

`rows` bestimmt die Anzahl der sichtbaren Zeilen und legt die minimale Höhe der Hülle fest (`rows × Zeilenhöhe + vertikale Innenabstände`). Wie bei [Input](/components/input) muss `TextArea` mit `createElement` als Komponente eingebunden werden. Details zur Bearbeitung finden Sie im [Leitfaden zur Textbearbeitung](/guide/editing).

## Beispiele

### Deaktiviert

Nach Übergabe von `disabled` nimmt das Feld keine Eingaben mehr entgegen und erhält einen Deaktiviert-Stil.

## Props

| Prop            | Typ                                      | Standard | Beschreibung                                                                               |
| --------------- | ---------------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `value`         | `string`                                 | `""`     | Anfangswert bei unkontrollierter Verwendung; wird ignoriert, wenn `controller` gesetzt ist |
| `onValueChange` | `(value: string) => void`                | —        | Wird nach jeder angewendeten Bearbeitungstransaktion mit dem aktuellen Wert aufgerufen     |
| `controller`    | `TextEditingController`                  | —        | Erweiterte Ausweichmöglichkeit: ein vom Aufrufer gehaltener, persistenter Controller       |
| `onTransaction` | `(transaction: EditTransaction) => void` | —        | Roher Rückruf für jede Bearbeitungstransaktion                                             |
| `onSubmit`      | `() => void`                             | —        | Rückruf beim Absenden                                                                      |
| `disabled`      | `boolean`                                | `false`  | Deaktivierter Zustand                                                                      |
| `readOnly`      | `boolean`                                | `false`  | Schreibgeschützter Zustand                                                                 |
| `rows`          | `number`                                 | —        | Anzahl der sichtbaren Zeilen; bestimmt die minimale Höhe der Hülle                         |
| `className`     | `string`                                 | —        | Wird an den Komponenten-Klassennamen angehängt                                             |
| `width`         | `number`                                 | —        | Feste Breite (px)                                                                          |
| `semanticLabel` | `string`                                 | —        | Barrierefreier Name                                                                        |

## Barrierefreiheit

Stellen Sie über `semanticLabel` einen Feldnamen bereit; sowohl `disabled` als auch `readOnly` nehmen das Feld aus der Bearbeitungssequenz. Bekannte, mit Input geteilte Lücken: Derzeit gibt es weder Platzhaltertext noch Fokusring-Stile.
