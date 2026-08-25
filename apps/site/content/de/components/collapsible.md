---
title: Collapsible
description: "Ein einzelner auf- und zuklappbarer Inhaltsbereich, gerendert auf dem pingo-Canvas."
---

# Collapsible

Collapsible ist die Einzeleintrags-Primitive des Accordion: Ein Trigger steuert Auf- und Zuklappen
eines Inhalts — für Szenarien, die nur einen Klappbereich brauchen. Die Vorschau unten wird von der
pingo-Engine in Echtzeit gerendert — klicken Sie zum Umschalten auf den Trigger.

:::preview collapsible-basic
:::

## Verwendung

```tsx
import { createElement } from "@dopejs/pingo";
import { Collapsible } from "@dopejs/pingo-ui";

root.render(
  createElement(Collapsible, {
    trigger: "高级选项",
    defaultOpen: true,
    children: createElement("text", { value: "折叠区内容。" }),
  }),
);
```

Unterstützt sowohl die unkontrollierte (`defaultOpen`) als auch die kontrollierte Schreibweise
(`open` + `onOpenChange`).

## Beispiele

### Deaktiviert

Mit `disabled` reagiert der Trigger nicht mehr auf Zeiger und Tastatur und erhält den deaktivierten
Stil.

:::preview collapsible-disabled
:::

## Props

| Prop           | Typ                       | Standardwert | Beschreibung                                 |
| -------------- | ------------------------- | ------------ | -------------------------------------------- |
| `trigger`      | `string`                  | —            | Triggertext (Pflicht)                        |
| `children`     | `PingoNode`               | —            | Inhalt im aufgeklappten Zustand (Pflicht)    |
| `open`         | `boolean`                 | —            | Kontrolliert: aktueller Aufklappzustand      |
| `defaultOpen`  | `boolean`                 | `false`      | Unkontrolliert: anfänglicher Aufklappzustand |
| `onOpenChange` | `(open: boolean) => void` | —            | Callback bei Änderung des Aufklappzustands   |
| `disabled`     | `boolean`                 | `false`      | Deaktiviert den Trigger                      |
| `className`    | `string`                  | —            | Wird hinter die Komponentenklassen gehängt   |

## Barrierefreiheit

Der Trigger trägt Button-Semantik und legt gegenüber assistiven Technologien den Zustand
expanded/collapsed offen; Enter und Leertaste schalten das Aufklappen um. Zugeklappte Inhalte werden
mit `display: none` versteckt statt ausgehängt, sodass Scrollposition und Bearbeitungszustand im
Inneren erhalten bleiben.
