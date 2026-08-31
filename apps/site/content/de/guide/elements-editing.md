---
title: "Editierbare Elemente: Input und TextArea"
description: "Engine-native Primitive für editierbaren Text — kontrollierter Revision-Transaktionsvertrag, EditContext-Eingabebrücke, Passwort und Nur-Lesen."
---

# Editierbare Elemente: Input und TextArea

`Input` und `TextArea` (in `@dopejs/pingo` als `UnstyledTextArea` exportiert, siehe unten) sind
engine-native Primitive für editierbaren Text: Cursor, Auswahl, IME-Komposition, Zwischenablage und
Rückgängig/Wiederherstellen sind im Core implementiert — **es wird kein einziges
HTML-Eingabeelement über das Canvas gelegt**. Die Vorschau unten ist wirklich eingabefähig: Klicken
Sie hinein und probieren Sie eine IME, Ziehauswahl und Strg+Z aus.

:::preview elements-input
:::

## Verwendung

Kontrollierte Schreibweise: `value` plus eine monoton wachsende `revision`; die vom Core kommenden
Transaktionen werden in `onTransaction` bestätigt:

```tsx
import { Input, type EditTransaction } from "@dopejs/pingo";

let value = "Bestellnotiz";
let revision = 1n;

function applyDelta(current: string, transaction: EditTransaction): string {
  const delta = transaction.delta;
  return delta === undefined
    ? current
    : current.slice(0, delta.range.start) + delta.text + current.slice(delta.range.end);
}

<Input
  value={value}
  revision={revision}
  semanticLabel="Bestellnotiz"
  onTransaction={(transaction) => {
    value = applyDelta(value, transaction);
    revision = transaction.revision;
  }}
/>;
```

Für rein lokalen Zustand können `value` / `revision` auch weggelassen und stattdessen ein
`TextEditingController` verwendet werden (in Hooks-Szenarien `useTextEditingController`);
`controller` und `value`/`revision` schließen sich gegenseitig aus.

## Der Revision-Transaktionsvertrag

Die Besitzverhältnisse sind eindeutig: **Die Schale besitzt die Anwendungsdaten, der Core besitzt
den flüchtigen Zustand der aktiven Bearbeitungssitzung.**

1. Eingaben erreichen den Core, der prüft, ob `base_revision` zur aktuellen Sitzung passt;
2. danach werden sie **sofort angewendet und neu gezeichnet** — kein Tastendruck muss die komplette
   Render-Pipeline durchlaufen;
3. der Core sendet umgekehrt eine versionierte `EditTransaction` heraus;
4. die Schale bestätigt (aktualisiert ihr `value` / `revision`) oder sendet bei fehlgeschlagener
   fachlicher Validierung einen korrigierten Wert mit neuer `revision`. Eine veraltete Revision
   überschreibt niemals neuere Core-Eingaben; die Bestätigung einer bereits aktuellen Revision
   leert den Undo-Stapel nicht.

Die Felder von `EditTransaction`:

| Feld           | Typ                                                         | Beschreibung                                                                                                                  |
| -------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `nodeId`       | `number`                                                    | Der Bearbeitungsknoten, der die Transaktion erzeugt hat                                                                       |
| `baseRevision` | `bigint`                                                    | Die Revision, auf der die Transaktion aufbaut                                                                                 |
| `revision`     | `bigint`                                                    | Die neue Revision nach der Transaktion                                                                                        |
| `delta`        | `{ range: { start, end }, text }`                           | Textdifferenz; Offsets in UTF-16, an EditContext/InputEvent ausgerichtet. Reine Auswahl-Transaktionen haben dieses Feld nicht |
| `selection`    | `{ anchor, focus, anchorAffinity, focusAffinity }`          | Die Auswahl nach der Transaktion                                                                                              |
| `composition`  | `{ start, end }`                                            | Der laufende IME-Kompositionsbereich                                                                                          |
| `kind`         | `"edit" \| "composition" \| "external" \| "undo" \| "redo"` | Art der Transaktion                                                                                                           |

