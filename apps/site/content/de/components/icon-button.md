---
title: Icon Button
description: Eine Schaltfläche, die nur ein Symbol trägt, muss einen Barrierefreiheitsnamen bereitstellen und wird auf der Pingo-Canvas gerendert.
---

# Icon Button

Symbolschaltflächen werden für kompakte Aktionen ohne Textbeschriftung verwendet. Die folgende Vorschau wird von der Pingo-Engine in Echtzeit gerendert – sie kann angeklickt und fokussiert werden und folgt dem Hell-/Dunkelmodus der Website.

:::preview icon-button-basic
:::

## Verwendung

```tsx
import { IconButton } from "@dopejs/pingo-ui";

root.render(
  <IconButton
    icon={<text value="★" />}
    semanticLabel="Favorit"
    variant="outline"
    onPress={() => toggleFavorite()}
  />,
);
```

`icon` ist ein durchgereichter Slot, der beliebige `PingoNode` akzeptiert – Icon-Schriftarten, SVG oder Textglyphen sind möglich. Da kein sichtbarer Text vorhanden ist, ist `semanticLabel` erforderlich.

## Beispiele

### Varianten

`variant` ist vollständig an [Button](/components/button) angeglichen: `default`, `secondary`, `outline`, `ghost`, `destructive`.

### Bekannte Einschränkungen

`size` unterstützt `default`, `sm`, `lg`, aber der aktuelle Skin enthält keine zusammengesetzten Regeln für `sm`/`lg` bei der Icon-Variante. Die Symbolgröße überschreibt die Größenmodifikatoren, sodass `sm`/`lg` derzeit keinen visuellen Effekt haben.

## Props

| Prop            | Typ                                                                 | Standardwert | Beschreibung                                        |
| --------------- | ------------------------------------------------------------------- | ------------ | --------------------------------------------------- |
| `icon`          | `PingoNode`                                                         | —            | Icon-Slot, unverändert durchgereicht (erforderlich) |
| `semanticLabel` | `string`                                                            | —            | Barrierefreiheitsname (erforderlich)                |
| `variant`       | `"default" \| "secondary" \| "outline" \| "ghost" \| "destructive"` | `"default"`  | Visuelle Variante                                   |
| `size`          | `"default" \| "sm" \| "lg"`                                         | `"default"`  | Größe (`sm`/`lg` derzeit wirkungslos, siehe oben)   |
| `disabled`      | `boolean`                                                           | `false`      | Deaktivierter Zustand                               |
| `onPress`       | `() => void`                                                        | —            | Callback für Zeiger-/Tastaturaktivierung            |
| `className`     | `string`                                                            | —            | Wird nach dem Komponentenklassennamen angehängt     |

## Barrierefreiheit

Symbolschaltflächen haben keinen sichtbaren Text. Screenreader sind ausschließlich auf `semanticLabel` angewiesen, daher ist diese Prop erforderlich. Die Schaltfläche verfügt über Button-Semantik und Unterstützung für Tastaturaktivierung.
