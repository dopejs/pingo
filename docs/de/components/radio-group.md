---
title: Radio Group
description: Optionsfeldgruppe mit Pfeiltasten-Navigation, gerendert auf dem Pingo-Canvas.
---

# Radio Group

Eine Optionsfeldgruppe wird verwendet, um eine Option aus einer Menge sich gegenseitig ausschließender Optionen auszuwählen. Die folgende Vorschau wird von der Pingo-Engine in Echtzeit gerendert – Sie können Optionen anklicken oder die Auswahl mit den Pfeiltasten verschieben und dabei zwischen hellem und dunklem Seitendesign wechseln.

:::preview radio-group-basic
:::

## Verwendung

```tsx
import { createElement } from "@dopejs/pingo";
import { RadioGroup, RadioGroupItem } from "@dopejs/pingo-ui";

root.render(
  createElement(RadioGroup, {
    defaultValue: "b",
    onValueChange: (value) => console.log(value),
    children: [
      createElement(RadioGroupItem, { value: "a", label: "选项 A" }),
      createElement(RadioGroupItem, { value: "b", label: "选项 B" }),
      createElement(RadioGroupItem, { value: "c", label: "选项 C" }),
    ],
  }),
);
```

`RadioGroup` veröffentlicht den aktuellen Wert über den Kontext an `RadioGroupItem`, daher müssen beide mit `createElement` als Komponenten eingebunden werden. Wird `value` übergeben, befindet sich die Komponente im kontrollierten Modus; andernfalls verwaltet sie ihren Zustand über `defaultValue` selbst.

## Beispiele

### Deaktiviert

Wird `disabled` an `RadioGroup` übergeben, wird die gesamte Gruppe deaktiviert, und der semantische Wert der einzelnen Optionen wechselt zu `disabled`.

## Props

### RadioGroup

| Prop            | Typ                       | Standardwert | Beschreibung                                   |
| --------------- | ------------------------- | ------------ | ---------------------------------------------- |
| `value`         | `string`                  | —            | Kontrollierter ausgewählter Wert               |
| `defaultValue`  | `string`                  | —            | Unkontrollierter anfänglich ausgewählter Wert  |
| `onValueChange` | `(value: string) => void` | —            | Callback bei Auswahländerung                   |
| `disabled`      | `boolean`                 | `false`      | Deaktiviert die gesamte Gruppe                 |
| `children`      | `PingoNode`               | —            | Liste von `RadioGroupItem` (erforderlich)      |
| `className`     | `string`                  | —            | Wird an den Komponenten-Klassennamen angehängt |

### RadioGroupItem

| Prop        | Typ      | Standardwert | Beschreibung                                   |
| ----------- | -------- | ------------ | ---------------------------------------------- |
| `value`     | `string` | —            | Wert der Option (erforderlich)                 |
| `label`     | `string` | —            | Text der Option                                |
| `className` | `string` | —            | Wird an den Komponenten-Klassennamen angehängt |

## Barrierefreiheit

Der Gruppencontainer trägt die Semantik `radiogroup`, die einzelnen Optionen die Semantik `radio` und wechseln zwischen `checked` / `unchecked` / `disabled`. Gemäß WAI-ARIA kann bei einer Optionsfeldgruppe unabhängig von der Layoutrichtung mit beiden Pfeiltastenpaaren die Auswahl verschoben und der Fokus synchronisiert werden.
