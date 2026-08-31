---
title: Dialog
description: Modaler Dialog, der den Ablauf unterbricht, um Benutzereingaben oder Bestätigungen einzuholen; wird auf der pingo canvas gerendert.
---

# Dialog

Der Dialog öffnet ein modales Panel über dem aktuellen Inhalt und wird von einem Overlay begleitet. Die folgende Vorschau wird von der pingo-Engine in Echtzeit gerendert – ein Klick auf das Overlay oder das Drücken von `Escape` löst `onOpenChange(false)` aus und folgt dem Hell-/Dunkel-Theme der Website.

:::preview dialog-basic
:::

## Verwendung

```tsx
import {
  Button,
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@dopejs/pingo-ui";

root.render(
  <Dialog open={open} onOpenChange={(next) => setOpen(next)}>
    <DialogHeader>
      <DialogTitle>编辑资料</DialogTitle>
      <DialogDescription>修改会立即同步。</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button onPress={() => save()}>保存</Button>
    </DialogFooter>
  </Dialog>,
);
```

Die Overlay-Ebene des Dialogs füllt **ihren eigenen Elterncontainer** aus (nicht den Viewport). Platziere sie daher in der Nähe des Wurzelknotens. `open` ist eine kontrollierte Prop: Die Komponente hält keinen eigenen Öffnungszustand; beim Schließen wird die aufrufende Seite über `onOpenChange(false)` benachrichtigt.

## Beispiele

### Kombinierte Bereiche

`DialogHeader` / `DialogTitle` / `DialogDescription` / `DialogFooter` sind reine Layout- und Typografie-Komponenten, die nach Bedarf kombiniert werden. `children` akzeptiert beliebige `PingoNode` – Formulare und Listen können ebenfalls im Panel platziert werden.

## Props

### Dialog

| Prop           | Typ                       | Standardwert | Beschreibung                                            |
| -------------- | ------------------------- | ------------ | ------------------------------------------------------- |
| `open`         | `boolean`                 | —            | Ob der Dialog geöffnet ist (erforderlich, kontrolliert) |
| `onOpenChange` | `(open: boolean) => void` | —            | Callback, wenn ein Schließen/Öffnen angefordert wird    |
| `children`     | `PingoNode`               | —            | Inhalt des Panels (erforderlich)                        |
| `className`    | `string`                  | —            | Wird nach dem Klassennamen der Overlay-Ebene angehängt  |

### DialogHeader / DialogFooter

| Prop        | Typ         | Standardwert | Beschreibung                       |
| ----------- | ----------- | ------------ | ---------------------------------- |
| `children`  | `PingoNode` | —            | Inhalt des Bereichs (erforderlich) |
| `className` | `string`    | —            | Zusätzlicher Klassenname           |

### DialogTitle / DialogDescription

| Prop        | Typ      | Standardwert | Beschreibung              |
| ----------- | -------- | ------------ | ------------------------- |
| `children`  | `string` | —            | Textinhalt (erforderlich) |
| `className` | `string` | —            | Zusätzlicher Klassenname  |

## Barrierefreiheit

Das Panel besitzt Dialog-Semantik. Beim Öffnen wandert der Fokus in das Panel; nach dem Schließen mit `Escape` kehrt der Fokus zum auslösenden Element zurück. Interaktive Elemente innerhalb des Panels werden in die Tab-Reihenfolge aufgenommen. Verwende für den Titel `DialogTitle` (Heading-Semantik).
