---
title: Select
description: Kombinierter Dropdown-Auswähler mit Tastaturnavigation, gerendert auf der Pingo-Canvas.
---

# Select

Der Dropdown-Auswähler setzt sich aus `Select`, `SelectTrigger`, `SelectContent` und `SelectItem` zusammen. Die folgende Vorschau wird von der Pingo-Engine in Echtzeit gerendert – die Liste ist bereits geöffnet, Sie können mit den Pfeiltasten navigieren, mit Enter auswählen, und die Darstellung folgt dem hellen oder dunklen Theme der Website.

:::preview select-basic
:::

## Verwendung

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger } from "@dopejs/pingo-ui";

root.render(
  <Select value="pingo-ui" onValueChange={(value) => console.log(value)}>
    <SelectTrigger placeholder="Ein Paket auswählen" />
    <SelectContent>
      <SelectItem value="pingo">@dopejs/pingo</SelectItem>
      <SelectItem value="pingo-ui">@dopejs/pingo-ui</SelectItem>
    </SelectContent>
  </Select>,
);
```

Alle Teile arbeiten über einen Context zusammen und müssen mit JSX als Komponenten eingebunden werden. Der Trigger zeigt den aktuell ausgewählten `value` an; wenn nichts ausgewählt ist, wird der `placeholder` angezeigt.

## Beispiele

### Standardmäßig geöffnet

`defaultOpen` lässt die Liste initial geöffnet erscheinen (wie in der Vorschau oben); `onOpenChange` überwacht das Öffnen und Schließen.

## Props

### Select

| Prop            | Typ                       | Standardwert | Beschreibung                                                         |
| --------------- | ------------------------- | ------------ | -------------------------------------------------------------------- |
| `value`         | `string`                  | —            | Ausgewählter Wert, der im Trigger angezeigt wird                     |
| `defaultOpen`   | `boolean`                 | `false`      | Initial geöffnet                                                     |
| `onValueChange` | `(value: string) => void` | —            | Callback bei Auswahländerung (schließt nach der Auswahl automatisch) |
| `onOpenChange`  | `(open: boolean) => void` | —            | Callback beim Öffnen und Schließen                                   |
| `children`      | `PingoNode`               | —            | Trigger und Inhalt (erforderlich)                                    |
| `className`     | `string`                  | —            | Wird an den Komponenten-Klassennamen angehängt                       |

### SelectTrigger

| Prop          | Typ         | Standardwert | Beschreibung                                                                                                        |
| ------------- | ----------- | ------------ | ------------------------------------------------------------------------------------------------------------------- |
| `children`    | `PingoNode` | —            | Benutzerdefinierter Inhalt des Triggers; standardmäßig wird der ausgewählte Wert oder der Platzhaltertext gerendert |
| `placeholder` | `string`    | —            | Platzhaltertext, wenn nichts ausgewählt ist                                                                         |
| `className`   | `string`    | —            | Wird an den Komponenten-Klassennamen angehängt                                                                      |

### SelectContent

| Prop        | Typ         | Standardwert | Beschreibung                                   |
| ----------- | ----------- | ------------ | ---------------------------------------------- |
| `children`  | `PingoNode` | —            | Liste der `SelectItem` (erforderlich)          |
| `className` | `string`    | —            | Wird an den Komponenten-Klassennamen angehängt |

### SelectItem

| Prop        | Typ      | Standardwert | Beschreibung                                   |
| ----------- | -------- | ------------ | ---------------------------------------------- |
| `value`     | `string` | —            | Wert der Option (erforderlich)                 |
| `children`  | `string` | —            | Text der Option (erforderlich)                 |
| `className` | `string` | —            | Wird an den Komponenten-Klassennamen angehängt |

## Barrierefreiheit

Der Trigger besitzt Button-Semantik und wechselt zwischen `expanded` und `collapsed`; der Inhalt besitzt Menü-Semantik. Die Pfeiltasten bewegen die Hervorhebung, `Enter`/`Leertaste` wählen aus, `Esc` schließt; nach der Auswahl kehrt der Fokus zum Trigger zurück.
