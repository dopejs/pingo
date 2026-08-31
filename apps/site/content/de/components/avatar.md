---
title: Avatar
description: "Runder Avatar; fehlt das Bild, wird auf Initialen zurückgefallen. Gerendert auf dem pingo-Canvas."
---

# Avatar

Avatar zeigt ein Benutzerbild: Wird eine bereits dekodierte Bildressource übergeben, erscheint sie
rund zugeschnitten; ohne Bild wird auf die `fallback`-Kürzel zurückgefallen. Die Vorschau unten wird
von der pingo-Engine in Echtzeit gerendert und folgt dem Hell-/Dunkel-Theme der Website.

:::preview avatar-basic
:::

## Verwendung

```tsx
import { Avatar } from "@dopejs/pingo-ui";

root.render(<Avatar fallback="张" />);
```

Mit Bild übergeben Sie eine vordekodierte `PingoImage`-Ressource; das Bild füllt mit
`object-fit: cover` und wird rund zugeschnitten:

```tsx
<Avatar image={decodedImage} fallback="张" />
```

## Beispiele

### Größen

`size` ist die Kantenlänge des Quadrats (px) und setzt den Eckenradius zugleich auf `size / 2`.
Ohne Angabe gilt der Skin-Standard von 40 px. Die Vorschau zeigt der Reihe nach 32, Standard, 56.

```tsx
<Avatar fallback="李" size={32} />
```

## Props

| Prop        | Typ          | Standardwert       | Beschreibung                                                          |
| ----------- | ------------ | ------------------ | --------------------------------------------------------------------- |
| `image`     | `PingoImage` | —                  | Vordekodierte Bildressource; ohne sie erscheint das `fallback`-Kürzel |
| `fallback`  | `string`     | —                  | Kürzeltext bei fehlendem Bild (Pflicht)                               |
| `size`      | `number`     | Skin-Standard `40` | Kantenlänge des Quadrats (px)                                         |
| `className` | `string`     | —                  | Wird hinter die Komponentenklassen gehängt                            |

## Barrierefreiheit

Das `fallback`-Kürzel übernimmt zugleich die Aufgabe des lesbaren Namens; verwenden Sie Zeichen, die
den Nutzer repräsentieren (etwa Nachname oder Initialen), und keine Platzhaltersymbole.
