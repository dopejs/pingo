---
title: Toggle
description: Umschaltknopf mit zwei Zuständen für Sofortschalter wie Fett, Kursiv usw., gerendert auf der pingo-Leinwand.
---

# Toggle

Umschaltknopf mit zwei Zuständen: Einmal drücken hält ihn aktiv, erneutes Drücken schaltet ihn aus. Die folgende Vorschau wird von der pingo-Engine in Echtzeit gerendert – Sie können den Zustand durch Anklicken umschalten, und die Darstellung folgt dem Hell-/Dunkel-Thema der Website.

:::preview toggle-basic
:::

## Verwendung

```tsx
import { Toggle } from "@dopejs/pingo-ui";

root.render(
  <Toggle defaultPressed onPressedChange={(pressed) => console.log(pressed)}>
    加粗
  </Toggle>,
);
```

`Toggle` hält seinen Zustand intern über Hooks und muss mit JSX als Komponente eingebunden werden. Wird `pressed` übergeben, befindet sich die Komponente im kontrollierten Modus; andernfalls verwaltet sie ihren Zustand über `defaultPressed` selbst.

## Beispiele

### Deaktiviert

Mit `disabled` reagiert der Knopf weder auf Zeiger noch Tastatur und lässt sich auch nicht mehr mit Enter oder der Leertaste aktivieren.

## Props

| Prop              | 类型                         | 默认值  | 说明                                                |
| ----------------- | ---------------------------- | ------- | --------------------------------------------------- |
| `children`        | `string`                     | —       | Buttontext (erforderlich)                           |
| `pressed`         | `boolean`                    | —       | Kontrollierter Zustand „gedrückt“                   |
| `defaultPressed`  | `boolean`                    | `false` | Anfangszustand „gedrückt“ im unkontrollierten Modus |
| `onPressedChange` | `(pressed: boolean) => void` | —       | Callback bei Zustandswechsel                        |
| `disabled`        | `boolean`                    | `false` | Deaktivierter Zustand                               |
| `className`       | `string`                     | —       | Wird an den Komponenten-Klassennamen angehängt      |

## Barrierefreiheit

Die Komponente besitzt Button-Semantik, der semantische Wert wechselt je nach Zustand zwischen `on` und `off`. Beim Drücken mit dem Zeiger wird sie automatisch fokussiert, `Enter` und die `Leertaste` aktivieren den Schalter.
