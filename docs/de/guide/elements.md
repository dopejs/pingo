---
title: "Basis-Elemente: View, Text und Image"
description: "View-Container mit Flex-Layout, Text-Rendering mit Text und Bitmaps mit Image sowie explizite Schriften über PingoFont."
---

# Basis-Elemente: View, Text und Image

Die Host-Elemente von pingo entsprechen direkt Scene-Knoten — ohne den Aufwand einer CSS-Kaskade
oder eines Selektor-Matchings (Styling-Fähigkeiten siehe [Styling](/guide/styling)). Diese Seite
behandelt die drei grundlegendsten Elemente: die allgemeine Box `View`, `Text` für Text und `Image`
für Bitmaps. Die Vorschau unten wird von der pingo-Engine in Echtzeit gerendert und folgt dem
Hell-/Dunkel-Theme der Website.

:::preview elements-layout
:::

## View und Layout

`View` ist die allgemeine Gruppierungsbox (entspricht dem Host-Element `container`) und führt keine
neue Art von Scene-Knoten ein:

- `width` / `height` / `minWidth` / `maxWidth` / `padding` / `backgroundColor` / `opacity` /
  `transform` sind direkte Props; `padding` akzeptiert eine Zahl oder ein Vierertupel
  `[oben, rechts, unten, links]`.
- `flexDirection`, `justifyContent`, `alignItems`, Rahmen und Eckenradien laufen über den
  Inline-Kanal `style` (typisiertes CSS-Subset, siehe [Styling](/guide/styling)).
- Abstände zwischen Kindern werden mit Containern fester Größe explizit ausgedrückt — genau so sind
  die Helfer `row` / `column` in der Vorschau umgesetzt.

## Verwendung

```tsx
import { createElement, Text, View } from "@dopejs/pingo";

root.render(
  createElement(View, {
    width: 420,
    padding: 16,
    backgroundColor: "#ffffffff",
    style: { flexDirection: "column", borderRadius: 10 },
    children: [
      createElement(Text, { value: "Überschrift", fontSize: 24, lineHeight: 32, fontWeight: 700 }),
      createElement(View, { height: 8 }),
      createElement(Text, { value: "Fließtext", fontSize: 14, lineHeight: 22 }),
    ],
  }),
);
```

## Text: der Textlauf

Shaping, Umbruch und Messung von Text übernimmt vollständig der Core — gemischter chinesischer und
englischer Text, Emoji und kombinierende Zeichen erfordern keinerlei Mitwirkung der Schale. Der
Inhalt wird über `value` oder als String-`children` angegeben.

:::preview elements-text
:::

### Props (Text)

| Prop | Typ | Standardwert | Beschreibung |
| --- | --- | --- | --- |
| `value` | `string` | — | Textinhalt (alternativ zu `children`) |
| `children` | `string \| number` | — | Textinhalt |
| `color` | `Color` | `#000000ff` | Textfarbe, vererbbar |
| `fontSize` | `number` | — | Schriftgröße (logische Pixel) |
| `lineHeight` | `number` | — | Zeilenhöhe (logische Pixel) |
| `fontWeight` | `number` | — | Schriftgewicht |
| `fontFamily` | `string` | — | CSS-Schriftfamilie |
| `font` | `PingoFont` | — | Explizite unveränderliche Schrift; nicht unterstützte Eingaben fallen komplett zurück |

`Text` erbt außerdem alle [CommonProps](/api) (Größe, Padding, Events, `semanticRole` /
`semanticLabel` usw.).

## Image: Bitmaps

Die `source` von `Image` ist ein `PingoImage` — eine auf Shell-Seite gehaltene **unveränderliche
RGBA8-Bitmap**, die an der Commit-Grenze synchron als Scene-Ressource inline übergeben wird. Erzeugt
wird sie mit `createImage`, das die Pixel kopiert und validiert:

```ts
import { createImage, Image } from "@dopejs/pingo";

const icon = createImage(pixels, 96, 96, { label: "App-Symbol" });
createElement(Image, { source: icon, width: 48, height: 48 });
```

Ohne `width` / `height` übernimmt der Knoten die Pixelgröße des Bildes; mit Angaben wird das Bild in
die Knotenbox skaliert. `label` ist der Barrierefreiheitsname; leer bedeutet ein rein dekoratives
Bild.

:::preview elements-image
:::

Pixel statt kodierter Bytes sind eine bewusste Abwägung: Die Ressourcen-Transaktion greift synchron
an der Commit-Grenze, während jedes Kodierungsformat ein asynchrones Dekodieren erforderte. Kleine
Bilder wie Listen-Thumbnails passen zu diesem Pfad; große Bilder sollten über den kodierungsbasierten
Pfad mit asynchronem Staging laufen.

## Schriften: PingoFont und loadFont

Die Prop `font` von `Text` und den editierbaren Elementen akzeptiert eine explizite,
unveränderliche SFNT-Schrift (TTF/OTF/TTC), die der Core deterministisch shapet. `createFont` nimmt
bereits dekodierte SFNT-Bytes entgegen; `loadFont` übernimmt zusätzlich das Laden übers Netz und das
Dekodieren von WOFF/WOFF2:

```ts
import { loadFont } from "@dopejs/pingo";

const inter = await loadFont("/fonts/Inter-Regular.woff2", {
  fallbackFamily: "sans-serif",
});
createElement(Text, { value: "Hello", font: inter, fontSize: 16 });
```

`PingoFontOptions`: `faceIndex` (Index des Schriftschnitts in einer TTC-Sammlung, Standard `0`) und
`fallbackFamily` (CSS-Familie für den Fall, dass die explizite Schrift als Ganzes zurückfällt,
Standard `"sans-serif"`). Ladefehler werfen einen `PingoFontLoadError` mit stabilem `code` (etwa
`fetch-failed`, `decode-failed`, `unsupported-format`).

## Barrierefreiheit

`semanticRole` und `semanticLabel` sind Props aller Elemente: Überschriften, Buttons und Bereiche
sollten ihre Semantik am Element tragen; der Name eines `Image` stammt aus dem `label` von
`createImage`. Der Semantik-Snapshot wird als DOM-Schattbaum neben dem Canvas gespiegelt, Details
unter [Barrierefreiheit](/guide/accessibility).
