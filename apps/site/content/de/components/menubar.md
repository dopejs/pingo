---
title: Menubar
description: Desktop-typische Anwendungsmenüleiste; mehrere Menüs teilen sich eine Öffnungsposition.
---

# Menubar

Menubar ist eine Reihe von Menüs, die sich eine einzige Öffnungsposition teilen, ähnlich der Menüleiste einer Desktop-Anwendung. Die folgende Vorschau wird von der pingo-Engine in Echtzeit gerendert – klicken Sie auf die Registerkarten „Datei“, „Bearbeiten“ usw., um das jeweilige Menü zu öffnen oder zu schließen; das helle bzw. dunkle Erscheinungsbild folgt dem Theme der Website.

:::preview menubar-basic
:::

## Verwendung

```tsx
import { createElement } from "@dopejs/pingo";
import { Menubar, MenubarMenu } from "@dopejs/pingo-ui";

root.render(
  createElement(Menubar, {
    onValueChange: (value) => {},
    children: [
      createElement(MenubarMenu, {
        value: "file",
        label: "Datei",
        children: createElement("text", { value: "Neu" }),
      }),
      createElement(MenubarMenu, {
        value: "edit",
        label: "Bearbeiten",
        children: createElement("text", { value: "Rückgängig" }),
      }),
    ],
  }),
);
```

`MenubarMenu` liest den Zustand der Menüleiste über den Kontext und muss ein Kindknoten von `Menubar` sein; seine `children` sind der Inhalt des Panels, das beim Öffnen angezeigt wird. Das Öffnen und Schließen ist standardmäßig ungesteuert; sobald `value` übergeben wird, wechselt das Verhalten in den gesteuerten Modus (der Wert entspricht dem `value` des aktuell geöffneten Menüs).

## Beispiele

### Gesteuertes Öffnen

Übergeben Sie `value`, um das geöffnete Menü festzulegen – häufig nützlich für das anfängliche Onboarding oder die Synchronisierung mit externem Zustand.

:::preview menubar-open
:::

## Props

### Menubar

| Prop            | Typ                                    | Standard | Beschreibung                                                                                     |
| --------------- | -------------------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `value`         | `string`                               | —        | Gesteuert: Wert des aktuell geöffneten Menüs                                                     |
| `onValueChange` | `(value: string \| undefined) => void` | —        | Callback bei Änderung des geöffneten Menüs (`undefined` beim Schließen)                          |
| `children`      | `PingoNode`                            | —        | Mehrere `MenubarMenu` (erforderlich)                                                             |
| `className`     | `string`                               | —        | Zusätzliche Klassen                                                                              |
| `navigation`    | `boolean`                              | `false`  | Navigationssemantik verwenden (intern von [NavigationMenu](/components/navigation-menu) genutzt) |

### MenubarMenu

| Prop        | Typ         | Standard | Beschreibung                                   |
| ----------- | ----------- | -------- | ---------------------------------------------- |
| `value`     | `string`    | —        | Menübezeichner (erforderlich)                  |
| `label`     | `string`    | —        | In der Leiste angezeigtes Label (erforderlich) |
| `children`  | `PingoNode` | —        | Inhalt des Panels beim Öffnen (erforderlich)   |
| `className` | `string`    | —        | Zusätzliche Klassen                            |

## Barrierefreiheit

Die Menüleiste besitzt eine Menubar-Semantik, die Registerkarten eine Menuitem-Semantik und machen den Zustand expanded/collapsed zugänglich; die Pfeiltasten links/rechts bewegen zwischen den Menüs und wechseln diese auch bei geöffnetem Menü, `Escape` schließt das Menü und setzt den Fokus auf die aktuelle Registerkarte.
