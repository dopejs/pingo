---
title: Card
description: "Zusammensetzbares Karten-Container: Header, Title, Description, Content, Footer — gerendert auf dem pingo-Canvas."
---

# Card

Eine Karte bündelt verwandte Inhalte in einem Container mit Rahmen und Schatten und besteht aus
sechs kombinierbaren Slots. Die Vorschau unten wird von der pingo-Engine in Echtzeit gerendert und
folgt dem Hell-/Dunkel-Theme der Website.

:::preview card-basic
:::

## Verwendung

```tsx
import { createElement } from "@dopejs/pingo";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@dopejs/pingo-ui";

root.render(
  createElement(Card, {
    children: [
      createElement(CardHeader, {
        children: [
          createElement(CardTitle, { children: "账户设置" }),
          createElement(CardDescription, { children: "管理你的账户偏好与通知。" }),
        ],
      }),
      createElement(CardContent, {
        children: createElement("text", { value: "卡片正文内容。" }),
      }),
      createElement(CardFooter, {
        children: createElement(Button, { children: "保存", onPress: () => {} }),
      }),
    ],
  }),
);
```

Alle Slots sind optional — kombinieren Sie nur die benötigten Teile; Slot-Inhalte werden unverändert
durchgereicht und nicht verpackt.

## Props

`Card`, `CardHeader`, `CardContent`, `CardFooter` akzeptieren Container-Props:

| Prop | Typ | Standardwert | Beschreibung |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | Slot-Inhalt (Pflicht) |
| `className` | `string` | — | Wird hinter die Komponentenklassen gehängt |

`CardTitle`, `CardDescription` akzeptieren Text-Props:

| Prop | Typ | Standardwert | Beschreibung |
| --- | --- | --- | --- |
| `children` | `string` | — | Textinhalt (Pflicht) |
| `className` | `string` | — | Wird hinter die Komponentenklassen gehängt |

## Barrierefreiheit

Card ist ein rein visueller Container und führt keine zusätzliche Semantik ein; den lesbaren Namen
und die Struktur der Karte liefern die darin platzierten Titel, Buttons usw. Titel- und Textfarben
erben die Vordergrundfarbe der Karte und halten den Kontrast in beiden Themes.
