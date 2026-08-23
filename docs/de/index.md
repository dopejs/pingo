---
layout: home

hero:
  name: Pingo
  text: Canvas-Rendering-Engine
  tagline: Rust/WASM-Kern + TypeScript-Schale + austauschbare Backends. Entworfen für hochperformante Interaktion, natives virtuelles Scrollen und Textbearbeitung im Canvas — mit Basis-Elementen, CSS-Styling und einer an shadcn ausgerichteten UI-Komponentenbibliothek.
  image:
    light: /pingo-mark.svg
    dark: /pingo-mark-dark.svg
    alt: Pingo
  actions:
    - theme: brand
      text: Erste Schritte
      link: /guide/getting-started
    - theme: alt
      text: Playground
      link: /playground
    - theme: alt
      text: GitHub
      link: https://github.com/dopejs/pingo

features:
  - title: Zwei Uhren — keine Frame-Einbrüche bei blockiertem Hauptthread
    details: UI-Uhr und Rendering-Uhr sind unabhängig voneinander. Scrollen, Animation, Layout und Komposition laufen geschlossen im Worker; blockiert der Hauptthread für 200 ms, bleibt das Bild dennoch durchgehend flüssig.
  - title: Natives virtuelles Scrollen
    details: Präfixsummen-Baum, richtungsbasiertes Vorwärmen und Platzhalter-Nachbau liegen vollständig im Core. Beim Replay von 20.000 Frames einer festen Fixture mit einer Million Zeilen liegen P95/P99 im Submikrosekunden-Bereich, und im Scroll-Beharrungszustand wird die Schale überhaupt nicht zurückgerufen.
  - title: Canvas-native Bearbeitung
    details: Cursor, Auswahl, Ziehauswahl, Wortauswahl per Doppelklick, IME-Komposition, Positionierung des Kandidatenfensters, Zwischenablage sowie Rückgängig/Wiederherstellen sind vollständig in der Engine implementiert. Anwendungen erzeugen für Eingaben keine HTML-Steuerelemente mehr.
  - title: Barrierefreiheit ist Teil der Architektur
    details: Der Core exportiert einen Semantikbaum, den der Host als DOM-Schattbaum neben dem Canvas spiegelt. Screenreader funktionieren, und E2E-Tests wählen Elemente per Rolle/Label statt per Pixelvergleich.
  - title: Determinismus und Differenztests
    details: Versionierte Binärströme, injizierbare Uhren und Zufallsquellen, Aufzeichnung und Wiedergabe sowie Differenz-Orakel zwischen inkrementell und vollständig, optimiert und naiv, wasm und nativ.
  - title: Automatischer Rückfall — es gibt immer einen Ausweg
    details: SharedArrayBuffer → postMessage → Canvas2D im Hauptthread wird nach Fähigkeit automatisch gewählt, funktional gleichwertig. Die Migrationsschicht unterstützt seitenweises Rollout und Rückfall per Knopfdruck.
  - title: Basis-Elemente sofort einsatzbereit
    details: Engine-Elemente wie View/Text/Image, Input/TextArea und SVG/Path entsprechen direkt Scene-Knoten; Text-Shaping, Cursor-Geometrie und Bearbeitungsfähigkeiten kommen aus dem Core — kein Zusammenbau aus DOM-Steuerelementen nötig.
  - title: CSS- und SCSS/Less-Unterstützung
    details: "Ein versioniertes CSS-Subset, auf Shell-Seite geparst: Klassenselektoren, Interaktionszustände, Vererbung und berechnete Stile mit klaren Grenzen; SCSS/Less wird zur Build-Zeit kompiliert und geprüft, der Präprozessor landet nie im Browser-Bundle."
  - title: An shadcn ausgerichtete UI-Komponentenbibliothek
    details: "Die Komponenten-API und Skin-Semantik von @dopejs/pingo-ui ist an shadcn/ui ausgerichtet — Button, Dialog, Table, Calendar und mehr rendern vollständig in den Canvas, mit Hell-/Dunkel-Themes und Stylesheet-Überschreibungen."
---

## In 30 Sekunden loslegen

```sh
pnpm add @dopejs/pingo
```

```ts
import { createElement, createHostedCanvasRoot } from "@dopejs/pingo";

const root = await createHostedCanvasRoot(document.querySelector("canvas")!);

root.render(
  createElement("virtualList", {
    width: 480,
    height: 640,
    itemCount: 1_000_000,
    estimatedItemHeight: 32,
    renderItem: (index) => createElement("text", { value: `Zeile ${index}` }),
  }),
);
```

Eine Million Zeilen werden auf der Shell-Seite nie materialisiert, und während des Scrollens wird der
Komponentenbaum nicht zurückgerufen — Fensterberechnung und Nachbau passieren vollständig im Core.

## Was es nicht tut

Pingo ist eine Rendering-Engine, kein Browser. **Nicht enthalten** sind SSR/HTML-First-Paint,
allgemeine CSS-Kompatibilität (Boxmodell, Kaskade, Selektoren), Mini-Programm- oder native
Anpassungsschichten und Rich-Text-Semantik auf Anwendungsebene (Kollaboration, Formeln,
Markdown-Befehle).

Die Engine **besitzt sehr wohl** Cursor, Auswahl, IME, Zwischenablage, Rückgängig/Wiederherstellen und
die Primitive für editierbaren Text — diese werden nicht in die Anwendungsebene zurückgeschoben, um
dort aus DOM-Steuerelementen zusammengebaut zu werden.

## Aktueller Stand

Alle Engineering-Meilensteine P0–M8 sind abgeschlossen; M9 „Produktionsreife, inkrementelle
Komposition und Release-Härtung" ist vollständig geplant, die Umsetzung hat aber noch nicht begonnen —
Details im [M9-Plan](/m9-production-plan). Aktuelle Änderungen im Repository stehen noch unter
Unreleased; das bedeutet nicht, dass bereits eine neue npm-Version veröffentlicht wurde.

Reale Geräteleistung, echte Eingabemethoden, Screenreader und die Medien-/Energiematrix gehören zur
Plattform-Qualifizierung und werden separat verfolgt; visuelle Bidi-Navigation und ein standardmäßig
aktiviertes WebGPU-Backend bleiben [dokumentierte Aufschübe](/plan).
