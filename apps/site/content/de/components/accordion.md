---
title: Accordion
description: "Vertikal gestapeltes Accordion, das jeweils nur einen Eintrag aufklappt, gerendert auf dem pingo-Canvas."
---

# Accordion

Ein Accordion gliedert verwandte Inhalte in vertikale, auf- und zuklappbare Gruppen, von denen
jeweils nur eine geöffnet ist. Die Vorschau unten wird von der pingo-Engine in Echtzeit gerendert —
klicken Sie auf die Titel, oder bewegen Sie den Fokus mit den Pfeiltasten und klappen Sie mit
Enter/Leertaste um.

:::preview accordion-basic
:::

## Verwendung

```tsx
import { createElement } from "@dopejs/pingo";
import { Accordion, AccordionItem } from "@dopejs/pingo-ui";

root.render(
  createElement(Accordion, {
    defaultOpenValue: "intro",
    children: [
      createElement(AccordionItem, {
        value: "intro",
        title: "什么是 pingo-ui？",
        children: createElement("text", { value: "渲染在 pingo canvas 上的组件库。" }),
      }),
      createElement(AccordionItem, {
        value: "theme",
        title: "支持暗色主题吗？",
        children: createElement("text", { value: "支持，跟随主题自动切换。" }),
      }),
    ],
  }),
);
```

`Accordion` unterstützt sowohl die unkontrollierte (`defaultOpenValue`) als auch die kontrollierte
Schreibweise (`openValue` + `onValueChange`).

## Props

### Accordion

| Prop               | Typ                                    | Standardwert | Beschreibung                                                                         |
| ------------------ | -------------------------------------- | ------------ | ------------------------------------------------------------------------------------ |
| `openValue`        | `string`                               | —            | Kontrolliert: `value` des geöffneten Eintrags                                        |
| `defaultOpenValue` | `string`                               | —            | Unkontrolliert: `value` des anfangs geöffneten Eintrags                              |
| `onValueChange`    | `(value: string \| undefined) => void` | —            | Callback bei Wechsel des geöffneten Eintrags; `undefined`, wenn alles zugeklappt ist |
| `children`         | `PingoNode`                            | —            | Liste von `AccordionItem` (Pflicht)                                                  |
| `className`        | `string`                               | —            | Wird hinter die Komponentenklassen gehängt                                           |

### AccordionItem

| Prop        | Typ         | Standardwert | Beschreibung                               |
| ----------- | ----------- | ------------ | ------------------------------------------ |
| `value`     | `string`    | —            | Eindeutige Kennung des Eintrags (Pflicht)  |
| `title`     | `string`    | —            | Titel des Triggers (Pflicht)               |
| `children`  | `PingoNode` | —            | Inhalt im aufgeklappten Zustand (Pflicht)  |
| `className` | `string`    | —            | Wird hinter die Komponentenklassen gehängt |

## Barrierefreiheit

Die Pfeiltasten (hoch/runter) bewegen den Fokus zwischen den Titeln, ohne den Aufklappzustand zu
ändern; Home/End springen an Anfang und Ende; Enter oder Leertaste schalten das Aufklappen um —
konform zur WAI-ARIA-Trennung von Fokus und Auswahl. Zugeklappte Inhaltsbereiche werden mit
`display: none` versteckt statt ausgehängt, sodass der Aufklappzustand erhalten bleibt.
