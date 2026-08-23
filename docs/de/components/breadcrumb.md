---
title: Breadcrumb
description: "Breadcrumb-Navigation im shadcn-Stil; der letzte Eintrag ist die aktuelle Seite und nicht klickbar. Gerendert auf dem pingo-Canvas."
---

# Breadcrumb

Breadcrumb-Navigation: Jeder Eintrag außer dem letzten ist ein klickbarer Link; der letzte Eintrag
steht für die aktuelle Seite — er wird nicht als Link gerendert und bietet assistiven Technologien
auch keine Aktion „an die aktuelle Position springen“. Die Vorschau unten wird von der pingo-Engine
in Echtzeit gerendert — klicken Sie auf frühere Einträge oder aktivieren Sie sie per Tastatur; die
Vorschau folgt dem Hell-/Dunkel-Theme der Website.

:::preview breadcrumb-basic
:::

## Verwendung

```tsx
import { createElement } from "@dopejs/pingo";
import { Breadcrumb } from "@dopejs/pingo-ui";

root.render(
  createElement(Breadcrumb, {
    items: [
      { label: "首页", onNavigate: () => navigate("/") },
      { label: "组件", onNavigate: () => navigate("/components") },
      { label: "Breadcrumb" }, // 末项是当前页，无需 onNavigate
    ],
  }),
);
```

## Beispiele

### Eigenes Trennzeichen

`separator` ist standardmäßig `/` und kann durch ein beliebiges Textzeichen ersetzt werden (bis ein
Icon-Set vorliegt, ist das Trennzeichen eine Textglyphe):

:::preview breadcrumb-separator
:::

## Props

### BreadcrumbProps

| Prop        | Typ                         | Standardwert | Beschreibung                                                      |
| ----------- | --------------------------- | ------------ | ----------------------------------------------------------------- |
| `items`     | `readonly BreadcrumbItem[]` | —            | Breadcrumb-Einträge; der letzte gilt als aktuelle Seite (Pflicht) |
| `separator` | `string`                    | `"/"`        | Trennzeichen zwischen den Einträgen                               |
| `className` | `string`                    | —            | Wird hinter die Komponentenklassen gehängt                        |

### BreadcrumbItem

| Feld         | Typ          | Standardwert | Beschreibung                                                                                                                                    |
| ------------ | ------------ | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`      | `string`     | —            | Text des Eintrags (Pflicht)                                                                                                                     |
| `onNavigate` | `() => void` | —            | Klick-Callback; ohne Angabe trägt der Eintrag kein Aktivierungsverhalten (der letzte Eintrag gilt ohnehin als aktuelle Seite und braucht keins) |

## Barrierefreiheit

Die Breadcrumb als Ganzes trägt die Semantik `navigation` mit dem Namen "breadcrumb"; klickbare
Einträge haben Link-Semantik, lassen sich mit `Enter` / `Space` aktivieren und erhalten vor dem
Klick den Fokus. Die aktuelle Seite wird als reiner Text mit dem Semantikwert `current` gerendert —
Screenreader behandeln sie nicht als springbaren Link. Mehr im
[Barrierefreiheits-Leitfaden](/guide/accessibility).
