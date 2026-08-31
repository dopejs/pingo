# Schnellstart

## Installation

```sh
pnpm add @dopejs/pingo
```

Die Anwendung hängt nur von dem Paket `@dopejs/pingo` ab. `@dopejs/pingo-host`, `@dopejs/pingo-jsx` und andere sind interne Implementierungspakete
und gehören nicht zum öffentlichen Vertrag – der [Migrations-Scanner](/guide/migration) lehnt den direkten Import dieser Pakete ab.

## Die erste Leinwand einhängen

```tsx
import { createHostedCanvasRoot } from "@dopejs/pingo";

const canvas = document.querySelector<HTMLCanvasElement>("#app")!;
canvas.width = 800;
canvas.height = 600;

const root = await createHostedCanvasRoot(canvas);

root.render(
  <container width={800} height={600} backgroundColor="#ffffffff" padding={24}>
    <text value="Hello pingo" fontSize={24} lineHeight={32} color="#1f2329ff" />
  </container>,
);
```

`createHostedCanvasRoot` erkennt automatisch die Browserfähigkeiten und wählt den Übertragungspfad zwischen SharedArrayBuffer, postMessage und
Canvas2D im Hauptthread aus. Du musst keine Verzweigungen für Fallbacks schreiben. `root.mode` gibt den tatsächlich gewählten Pfad zurück.

## TSX verwenden

Konfiguriere `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@dopejs/pingo"
  }
}
```

Danach kannst du Folgendes schreiben:

```tsx
function OrderRow({ index }: { index: number }) {
  return (
    <container width={480} height={32} padding={[6, 12, 6, 12]}>
      <text value={`订单 #${index}`} fontSize={13} lineHeight={20} />
    </container>
  );
}

root.render(<OrderRow index={1} />);
```

## Host-Elemente

Die Engine besitzt nur fünf eingebaute Elemente, die direkt den Scene-Knoten entsprechen. Es gibt weder CSS-Kaskadierung noch Selektoren:

| Element        | Zweck                                                             |
| -------------- | ----------------------------------------------------------------- |
| `container`    | Allgemeine Gruppierung, Hintergrund, Innenabstand, Transformation |
| `text`         | Textlauf (Shaping, Umbruch, Caret-Geometrie aus Core)             |
| `scroll`       | Scrollbarer Container im Besitz von Core                          |
| `virtualList`  | Virtuelle Liste mit von Core geplanter Fensterung                 |
| `editableText` | Editierbare Textprimitive                                         |

`TextField` und `TextArea` sind Widgets, die auf `editableText` aufbauen (Rahmen, Fehlerzustand).
Sie führen keinen neuen Eingabepfad ein.

## Zustand und Seiteneffekte

```tsx
import { signal, useEffect, useSignal, useState } from "@dopejs/pingo";

function Counter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCount((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return <text value={`已过 ${count} 秒`} />;
}
```

Verfügbare reaktive Primitive: `signal`, `computed`, `effect`, `batch`, `untracked`,
sowie die Hooks `useState`, `useSignal`, `useMemo`, `useCallback`, `useRef`, `useEffect`.

::: warning Kein synchrones Layout-Lesen
Synchrones Worker-Layout-Lesen im Stil von `useLayoutEffect` wird nicht unterstützt – das Layout findet auf einem anderen Takt statt.
Verwende asynchrone Verträge, wenn du Layout-Ergebnisse benötigst, und versuche nicht, Geometrie synchron während des Renderns zu lesen.
:::

## Laufzeitverhalten beobachten

```ts
const root = await createHostedCanvasRoot(canvas, {
  onFrame: (report) => {
    console.log(report.commands, report.displayListBytes, report.core?.sceneNodes);
  },
  onHostError: (error) => report(error),
});
```

`onFrame` liefert pro Frame die Anzahl der Befehle, die DisplayList-Bytes sowie die Dirty-Bereich-Zähler, den Layout-Aufwand und den Picture-Hash auf Core-Seite.
Das sind die wichtigsten Daten für die Performance-Analyse. Mehr dazu unter [Diagnose](/guide/diagnostics).

## Überblick über die Fähigkeiten

Aufbauend auf den fünf eingebauten Elementen bietet pingo drei weitere Ebenen autororientierter Fähigkeiten:

- [Basiskomponenten](/guide/elements): Engine-Elemente wie View/Text/Image, Input/TextArea, SVG/Path usw.
- [Styling](/guide/styling): Versionierte CSS-Teilmenge – klare Grenzen für Klassenselektoren, Interaktionszustände, Kaskadierung und Vererbung;
  wenn Variablen und Mixins benötigt werden, nutze die Build-Pipeline [SCSS / Less](/guide/scss-less).
- [UI-Komponentenbibliothek](/components): `@dopejs/pingo-ui`, fertige Komponenten, die an shadcn/ui ausgerichtet sind und vollständig auf die Leinwand gerendert werden.

## Nächste Schritte

- [Architekturüberblick](/guide/architecture): Wie Shell und Core die Aufgaben aufteilen
- [Scrollen und Virtualisierung](/guide/scrolling), [Text und Bearbeitung](/guide/editing)
- [Playground](/playground): Interaktive Live-Demo
