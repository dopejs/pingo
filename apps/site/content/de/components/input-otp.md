---
title: Input OTP
description: Eingabe eines einmaligen Verifizierungscodes mit fester Länge; unterstützt feldweise Eingabe und das Einfügen des gesamten Codes, gerendert auf der pingo-Canvas.
---

# Input OTP

Eingabe eines einmaligen Verifizierungscodes, bestehend aus mehreren Feldern fester Länge. Die folgende Vorschau wird live von der pingo-Engine gerendert – Sie können Zahlen feldweise eingeben, den gesamten Code einfügen und zwischen hellem und dunklem Modus entsprechend dem Theme der Website wechseln.

:::preview input-otp-basic
:::

## Verwendung

```tsx
import { InputOTP } from "@dopejs/pingo-ui";

root.render(
  <InputOTP
    length={6}
    semanticLabel="一次性验证码"
    onValueChange={(value) => console.log(value)}
    onComplete={(code) => verify(code)}
  />,
);
```

Der interne Wert ist eine **Zeichenkette fester Länge, die mit Leerzeichen aufgefüllt wird**: Ein Leerzeichen steht für eine leere Position. `onValueChange` erhält genau diesen aufgefüllten Wert; `onComplete` wird einmal ausgelöst, sobald alle Felder gefüllt sind, und erhält den vollständigen Code ohne Leerzeichen. Einfügen wird als zusammenhängendes Füllen ab dem aktuellen Feld behandelt; Löschen leert nur das aktuelle Feld, ohne nachfolgende Ziffern nach links zu verschieben.

## Beispiele

### Länge

`length` bestimmt die Anzahl der Felder (Standard: 6). Für jedes Feld wird die numerische Bildschirmtastatur verwendet (`inputMode: "numeric"`).

## Props

| Prop            | Typ                       | Standardwert | Beschreibung                                                                                       |
| --------------- | ------------------------- | ------------ | -------------------------------------------------------------------------------------------------- |
| `length`        | `number`                  | `6`          | Anzahl der Felder                                                                                  |
| `value`         | `string`                  | —            | Kontrollierter aktueller Wert (mit Leerzeichen aufgefüllt)                                         |
| `defaultValue`  | `string`                  | —            | Unkontrollierter Anfangswert                                                                       |
| `onValueChange` | `(value: string) => void` | —            | Callback bei Wertänderung; der Wert ist eine mit Leerzeichen aufgefüllte Zeichenkette fester Länge |
| `onComplete`    | `(value: string) => void` | —            | Callback, sobald alle Felder gefüllt sind; der Wert ist der vollständige Code ohne Leerzeichen     |
| `disabled`      | `boolean`                 | `false`      | Deaktiviert alle Felder                                                                            |
| `semanticLabel` | `string`                  | —            | Barrierefreier Name der Gruppe                                                                     |
| `className`     | `string`                  | —            | Wird nach den Komponenten-Klassennamen angehängt                                                   |

## Barrierefreiheit

Die Komponente hat die semantische Rolle `group`; jedes Feld erhält automatisch einen barrierefreien Namen in der Form `Nummer/Gesamtzahl` (z. B. `3/6`). Über `semanticLabel` kann außerdem die gesamte Gruppe benannt werden.
