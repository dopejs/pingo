---
title: "Vektorgrafik: Path und SVG"
description: "Vektorumrisse mit Path und eine SVG-Dokument-Teilmenge — d-Syntax, viewBox-Skalierung, Stroke und currentColor-Icons."
---

# Vektorgrafik: Path und SVG

Vektorgrafik ist in pingo eine erstklassige, von der Engine gezeichnete Fähigkeit: Pfade liegen als
unveränderliche Ressourcen auf Core-Seite, und dasselbe Icon, 50-mal gezeichnet, belegt nur eine
einzige Geometrie. Es gibt zwei Einstiege: `Path` nimmt direkt SVG-Pfaddaten entgegen; `Svg` nimmt
ein ganzes, mit `createSvg` / `loadSvg` geparstes Dokument. Die Vorschau unten wird von der Engine
in Echtzeit gerendert, und die Icon-Farben folgen dem Theme der Website.

:::preview elements-svg-icon
:::

## Path: ein einzelner Umriss

```tsx
import { createElement, Path, View } from "@dopejs/pingo";

createElement(View, {
  style: { color: "#3157dfff" }, // der Umriss zeichnet in der color des Knotens und erbt wie Text
  children: createElement(Path, {
    d: "M20 6 9 17l-5-5",
    viewBox: [0, 0, 24, 24],
    width: 24,
    height: 24,
    strokeWidth: 2,
  }),
});
```

- `d` unterstützt die vollständige SVG-Pfadsyntax (`M L H V C S Q T A Z` sowie die relativen
  Kleinbuchstaben-Formen); Ellipsenbögen `A` werden beim Parsen in kubische Bézierkurven
  umgewandelt — der Core braucht keinen eigenen Kurventyp.
- `viewBox` ist die Box im Autorenraum und wird beim Zeichnen in die Knotenbox skaliert — dieselbe
  Ressource funktioniert in einem 16-px- wie in einem 48-px-Knoten, ohne dass der Aufrufer
  umrechnen muss.
- Ohne `strokeWidth` wird der Umriss gefüllt; ein Wert ungleich null zeichnet einen Stroke dieser
  Breite (Round Cap/Join).
- `geometryTransform` wird vor dem Kodieren in die Geometriepunkte eingebrannt (in SVG-Dokumenten
  verschiebt eine Gruppentransformation die Grafik, nicht die Box, in der sie liegt) und ist etwas
  anderes als die visuelle `transform` des Knotens.

:::preview elements-path
:::

## Svg: die Dokument-Teilmenge

`createSvg(markup)` verwendet einen handgeschriebenen Parser statt `DOMParser` — die Engine muss im
Browser, im Worker und in Headless-Differenztests bitgenau dieselbe Geometrie erzeugen, und
`DOMParser` existiert im Worker nicht. Die Teilmenge ist genau das, was reale Icon-Sets enthalten:

- Formelemente: `path` `circle` `ellipse` `rect` `line` `polyline` `polygon`;
- Strukturelemente: `svg` `g` `title` `desc` `defs` `metadata`;
- Attribute: `fill` `stroke` `stroke-width` `fill-rule` `transform`
  (`translate`/`scale`/`rotate`/`matrix`; skew liegt außerhalb der Teilmenge).

Elemente außerhalb der Teilmenge werden **namentlich abgelehnt** und werfen einen `PingoSvgError` —
der Aufrufer erfährt genau, was verloren ging, statt auf eine leere Box zu starren. Benannte
CSS-Farben werden ebenfalls abgelehnt: Eine halbe Farbtabelle würde einen Teil der Dokumente normal
und einen anderen stillschweigend schwarz rendern. Hex-Farben, `none`, `transparent` und
`currentColor` liegen innerhalb der Teilmenge; `currentColor` wird als „Knotenfarbe erben"
aufgelöst, sodass Icons wie Text dem Theme folgen können (genau das macht die Vorschau).

Die Komponente `Svg` expandiert das Dokument zu **einem Pfadknoten pro Form**, die per absoluter
Positionierung übereinanderliegen; eine Form mit Füllung und Stroke wird zu zwei Knoten — Füllung
und Stroke sind zwei Paints, nicht zwei Hälften eines Knotens.

```ts
import { createSvg, loadSvg, Svg } from "@dopejs/pingo";

const icon = createSvg(`<svg viewBox="0 0 24 24" stroke="currentColor" …>…</svg>`);
createElement(Svg, { source: icon, width: 24, height: 24, style: { color: "#3157df" } });

const remote = await loadSvg("/assets/logo.svg");
```

Für programmatischen Zugriff liefert `PingoSvg.shapes` pro Form das `d`, die `transform`,
Füllung/Stroke und `fillRule`; `shapeData(name, attributes)` wandelt ein einzelnes Formelement in
äquivalente Pfaddaten um.

## Props (Path)

| Prop                | Typ                                                         | Standardwert   | Beschreibung                                                           |
| ------------------- | ----------------------------------------------------------- | -------------- | ---------------------------------------------------------------------- |
| `d`                 | `string`                                                    | —              | SVG-Pfaddaten (Pflicht, nur Pfadsyntax, kein Dokument)                 |
| `viewBox`           | `readonly [number, number, number, number]`                 | —              | Box im Autorenraum, wird in die Knotenbox skaliert                     |
| `strokeWidth`       | `number`                                                    | —              | Ungleich null: Stroke statt Füllung                                    |
| `fillRule`          | `"nonzero" \| "evenodd"`                                    | `"nonzero"`    | Füllregel                                                              |
| `geometryTransform` | `readonly [number, number, number, number, number, number]` | Einheitsmatrix | Transformation, die vor dem Kodieren in die Geometrie eingebrannt wird |

## Props (Svg)

| Prop     | Typ        | Standardwert | Beschreibung                                                |
| -------- | ---------- | ------------ | ----------------------------------------------------------- |
| `source` | `PingoSvg` | —            | Das mit `createSvg` / `loadSvg` geparste Dokument (Pflicht) |

Beide erben [CommonProps](/api) (`width`/`height`, Events, Semantik-Props usw.).

## Barrierefreiheit

Vektorgrafik trägt von sich aus keine Semantik. Dekorative Icons brauchen keine Auszeichnung; ein
klickbarer Icon-Button sollte `semanticRole: "button"` und ein `semanticLabel` erhalten, Details
unter [Barrierefreiheit](/guide/accessibility).
