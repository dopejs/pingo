---
title: "Widgets: ungestylte Engine-Bausteine"
description: "@dopejs/pingo-widgets stellt TextField, TextArea, Pressable, Button und weitere ungestylte Engine-Bausteine bereit, samt Abgrenzung zu @dopejs/pingo-ui."
---

# Widgets: ungestylte Engine-Bausteine

`@dopejs/pingo-widgets` ist die erste Kompositionsschicht oberhalb der Engine: Sie montiert die
[editierbaren Primitiven](/guide/elements-editing) mit Fokus und nativen Events zu brauchbaren
Bausteinen, mit **minimaler** Dekoration (Rahmen, Fehlerzustand) und ohne Annahmen über ein
Designsystem. Anwendungen hängen nicht direkt von diesem internen Paket ab — alle Exporte werden
über `@dopejs/pingo` re-exportiert. Die Vorschau unten rendert in Echtzeit und ist direkt
eingabefähig.

:::preview widgets-textfield
:::

## Exporte und Benennung

| Export      | Beschreibung                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------- |
| `TextField` | Einzeilige Eingabe: Rahmen- und Fehlerzustands-Dekoration, intern nur die `editableText`-Primitive kombiniert |
| `TextArea`  | Mehrzeilige Variante; Enter erzeugt einen Zeilenumbruch, Submit bleibt dem Host-Formular überlassen           |
| `Pressable` | Fokussierbare Aktivierungsfläche: View + Fokus + natives click/tap                                            |
| `Button`    | Convenience-Kombination aus `Pressable` + `Text` für Textbuttons                                              |

Hinweis zur Benennung: `TextArea` in `@dopejs/pingo` bezeichnet dieses dekorierte Widget; die
mehrzeilige **Primitive** wird als `UnstyledTextArea` exportiert (entsprechend heißt der Alias für
`TextAreaProps` `UnstyledTextAreaProps`).

## TextField und TextArea

Die Standarddekoration ist ein 1-px-Rahmen mit 8 px Innenabstand; wird ein `error`-String
übergeben, wechselt der Rahmen in die Fehlerfarbe und unter dem Feld wird eine Fehlerbeschreibung
mit der Rolle `alert` gerendert. Der kontrollierte Vertrag (`value` + `revision` +
`onTransaction`) ist identisch mit den [editierbaren Elementen](/guide/elements-editing) — das
Widget führt keinen neuen Eingabepfad ein.

```tsx
import { createElement, TextField } from "@dopejs/pingo";

createElement(TextField, {
  value,
  revision,
  semanticLabel: "Empfänger",
  width: 320,
  error: value === "" ? "Empfänger darf nicht leer sein" : undefined,
  onTransaction: (t) => apply(t),
});
```

### Props (TextField)

| Prop              | Typ                            | Standardwert             | Beschreibung                                                                         |
| ----------------- | ------------------------------ | ------------------------ | ------------------------------------------------------------------------------------ |
| `value`           | `string`                       | `""`                     | Kontrollierter Text                                                                  |
| `revision`        | `number \| bigint`             | `0n`                     | Autoritative Revision des kontrollierten Werts                                       |
| `controller`      | `TextEditingController`        | —                        | Lokaler Controller; schließt `value`/`revision` aus                                  |
| `readOnly`        | `boolean`                      | —                        | Nur lesen                                                                            |
| `password`        | `boolean`                      | —                        | Passwortmodus (Klartext gelangt weder in DisplayList noch in Barrierefreiheitswerte) |
| `maxGraphemes`    | `number`                       | —                        | Obergrenze für Grapheme                                                              |
| `inputMode`       | `EditableInputMode`            | —                        | Layout-Hinweis für die Bildschirmtastatur                                            |
| `width`           | `number`                       | `240`                    | Gesamtbreite inklusive Rahmen                                                        |
| `height`          | `number`                       | `lineHeight × rows + 16` | Gesamthöhe inklusive Rahmen                                                          |
| `fontSize`        | `number`                       | `14`                     | Schriftgröße                                                                         |
| `lineHeight`      | `number`                       | `round(fontSize × 1.5)`  | Zeilenhöhe                                                                           |
| `color`           | `Color`                        | `#1f2329ff`              | Textfarbe                                                                            |
| `backgroundColor` | `Color`                        | `#ffffffff`              | Feldhintergrund                                                                      |
| `borderColor`     | `Color`                        | `#c0c4ccff`              | Rahmenfarbe                                                                          |
| `errorColor`      | `Color`                        | `#d03050ff`              | Farbe für Fehlerrahmen und Fehlertext                                                |
| `error`           | `string`                       | —                        | Nicht leer = Fehlerzustand: Rahmen in Fehlerfarbe + Fehlertext darunter              |
| `onTransaction`   | `(t: EditTransaction) => void` | —                        | Callback für Core-Bearbeitungstransaktionen                                          |
| `onSubmit`        | `() => void`                   | —                        | Einzeiliges Enter-Submit                                                             |
| `semanticLabel`   | `string`                       | —                        | Barrierefreiheitsname (Rolle ist immer `textbox`)                                    |

