---
title: Input
description: Einzeiliges Texteingabefeld, das von der pingo-Editier-Engine angetrieben und auf der Canvas gerendert wird.
---

# Input

Einzeilige Texteingabe. Die folgende Vorschau wird von der pingo-Engine in Echtzeit gerendert – nach einem Klick kann tatsächlich eingegeben, ausgewählt und gelöscht werden, und das Theme wechselt passend zur Website zwischen hell und dunkel.

:::preview input-basic
:::

## Verwendung

```tsx
import { createElement } from "@dopejs/pingo";
import { Input } from "@dopejs/pingo-ui";

root.render(
  createElement(Input, {
    semanticLabel: "E-Mail",
    width: 320,
    onValueChange: (value) => console.log(value),
  }),
);
```

`Input` pflegt intern über Hooks einen stabilen `TextEditingController`. Daher muss die Komponente mit `createElement(Input, props)` als Komponente gemountet werden und darf nicht direkt als Funktion aufgerufen werden. Details zum Bearbeiten finden Sie im [Leitfaden zur Textbearbeitung](/guide/editing).

## Beispiele

### Präfix, Suffix und Passwort

Die Slots `prefix`/`suffix` können Symbole oder Einheiten aufnehmen; `password` aktiviert die maskierte Eingabe; `disabled` sperrt das gesamte Feld.

:::preview input-adornments
:::

### Kontrollierte Verwendung

Wenn Sie einen eigenen `controller` übergeben, wechselt die Komponente in den kontrollierten Modus. In diesem Fall wird `value` nur als Anfangswert verwendet und anschließend ignoriert; der Aufrufer besitzt den Controller und behält dieselbe Instanz über Rendervorgänge hinweg bei.

## Props

| Prop | Typ | Standard | Beschreibung |
| --- | --- | --- | --- |
| `value` | `string` | `""` | Anfangswert bei unkontrollierter Verwendung; wird ignoriert, sobald `controller` gesetzt ist |
| `onValueChange` | `(value: string) => void` | — | Wird nach jeder angewendeten Bearbeitungstransaktion mit dem neuesten Wert aufgerufen |
| `controller` | `TextEditingController` | — | Erweiterte Ausweichmöglichkeit: ein vom Aufrufer gehaltener, persistenter Controller |
| `onTransaction` | `(transaction: EditTransaction) => void` | — | Roher Rückruf für jede Bearbeitungstransaktion |
| `onSubmit` | `() => void` | — | Rückruf beim Absenden (Eingabetaste) |
| `disabled` | `boolean` | `false` | Deaktivierter Zustand |
| `readOnly` | `boolean` | `false` | Schreibgeschützter Zustand |
| `password` | `boolean` | `false` | Maskierte Eingabe |
| `inputMode` | `"decimal" \| "email" \| "none" \| "numeric" \| "search" \| "tel" \| "text" \| "url"` | `"text"` | Hinweis für das Tastaturlayout auf dem Bildschirm |
| `className` | `string` | — | Wird an den Komponentenklassennamen angehängt |
| `width` | `number` | — | Feste Breite (px) |
| `semanticLabel` | `string` | — | Barrierefreier Name |
| `prefix` | `PingoNode` | — | Vorangestellte Dekoration, z. B. Symbol oder Währungssymbol |
| `suffix` | `PingoNode` | — | Nachgestellte Dekoration, z. B. Einheit oder Lösch-Schaltfläche |

## Barrierefreiheit

Stellen Sie den Feldnamen über `semanticLabel` bereit; sowohl `disabled` als auch `readOnly` entfernen das Feld aus der Bearbeitungssequenz. Derzeit bekannte Lücken: Es gibt noch keinen Platzhaltertext (placeholder) und keinen Fokusring-Stil.