## Eingabebrücke: EditContext und Rückfall-Proxy

Der Hauptthread bindet die Texteingabedienste des Betriebssystems nach Priorität an:

1. **EditContext** — an das Canvas gebunden, empfängt Text/Auswahl/Komposition und meldet der
   Eingabemethode Control, Selection und Zeichengrenzen zurück, sodass das Kandidatenfenster direkt
   am Cursor klebt.
2. **Von der Engine verwalteter Eingabe-Proxy** — steht EditContext nicht zur Verfügung, pflegt der
   Host **ein einziges** global verstecktes `textarea`, das `beforeinput`, Komposition, Bildschirmtastatur
   und Zwischenablage einheitlich behandelt.

Das ist eine plattformbedingte Rückfall-Implementierung, kein EmbedDOM-Komponentenmodell: In der
Scene existiert kein DOM, das jedem Bearbeitungsknoten eins zu eins entspräche. Beide Pfade
durchlaufen dieselben Vertragstests für das Bearbeitungsverhalten.

## Mehrzeilig: die TextArea-Primitive

Die `TextArea`-Primitive teilt sich mit `Input` dasselbe `editableText`-Subsystem; der einzige
Unterschied ist, dass die `multiline`-Invariante von der Komponente fixiert wird. Enter fügt einen
Zeilenumbruch ein, statt `onSubmit` auszulösen; beim zeilenübergreifenden Bewegen mit den
Pfeiltasten wird die Wunschspalte (desired-x) beibehalten.

:::preview elements-textarea
:::

## Props (Input / UnstyledTextArea)

Beide teilen sich `EditableTextProps` (`multiline` ist nicht öffentlich und wird von der Komponente
fixiert):

| Prop            | Typ                            | Standardwert | Beschreibung                                                                                              |
| --------------- | ------------------------------ | ------------ | --------------------------------------------------------------------------------------------------------- |
| `value`         | `string`                       | —            | Kontrollierter Text                                                                                       |
| `revision`      | `number \| bigint`             | —            | Autoritative Revision des kontrollierten Werts; veraltete Werte überschreiben keine neueren Core-Eingaben |
| `controller`    | `TextEditingController`        | —            | Stabiler lokaler Controller; schließt `value`/`revision` aus                                              |
| `readOnly`      | `boolean`                      | `false`      | Nur lesen                                                                                                 |
| `password`      | `boolean`                      | `false`      | Passwortmodus (siehe unten)                                                                               |
| `maxGraphemes`  | `number`                       | —            | Obergrenze für Grapheme                                                                                   |
| `inputMode`     | `EditableInputMode`            | `"text"`     | Hinweis für die Bildschirmtastatur: `decimal` `email` `none` `numeric` `search` `tel` `text` `url`        |
| `onTransaction` | `(t: EditTransaction) => void` | —            | Callback für Core-Bearbeitungstransaktionen                                                               |
| `onSubmit`      | `() => void`                   | —            | Einzeilig: Enter löst Submit aus; mehrzeilig bleibt Enter dem Zeilenumbruch vorbehalten                   |

Die Textdarstellung erbt `TextProps`: `color`, `fontSize`, `fontWeight`, `lineHeight`, `fontFamily`,
`font`; Größe, `padding`, `backgroundColor`, Rahmen (über den `style`-Kanal) usw. stammen aus den
[CommonProps](/api).

## Barrierefreiheit und Privatsphäre

- Bearbeitungsknoten tragen von sich aus die Semantik `textbox`; vergeben Sie den Namen über
  `semanticLabel` (besonders wichtig, wenn es kein sichtbares Label gibt).
- Passwortinhalte werden nur im Core mit Maskenglyphen gezeichnet: Der Klartext gelangt weder in
  DisplayList, Aufzeichnung/Replay, Devtools noch in Barrierefreiheitswerte, und Passwortziele
  schreiben nicht in die Zwischenablage.

Das tiefere Design (Textpositionsmodell, Bidi-Grenzen, Vertragstest-Matrix) steht unter
[Text und Bearbeitung](/guide/editing).
