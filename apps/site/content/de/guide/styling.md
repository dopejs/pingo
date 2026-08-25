---
title: Styling
description: "Das CSS-Subset von pingo: Klassenselektoren, Kaskade und Spezifität, Vererbungsgrenzen sowie die Theme- und Override-Konventionen von pingo-ui."
---

# Styling

Das Styling von pingo ist ein **versioniertes CSS-Subset** (derzeit 1.6.0): CSS-Text wird auf
Shell-Seite geparst und berechnet, der Core konsumiert nur normalisierte, typisierte Werte — CSS-Text
und Selektor-Matching gelangen niemals in den Core. Die vollständige Tabelle unterstützter
Eigenschaften finden Sie unter [CSS-Subset-Unterstützung](/guide/style-support); diese Seite behandelt
Verwendung und Grenzen.

## Stylesheets erstellen und registrieren

Kompilieren Sie CSS-Text mit `createStyleSheet` (wirft `StyleSheetCompileError` bei ungültiger
Eingabe) und registrieren Sie das Ergebnis beim Erstellen des Root:

```ts
import { createElement, createHostedCanvasRoot, createStyleSheet } from "@dopejs/pingo";

const sheet = createStyleSheet(
  `
  .card {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 16px;
  }
  `,
  { sourceName: "app.css" },
);

const root = await createHostedCanvasRoot(canvas, { styleSheets: [sheet] });

root.render(
  createElement("container", {
    className: "card",
    width: 320,
    children: createElement("text", { value: "Hallo", fontSize: 14 }),
  }),
);
```

Wer keine Ausnahmen behandeln möchte, kann `compileStyleSheet` verwenden: Es wirft bei
Autoreneingaben keine Ausnahme, sondern liefert eine stabile Diagnostics-Liste. Stylesheets lassen
sich auch als typsicheres Objekt schreiben (`PingoStyleSheetObject`); die Schlüssel sind
Klassenselektoren mit oder ohne führenden Punkt, die Werte sind `PingoStyle`:

```ts
const sheet = createStyleSheet({
  "card": { backgroundColor: "#ffffffff", borderRadius: 8, padding: 16 },
  "card:hover": { backgroundColor: "#f5f5f5ff" },
});
```

Elemente erhalten Klassen über die Prop `className` (mehrere, durch ASCII-Leerraum getrennte
Klassennamen) und Inline-Deklarationen über die Prop `style` (`PingoStyle`, von der Schale geparst,
bevor sie in den Core gelangt).

## Selektoren und Kaskade

Das Subset unterstützt nur **Klassenselektoren auf demselben Knoten** sowie vier
Pseudoklassen für Interaktionszustände:

- Einzelklasse `.card`; zusammengesetzte Klasse `.pui-card.pui-dark` (trifft nur zu, wenn der Knoten
  alle Klassen trägt).
- Die Zustände `:hover`, `:active`, `:focus`, `:focus-visible`, mit Klassen kombinierbar, etwa
  `.btn:hover`.

Nicht unterstützt: Elementselektoren, Kombinatoren wie Nachfahren-/Kindselektor,
`@media` / `@supports` / `@keyframes`, `var()` / `calc()`. Als Längeneinheiten gibt es nur `px` und
`%` (`em` / `rem` / `vw` / `vh` werden abgelehnt); Farben werden als hex oder
`rgb()` / `rgba()` / `hsl()` / `hsla()` geschrieben (alte und neue Syntax werden akzeptiert),
Farb-Schlüsselwörter (etwa `red`) werden nicht unterstützt.

Die Kaskade ist isomorph zu CSS, aber einfacher:

1. **Spezifität = Anzahl der Klassen + Anzahl der Zustände.** `.pui-card.pui-dark` (2) schlägt
   `.card` (1).
2. **Bei gleicher Spezifität entscheidet die Quellreihenfolge**: später registrierte Stylesheets und
   spätere Regeln innerhalb eines Sheets gewinnen.
3. **Die Inline-Prop `style` schlägt alle Stylesheet-Regeln**; direkte Props am Element (etwa
   `width`, `backgroundColor`) haben die höchste Priorität und schlagen auch `style`.

Beachten Sie die Folgerung aus Regel 2: Ob ein Override greift, hängt von der
**Registrierungsreihenfolge der Stylesheets** ab — nicht von der Reihenfolge der Klassennamen im
`className`-String.

## Vererbung und Grenzen berechneter Stile

Nur wenige Eigenschaften werden vererbt: `color`, `visibility`, `font-family` / `font-size` /
`font-weight` / `font-style`, `line-height`, `text-align`, `white-space`, `overflow-wrap`,
`pointer-events`, `cursor`. Alle übrigen Eigenschaften (einschließlich sämtlicher
Layout-Eigenschaften) beginnen an jedem Knoten mit ihrem Initialwert — was nicht gesetzt ist, ist
nicht da; ein „Breite vom Elternknoten erben" gibt es nicht.