`TextArea` ergänzt hier um `rows` (Standard `3`) zur Berechnung der Standardhöhe.

## Pressable und Button

`Pressable` führt keine neue Art von Scene-Knoten ein: Es ist schlicht ein `View` mit
`button`-Semantik, das beim Drücken automatisch den Fokus übernimmt und natives click/tap auf
`onPress` abbildet. Das Styling bestimmen vollständig `style` und `children`; bei `disabled` wird
die Deckkraft reduziert und die Events werden abgehängt.

| Prop               | Typ          | Standardwert                  | Beschreibung                                    |
| ------------------ | ------------ | ----------------------------- | ----------------------------------------------- |
| `children`         | `PingoNode`  | —                             | Inhalt (bei Button `string \| number`, Pflicht) |
| `disabled`         | `boolean`    | `false`                       | Deaktivierter Zustand                           |
| `onPress`          | `() => void` | —                             | Aktivierungs-Callback                           |
| `className`        | `string`     | —                             | Klassenname (ans Stylesheet anschließen)        |
| `style`            | `PingoStyle` | —                             | Inline-Stile                                    |
| `width` / `height` | `number`     | —                             | Größe                                           |
| `semanticLabel`    | `string`     | `Button` übernimmt `children` | Barrierefreiheitsname                           |

`Button` akzeptiert zusätzlich `color` und `fontSize` (werden an den internen Text weitergereicht).

## Abgrenzung zu @dopejs/pingo-ui

Die beiden Schichten beantworten unterschiedliche Fragen:

- **widgets** — Verhaltenskorrektheit: Bearbeitungstransaktionen, Fokus, Semantikrollen, minimale
  Dekoration. Ohne jede Designmeinung; Farben und Schriftgrößen sind vollständig überschreibbar.
- **@dopejs/pingo-ui** — Designsystem: vollständige Komponenten im Sinne von shadcn (Varianten,
  Größen, Themes, Stylesheets), intern aus widgets, `@dopejs/pingo-editing` und Laufzeit-Hooks
  zusammengesetzt, ohne eine einzige Änderung an der Engine.

Empfehlung: Wer ein fertiges Designsystem will, nimmt direkt die
[pingo-ui-Komponenten](/components); wer eine eigene Designsprache hat, aber die
Transaktionsdetails der Bearbeitung nicht anfassen möchte, baut auf widgets auf; wer alles selbst
gestaltet (etwa ein Game-HUD), nutzt direkt die Primitiven der
[Basis-Elemente](/guide/elements).

## Barrierefreiheit

`TextField` / `TextArea` tragen von sich aus die Rolle `textbox`, die `error`-Beschreibung die
Rolle `alert`; `Pressable` / `Button` tragen die Rolle `button`, und `disabled` wird über
`semanticValue` offengelegt. Namen kommen stets aus `semanticLabel` — nicht weglassen, wenn es kein
sichtbares Label gibt. Details unter [Barrierefreiheit](/guide/accessibility).
