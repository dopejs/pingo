---
title: Toast
description: Leichtgewichtige Benachrichtigung in der Ecke, getragen von ToastViewport, gerendert auf dem Pingo-Canvas.
---

# Toast

Toast ist eine kurz in der Ecke erscheinende, leichtgewichtige Benachrichtigung – geeignet für unmittelbares Feedback wie erfolgreiches Speichern oder fehlgeschlagene Synchronisierung. Die folgende Vorschau wird von der Pingo-Engine in Echtzeit gerendert – ein Klick auf den Button löst einen Toast aus, der dem Hell-/Dunkel-Theme der Seite folgt.

:::preview toast-basic
:::

## Verwendung

Toast muss zusammen mit `ToastViewport` verwendet werden. Der Viewport ist ein absolut positionierter Eckcontainer (standardmäßig oben rechts) und **muss in der Nähe des Wurzelcontainers eingehängt werden** – in dieser Engine ist der umschließende Block der Elternknoten und nicht der nächste positionierte Vorfahre. Wird er in einem kleinen Container eingehängt, überdeckt er nur diesen kleinen Container.

```tsx
import { Button, Toast, ToastViewport } from "@dopejs/pingo-ui";

let open = false;

function scene() {
  return (
    <container width={surfaceWidth} height={surfaceHeight}>
      <Button
        onPress={() => {
          open = true;
          root.render(scene());
        }}
      >
        保存
      </Button>
      <ToastViewport>
        <Toast open={open} title="已保存" description="配置已写入本地。" />
      </ToastViewport>
    </container>
  );
}
```

Anzeigen/Ausblenden und der Zeitpunkt des automatischen Schließens werden von der Anwendung selbst gesteuert: `open` umschalten und erneut `root.render(...)` aufrufen (der Button in der Vorschau folgt genau diesem Muster).

## Beispiele

### Varianten

`variant="destructive"` wird für Fehlerbenachrichtigungen verwendet. Dabei verwendet der Beschreibungstext keine abgeschwächte Vordergrundfarbe mehr – der destruktive Hintergrund hat den Vordergrund bereits invertiert; eine weitere Abschwächung würde zu grauem Text auf rotem Grund führen.

:::preview toast-variants
:::

## Props

### Toast

| Prop          | Typ                          | Standardwert | Beschreibung                                                                     |
| ------------- | ---------------------------- | ------------ | -------------------------------------------------------------------------------- |
| `open`        | `boolean`                    | —            | Ob der Toast angezeigt wird; bei `false` wird `null` gerendert (erforderlich)    |
| `title`       | `string`                     | —            | Titel (erforderlich)                                                             |
| `description` | `string`                     | —            | Beschreibungstext; wenn weggelassen, wird die Beschreibungszeile nicht gerendert |
| `variant`     | `"default" \| "destructive"` | `"default"`  | Visuelle Variante                                                                |
| `className`   | `string`                     | —            | Wird an den Komponenten-Klassennamen angehängt                                   |

### ToastViewport

| Prop        | Typ         | Standardwert | Beschreibung                                                                                   |
| ----------- | ----------- | ------------ | ---------------------------------------------------------------------------------------------- |
| `children`  | `PingoNode` | —            | Liste der Toasts im Viewport; mehrere werden mit 8px Abstand vertikal gestapelt (erforderlich) |
| `className` | `string`    | —            | Wird an den Komponenten-Klassennamen angehängt                                                 |

## Barrierefreiheit

Toast trägt die semantische Rolle `status`, sodass assistive Technologien ihn als Statusmeldung vorlesen. Ein Toast unterbricht den aktuellen Fokus nicht; für Ergebnisse kritischer Aktionen sollte zusätzlich dauerhaftes Feedback auf der Seite erhalten bleiben (z. B. `Alert`).
