---
title: Tabs
description: Wechselt zwischen einer Gruppe gleichrangiger Panels, die auf der pingo-Leinwand gerendert werden.
---

# Tabs

Tabs wechseln innerhalb desselben Bereichs zwischen mehreren gleichrangigen Inhalts-Panels. Die folgende Vorschau wird von der pingo-Engine in Echtzeit gerendert – Sie können per Klick zwischen den Tabs wechseln oder sich mit den Pfeiltasten links/rechts bewegen.

:::preview tabs-basic
:::

## Verwendung

```tsx
import { createElement } from "@dopejs/pingo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@dopejs/pingo-ui";

root.render(
  createElement(Tabs, {
    defaultValue: "account",
    children: [
      createElement(TabsList, {
        children: [
          createElement(TabsTrigger, { value: "account", children: "Konto" }),
          createElement(TabsTrigger, { value: "password", children: "Passwort" }),
        ],
      }),
      createElement(TabsContent, {
        value: "account",
        children: createElement("text", { value: "Verwalten Sie Ihre Kontoinformationen." }),
      }),
      createElement(TabsContent, {
        value: "password",
        children: createElement("text", { value: "Ändern Sie Ihr Anmeldepasswort." }),
      }),
    ],
  }),
);
```

`Tabs` unterstützt sowohl den unkontrollierten (`defaultValue`) als auch den kontrollierten (`value` + `onValueChange`) Modus.

## Props

### Tabs

| Prop            | Typ                       | Standard | Beschreibung                                             |
| --------------- | ------------------------- | -------- | -------------------------------------------------------- |
| `value`         | `string`                  | —        | Kontrolliert: `value` des aktuell ausgewählten Tabs      |
| `defaultValue`  | `string`                  | —        | Unkontrolliert: `value` des anfänglich ausgewählten Tabs |
| `onValueChange` | `(value: string) => void` | —        | Callback bei Auswahländerung                             |
| `children`      | `PingoNode`               | —        | `TabsList` und mehrere `TabsContent` (erforderlich)      |
| `className`     | `string`                  | —        | Wird nach den Komponentenklassen angehängt               |

### TabsList

| Prop        | Typ         | Standard | Beschreibung                               |
| ----------- | ----------- | -------- | ------------------------------------------ |
| `children`  | `PingoNode` | —        | Liste von `TabsTrigger` (erforderlich)     |
| `className` | `string`    | —        | Wird nach den Komponentenklassen angehängt |

### TabsTrigger

| Prop        | Typ      | Standard | Beschreibung                                                                |
| ----------- | -------- | -------- | --------------------------------------------------------------------------- |
| `value`     | `string` | —        | Kennung, die mit dem zugehörigen `TabsContent` verknüpft ist (erforderlich) |
| `children`  | `string` | —        | Tab-Text (erforderlich)                                                     |
| `className` | `string` | —        | Wird nach den Komponentenklassen angehängt                                  |

### TabsContent

| Prop        | Typ         | Standard | Beschreibung                                                                |
| ----------- | ----------- | -------- | --------------------------------------------------------------------------- |
| `value`     | `string`    | —        | Kennung, die mit dem zugehörigen `TabsTrigger` verknüpft ist (erforderlich) |
| `children`  | `PingoNode` | —        | Panel-Inhalt (erforderlich)                                                 |
| `className` | `string`    | —        | Wird nach den Komponentenklassen angehängt                                  |

## Barrierefreiheit

Die Tab-Liste besitzt tablist-Semantik, die Tabs besitzen tab-Semantik und stellen den Auswahlzustand für assistive Technologien bereit. Die Pfeiltasten links/rechts sowie Pos1/Ende bewegen und wählen gleichzeitig zwischen den Tabs; der Fokus wandert mit der Auswahl mit. Inaktive Panels werden mit `display: none` ausgeblendet statt ausgehängt, sodass Scrollposition und Bearbeitungszustand innerhalb des Panels erhalten bleiben.
