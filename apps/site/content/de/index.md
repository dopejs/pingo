---
layout: home

hero:
  name: Pingo
  text: canvas Rendering-Engine
  tagline: Rust/WASM-Kern + TypeScript-Hülle + austauschbare Backends. Entwickelt für hochperformante Interaktion, natives virtuelles Scrollen und Textbearbeitung im Canvas – mit Basiskomponenten, CSS-Styling und einer an shadcn ausgerichteten UI-Komponentenbibliothek.
  image:
    light: /pingo-mark.svg
    dark: /pingo-mark-dark.svg
    alt: Pingo
  actions:
    - theme: brand
      text: Schnellstart
      link: /guide/getting-started
    - theme: alt
      text: Playground
      link: /playground
    - theme: alt
      text: GitHub
      link: https://github.com/dopejs/pingo

features:
  - title: Zwei Taktgeber – keine Frame-Einbrüche selbst bei blockiertem Hauptthread
    details: UI-Takt und Rendering-Takt sind unabhängig voneinander. Scrollen, Animation, Layout und Compositing laufen in einem geschlossenen Kreislauf im Worker; das Bild bleibt selbst dann flüssig, wenn der Hauptthread 200 ms blockiert ist.
  - title: Natives virtuelles Scrollen
    details: Präfixsummen-Baum, richtungsvorhersagendes Vorladen und Platzhalter-Nachbau liegen im Core. Bei der Wiedergabe von 20.000 Frames einer Millionen-Zeilen-Fixture liegen P95/P99 im Submikrosekundenbereich; im stationären Scrollzustand erfolgt keinerlei Rückruf an die Shell.
  - title: Native Bearbeitung im Canvas
    details: Caret, Auswahl, Ziehen-Auswählen, Wortauswahl per Doppelklick, IME-Composition, Positionierung des Kandidatenfensters, Zwischenablage sowie Rückgängig/Wiederholen sind vollständig in der Engine implementiert. Anwendungen müssen für Eingabefunktionen keine HTML-Steuerelemente mehr erzeugen.
  - title: Barrierefreiheit als Teil der Architektur
    details: Der Core exportiert einen semantischen Baum, den der Host als DOM-Schattenbaum neben dem Canvas spiegelt. Screenreader funktionieren, und E2E-Tests können Elemente anhand von role/label auswählen statt Pixel zu vergleichen.
  - title: Determinismus und differenzielle Tests
    details: Versionierte Binärstreams, injizierbare Taktgeber und Zufallsquellen, Aufzeichnung und Wiedergabe sowie differenzielle Orakel zwischen inkrementell und vollständig, optimiert und naiv, wasm und nativ.
  - title: Automatischer Fallback – immer ein Rückweg
    details: SharedArrayBuffer → postMessage → Canvas2D im Hauptthread wird automatisch nach Fähigkeiten gewählt, bei funktionaler Äquivalenz. Die Migrationsschicht unterstützt seitenweise schrittweise Freigabe und Ein-Klick-Rollback.
  - title: Basiskomponenten sofort einsatzbereit
    details: Engine-Elemente wie View/Text/Image, Input/TextArea, SVG/Path entsprechen direkt Scene-Knoten; Text-Shaping, Caret-Geometrie und Bearbeitungsfähigkeiten kommen aus dem Core – keine aus DOM-Steuerelementen zusammengestückelten Hilfskonstrukte.
  - title: CSS- und SCSS/Less-Unterstützung
    details: "Eine von der Shell geparste, versionierte CSS-Teilmenge: Klassenselektoren, Interaktionszustände, Vererbung und berechnete Stile haben klar definierte Grenzen; SCSS/Less werden zur Buildzeit kompiliert und validiert, der Präprozessor gelangt nicht ins Browser-Bundle."
  - title: An shadcn ausgerichtete UI-Komponentenbibliothek
    details: "Die Komponenten-API und Skin-Semantik von @dopejs/pingo-ui sind an shadcn/ui ausgerichtet – Button, Dialog, Table, Calendar und weitere werden vollständig ins Canvas gerendert, mit Unterstützung für helle und dunkle Themes sowie Stylesheet-Overrides."
---

## In 30 Sekunden loslegen

```sh
pnpm add @dopejs/pingo
```

```tsx
import { createHostedCanvasRoot, Text, View } from "@dopejs/pingo";

const root = await createHostedCanvasRoot(document.querySelector("canvas")!);

root.render(
  <View
    style={{ width: 480, height: 640, overflowY: "auto" }}
    virtual={{
      itemCount: 1_000_000,
      estimatedItemSize: 32,
      renderItem: (index) => <Text value={`第 ${index} 行`} />,
    }}
  />,
);
```

TSX setzt voraus, dass `jsxImportSource` in `tsconfig.json` auf `@dopejs/pingo` zeigt, siehe [Erste Schritte](/guide/getting-started).

Eine Million Zeilen werden auf Shell-Seite nicht materialisiert, und während des Scrollens erfolgt kein Rückruf an den Komponentenbaum – Fensterberechnung und Nachbau finden vollständig im Core statt.

## Was es nicht tut

Pingo ist ein Rendering-Engine, kein Browser. Es übernimmt **kein** SSR/HTML-First-Paint, keine allgemeine CSS-Kompatibilität (Box-Modell, Kaskade, Selektoren),
keine Adapterschicht für Mini-Programme oder native Plattformen und keine geschäftliche Rich-Text-Semantik (Kollaboration, Formeln, Markdown-Befehle).

Die Engine **besitzt sehr wohl** Caret, Auswahl, IME, Zwischenablage, Rückgängig/Wiederholen und editierbare Textprimitive – diese werden nicht in die Anwendungsschicht zurückgeschoben, um sie dort
aus DOM-Steuerelementen zusammenzusetzen.

Leistungsmessungen auf realer Hardware, echte Eingabemethoden, Screenreader und die Medien-Leistungsmatrix sind Teil der separaten Plattform-Qualifikationserfassung;
bidirektionale visuelle Navigation und die standardmäßige Aktivierung des WebGPU-Backends bleiben [dokumentierte Zurückstellungen](https://github.com/dopejs/pingo/blob/main/docs/plan.md).