Jede Eigenschaft deklariert ihre Invalidierungsdomäne (Layout / Zeichnen / Hit-Testing / Semantik) im
Schema mit einer einzigen Quelle. `opacity` zu ändern löst kein Neulayout aus, `width` schon; das ist
derselbe Mechanismus wie das Invalidierungsmodell in der [Architektur](/guide/architecture).

### In Interaktionszuständen sind die erlaubten Eigenschaften eingeschränkt

In Zustandsregeln (etwa `.btn:hover`) sind nur maleigenschaften erlaubt: `background-color`,
`color`, `opacity`, die einzelnen `border-*-color`, `border-radius`, `box-shadow`, `visibility`,
`transform` / `transform-origin`, `pointer-events`, `cursor`. Layout-Eigenschaften in einer
Zustandsregel werden bereits zur Kompilierzeit abgelehnt — ein Zustandswechsel darf keine
Layout-Änderung auslösen.

## Wesentliche Abweichungen von CSS

Das Subset zielt bewusst nicht auf vollständige CSS-Kompatibilität. Die wichtigsten Abweichungen
(vollständige Liste unter [CSS-Subset-Unterstützung](/guide/style-support)):

- Der Containing Block von `position: absolute` ist der **Elternknoten**, nicht der nächste
  positionierte Vorfahre; es gibt kein `position: relative`, visuelle Verschiebungen laufen über
  `transform`.
- Es gibt kein `flex-wrap`: Flex-Container sind einzeilig, Überlauf auf der Hauptachse wird
  abgeschnitten oder gescrollt.
- Flex-Items haben keine automatische Mindestgröße und können auf 0 gestaucht werden (entspricht
  `min-width: 0` im Browser); `min-width: auto` / `min-height: auto` schlagen bei der Kompilierung
  direkt fehl.
- Prozentwerte werden zu `0` aufgelöst statt zu `auto`, wenn die Größe auf der Hauptachse unbestimmt
  ist.
- `box-shadow` unterstützt nur äußere Schatten, maximal 4 Ebenen pro Knoten; `inset` wird
  abgelehnt.
- `z-index` ordnet nur zwischen Geschwistern stabil um; es gibt keinen Stacking Context.

## Theme- und Override-Konventionen von pingo-ui

Der Skin der Komponentenbibliothek `@dopejs/pingo-ui` ist ein mit genau diesen Mechanismen
kompiliertes Stylesheet:

```ts
import { createHostedCanvasRoot, createStyleSheet } from "@dopejs/pingo";
import { createPingoUiStyleSheet } from "@dopejs/pingo-ui";

const myOverrides = createStyleSheet(`
  .pui-button { border-radius: 4px; }
`);

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [createPingoUiStyleSheet(), myOverrides], // Reihenfolge nicht umkehren
});
```

- **`createPingoUiStyleSheet()` erzeugt pro Root ein eigenes, unveränderliches Sheet.**
- **Benutzer-Sheets müssen nach dem pingo-ui-Sheet registriert werden**: bei gleicher Spezifität
  entscheidet die Quellreihenfolge, das später Geschriebene gewinnt. Die Prop `className` einer
  Komponente wird hinter die eigenen Klassen der Komponente gehängt (etwa
  `pui-input pui-input--disabled mine`), doch ob ein Override greift, hängt allein von der obigen
  Registrierungsreihenfolge ab.
- Um die Priorität eines Overrides zu erhöhen, nutzen Sie zusammengesetzte Klassen für höhere
  Spezifität (etwa `.pui-button.mine`) statt sich auf die Schreibposition zu verlassen.

### Hell- und Dunkel-Theme

```ts
import { setTheme, useTheme } from "@dopejs/pingo-ui";

setTheme("dark"); // alle abonnierenden Komponenten rendern automatisch neu
useTheme(); // im Render einer Komponente lesen und abonnieren
```

Das Theme ist ein modulweites Signal: `useTheme()` im Render einer Komponente abonniert es
automatisch, `setTheme` löst das Neurendern aller abonnierenden Komponenten aus. Dunkelheit ist über
Compound Classes umgesetzt — im Dark-Theme tragen Komponenten die Markierungsklasse `pui-dark`, und
die zusammengesetzten Regeln `.pui-x.pui-dark` im Skin greifen (etwa `.pui-card.pui-dark`).

**Markenanpassung ist eine Build-Zeit-Entscheidung**: Ein neues Preset entsteht, indem Tokens per
`@use "@dopejs/pingo-ui/styles/tokens" with ($primary: ...)` überschrieben und der Komponenten-Skin
über das Vite-Plugin von `@dopejs/pingo-style-preprocess` neu kompiliert werden — eine andere
Markenfarbe bedeutet einen neuen Build und ist zur Laufzeit nicht umschaltbar. Auch Token-Farben
dürfen nur als hex oder `rgb()` / `rgba()` / `hsl()` / `hsla()` geschrieben werden. Zur SCSS-/Less-
Pipeline siehe den [SCSS-/Less-Leitfaden](/guide/scss-less).
