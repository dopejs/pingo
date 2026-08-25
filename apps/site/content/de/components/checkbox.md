---
title: Checkbox
description: "Kontrollierte Checkbox mit optionalem Textlabel, gerendert auf dem pingo-Canvas."
---

# Checkbox

Eine Checkbox dient als eigenständiger boolescher Schalter. Die Vorschau unten wird von der
pingo-Engine in Echtzeit gerendert und folgt dem Hell-/Dunkel-Theme der Website. Checkbox ist eine
kontrollierte Komponente: Die Vorschau zeigt statische Kombinationen aus an/aus/deaktiviert; die
Interaktion wird von Zustand des Aufrufers getrieben.

:::preview checkbox-basic
:::

## Verwendung

```tsx
import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
import { Checkbox } from "@dopejs/pingo-ui";

// useSignal 是 hook，必须运行在组件作用域内。
function NotificationSetting(): PingoNode {
  const enabled = useSignal(false);
  return createElement(Checkbox, {
    checked: enabled.get(),
    label: "已启用通知",
    onCheckedChange: (next) => enabled.set(next),
  });
}

root.render(createElement(NotificationSetting));
```

`checked` liegt bei der Elternkomponente, `onCheckedChange` aktualisiert es — die Komponente selbst
hält keinen Zustand. `label` ist optional und rendert bei Angabe einen Text rechts neben dem
Kästchen.

## Beispiele

### Deaktiviert

Mit `disabled` reagiert das Kästchen nicht mehr auf Zeiger und Tastatur, und der Semantikwert wird
zu `disabled`.

## Props

| Prop              | Typ                          | Standardwert | Beschreibung                               |
| ----------------- | ---------------------------- | ------------ | ------------------------------------------ |
| `checked`         | `boolean`                    | —            | Auswahlzustand (Pflicht, kontrolliert)     |
| `onCheckedChange` | `(checked: boolean) => void` | —            | Callback beim Umschalten                   |
| `disabled`        | `boolean`                    | `false`      | Deaktivierter Zustand                      |
| `label`           | `string`                     | —            | Textlabel rechts neben dem Kästchen        |
| `className`       | `string`                     | —            | Wird hinter die Komponentenklassen gehängt |
| `semanticLabel`   | `string`                     | —            | Barrierefreiheitsname                      |

## Barrierefreiheit

Die Komponente trägt die Semantikrolle `checkbox`; der Semantikwert wechselt mit dem Zustand
zwischen `checked` / `unchecked` / `disabled`. Ein Zeigerdruck fokussiert automatisch. Das
✓-Indikatorzeichen hängt von der Glyphenabdeckung der Schrift ab und dient als Platzhalter, bis die
Icon-Assets bereitstehen.
