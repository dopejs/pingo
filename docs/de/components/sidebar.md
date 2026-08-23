---
title: Sidebar
description: "Produkt-Navigationsleiste: Gruppen, Einträge und Auswahlzustand, gerendert auf der Pingo-Canvas."
---

# Sidebar

Sidebar ist eine Navigationsspalte auf Anwendungsebene, bestehend aus Gruppen (Section) und Einträgen (Item), mit integriertem Auswahlzustand und Tastaturnavigation. Die folgende Vorschau wird von der Pingo-Engine in Echtzeit gerendert – klicken Sie auf einen Eintrag oder wechseln Sie nach dem Fokussieren mit den Pfeiltasten.

:::preview sidebar-basic
:::

## Verwendung

```tsx
import { createElement } from "@dopejs/pingo";
import { Sidebar, SidebarItem, SidebarSection } from "@dopejs/pingo-ui";

root.render(
  createElement(Sidebar, {
    defaultValue: "stats",
    onValueChange: (value) => navigate(value),
    children: [
      createElement(SidebarSection, {
        title: "Arbeitsbereich",
        children: [
          createElement(SidebarItem, { value: "home", label: "Startseite" }),
          createElement(SidebarItem, { value: "stats", label: "Statistiken" }),
        ],
      }),
      createElement(SidebarSection, {
        title: "System",
        children: createElement(SidebarItem, { value: "settings", label: "Einstellungen" }),
      }),
    ],
  }),
);
```

`Sidebar` unterstützt sowohl die unkontrollierte (`defaultValue`) als auch die kontrollierte (`value` + `onValueChange`) Verwendung. Die Breite der Seitenleiste wird durch Theme-Tokens bestimmt (Standard 240px).

## Props

### Sidebar

| Prop | Typ | Standard | Beschreibung |
| --- | --- | --- | --- |
| `value` | `string` | — | Kontrolliert: `value` des aktuell ausgewählten Eintrags |
| `defaultValue` | `string` | — | Unkontrolliert: `value` des anfänglich ausgewählten Eintrags |
| `onValueChange` | `(value: string) => void` | — | Callback bei Auswahländerung |
| `children` | `PingoNode` | — | Liste von `SidebarSection` (erforderlich) |
| `className` | `string` | — | Wird an den Komponenten-Klassennamen angehängt |

### SidebarSection

| Prop | Typ | Standard | Beschreibung |
| --- | --- | --- | --- |
| `title` | `string` | — | Gruppentitel; wird die Titelzeile nicht gerendert, wenn weggelassen |
| `children` | `PingoNode` | — | Liste von `SidebarItem` (erforderlich) |
| `className` | `string` | — | Wird an den Komponenten-Klassennamen angehängt |

### SidebarItem

| Prop | Typ | Standard | Beschreibung |
| --- | --- | --- | --- |
| `value` | `string` | — | Eindeutige Kennung des Eintrags (erforderlich) |
| `label` | `string` | — | Eintragstext, wird zugleich als Barrierefreiheitsname verwendet (erforderlich) |
| `icon` | `PingoNode` | — | Vorangestellter Slot für ein Symbol |
| `className` | `string` | — | Wird an den Komponenten-Klassennamen angehängt |

## Barrierefreiheit

Die Seitenleiste besitzt Navigationssemantik; Einträge besitzen Link-Semantik, verwenden `label` als Barrierefreiheitsnamen und stellen den Status selected/unselected bereit. Die Pfeiltasten nach oben/unten sowie Home/End bewegen zwischen den Einträgen, Auswahl und Fokus bewegen sich gemeinsam.

Informationen zum Anpassen von Breite und Farbschema der Seitenleiste finden Sie im [Styling-Leitfaden](/guide/styling).
