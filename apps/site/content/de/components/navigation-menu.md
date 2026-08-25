---
title: Navigation Menu
description: Menüleiste im Stil der Site-Navigation, deren Verhalten Menubar entspricht und deren Semantik Navigation ist.
---

# Navigation Menu

Navigation Menu ist die navigationssemantische Variante der [Menubar](/components/menubar): dieselbe Trigger-Zeile und dasselbe Aufklapp-Panel, aber mit nach außen exponierten Navigation-Semantik – passend für die Hauptnavigation einer Site. Die folgende Vorschau wird von der pingo-Engine in Echtzeit gerendert und wechselt mit dem Site-Theme zwischen hell und dunkel.

:::preview navigation-menu-basic
:::

## Verwendung

```tsx
import { createElement } from "@dopejs/pingo";
import { MenubarMenu, NavigationMenu } from "@dopejs/pingo-ui";

root.render(
  createElement(NavigationMenu, {
    onValueChange: (value) => {},
    children: [
      createElement(MenubarMenu, {
        value: "products",
        label: "产品",
        children: createElement("text", { value: "渲染引擎" }),
      }),
      createElement(MenubarMenu, {
        value: "docs",
        label: "文档",
        children: createElement("text", { value: "快速开始" }),
      }),
    ],
  }),
);
```

Die Einträge verwenden `MenubarMenu` wieder. Das Öffnen und Schließen ist standardmäßig unkontrolliert; sobald `value` übergeben wird, wechselt es in den kontrollierten Modus. Das Interaktionsverhalten (Tastaturnavigation, gemeinsame Öffnungsposition) ist vollständig identisch mit Menubar.

## Props

`NavigationMenu` akzeptiert alle Props aus `MenubarProps` außer `navigation`:

| Prop            | Typ                                    | Standardwert | Beschreibung                                                            |
| --------------- | -------------------------------------- | ------------ | ----------------------------------------------------------------------- |
| `value`         | `string`                               | —            | Kontrolliert: Wert des aktuell geöffneten Menüs                         |
| `onValueChange` | `(value: string \| undefined) => void` | —            | Callback bei Änderung des geöffneten Menüs (`undefined` beim Schließen) |
| `children`      | `PingoNode`                            | —            | Mehrere `MenubarMenu` (erforderlich)                                    |
| `className`     | `string`                               | —            | Zusätzliche Klasse                                                      |

Props der Einträge siehe [Menubar](/components/menubar#menubarmenu).

## Barrierefreiheit

Der Container besitzt Navigation-Semantik, die Labels besitzen menuitem-Semantik und exponieren den expanded/collapsed-Status; die Pfeiltasten links/rechts bewegen zwischen den Einträgen, `Escape` schließt und fokussiert das aktuelle Label.
