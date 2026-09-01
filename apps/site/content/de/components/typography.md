---
title: Typography
description: Typografie-Komponenten für Überschriften, Fließtext und Zitate, gezeichnet auf dem pingo-Canvas.
---

# Typography

Ein Typografie-Satz: die Überschriften `H1`–`H4`, der Absatz `P` sowie `Lead`, `Large`,
`Small`, `Muted`, `Blockquote` und `InlineCode`. Die Vorschau unten zeichnet die
pingo-Engine in Echtzeit; sie folgt dem Hell-/Dunkel-Umschalter der Website.

:::preview typography-scale
:::

## Verwendung

```tsx
import { H1, Lead, P } from "@dopejs/pingo-ui";

root.render(
  <View style={{ flexDirection: "column" }}>
    <H1>Rendering-Engine</H1>
    <Lead>TSX auf einem Canvas schreiben, ohne DOM zu erzeugen.</Lead>
    <P>Ein Absatz Fließtext.</P>
  </View>,
);
```

::: warning Sie sind keine umschließenden Container
shadcns Typografie stylt echte `h1`/`p`-Elemente und lässt die Kaskade die Schriftgröße
durch den Teilbaum tragen. In pingo werden Textmetriken **pro Knoten aufgelöst und nicht
vererbt**: Text in ein `H1` zu hüllen macht ihn nicht größer. Jede Komponente ist ein
Textknoten, und `children` nimmt nur eine Zeichenkette.
:::

## Beispiele

### Überschriften und Fließtext

`H1`–`H4` entsprechen shadcns vier Überschriftgrößen; `P` ist der Absatz mit 16px/24px. Die
Vorschau oben zeigt sie der Reihe nach.

### Zitat und Inline-Code

`Blockquote` ist ein Kasten mit einer Linie links, `InlineCode` ein Fragment mit
Hintergrund. Beide bestehen aus zwei Schichten — der Kasten trägt Rahmen und Innenabstand,
der Textknoten Größe und Schnitt — aus dem oben genannten Grund.

:::preview typography-blocks
:::

### Angesagte Ebene und visuelle Stufe trennen

`H1` meldet sich standardmäßig als Ebene 1. Wenn die Gliederung einer Seite auf Ebene 2
beginnen muss, optisch aber die Größe von `H1` gefragt ist, überschreibt `level` das:

```tsx
<H1 level={2}>Optisch H1, in der Gliederung zweite Ebene</H1>
```

## Props

### Überschriften (`H1` / `H2` / `H3` / `H4`)

| Prop        | Typ                          | Standard                 | Beschreibung                               |
| ----------- | ---------------------------- | ------------------------ | ------------------------------------------ |
| `children`  | `string`                     | —                        | Überschriftentext (erforderlich)           |
| `level`     | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | die Stufe der Komponente | Überschreibt die gemeldete Ebene           |
| `className` | `string`                     | —                        | Wird hinter die Komponentenklassen gehängt |

### Die übrigen

`P`, `Lead`, `Large`, `Small`, `Muted`, `Blockquote` und `InlineCode` nehmen nur
`children: string` und `className`.

| Komponente   | Größe / Zeilenhöhe | Zweck                              |
| ------------ | ------------------ | ---------------------------------- |
| `P`          | 16 / 24            | Absatz im Fließtext                |
| `Lead`       | 20 / 28            | Einleitungsabsatz, gedämpfte Farbe |
| `Large`      | 18 / 28            | Eine Stufe betonter Fließtext      |
| `Small`      | 14 / 20            | Sekundärer Text                    |
| `Muted`      | 14 / 20            | Gedämpfter Hinweistext             |
| `Blockquote` | 16 / 24            | Zitat mit Linie links              |
| `InlineCode` | 14 / 20            | Inline-Code mit Hintergrund        |

## Barrierefreiheit

`H1`–`H4` tragen die `heading`-Semantik und geben `aria-level` aus. **Eine Überschrift ohne
Ebene wird von den meisten Screenreadern als Ebene 2 angesagt**, ein H1 und ein H4 klängen
also gleich: Die Ebene gehört zu diesen Komponenten, sie ist nicht optional.

Die übrigen sind reiner Text ohne Rolle — Fließtext soll einen Screenreader nicht an jedem
Absatz anhalten lassen. Wenn sie Bedeutung tragen sollen, setzen Sie sie in einen Container
mit `semanticRole`, statt dem Absatz selbst eine Rolle zu geben.
