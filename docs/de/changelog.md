---
title: Änderungsprotokoll
---

# Changelog

Die Versionspolitik steht in `docs/release.md`: Alle 12 Pakete werden atomar in derselben Version
veröffentlicht, npm-Semver und die Version des binären ABI werden getrennt verwaltet.

## 0.3.0 - 2026-08-25

- Elemente einer virtuellen Liste werden jetzt über die Liste gestreckt, sodass die Zeilen
  eines Tabellenkörpers zu den Spalten der Kopfzeile passen. Das Layout der Hülle gehört
  dem Core und geht nicht durch die Style-Kaskade.
- Ein gestreckter Kasten in einem scrollenden Container erhält seine definite Quergröße und
  seine Prozentbasis zurück: Kästen in einem Scroll-Panel fallen nicht mehr auf
  Shrink-to-fit zurück, und `100%` in einem virtuellen Element ergibt nicht mehr null.
- Flex-Elemente erhalten die automatische Mindestgröße aus CSS entlang der Blockachse: ein
  sehr großes Geschwisterelement kann ein inhaltsbemessenes nicht mehr auf null drücken.
  CSS-Subset 1.8.0: `min-width`/`min-height` sind jetzt initial `auto`.
- Komponenten: Skeleton pulsiert; NavigationMenu trägt nicht mehr den Rahmen der Menubar
  und bekommt ein Chevron; eine Tabellenkopfzeile schrumpft nicht mehr; StatCard/TopBar/
  ListRow behalten ihre Inhaltsbreite, wenn keine Breite vorgegeben ist.
- Release: Publish-Menge und Artefaktliste stammen aus der Paketliste des Verifiers; die
  Reproduzierbarkeitsprüfung läuft nun am Ende der Gates.
- Die Projektlizenz wechselt ab 0.3.0 von MIT zu Apache-2.0;
  die bis einschließlich v0.2.1 veröffentlichten Versionen bleiben unter MIT.
- Die Übertragungskurve des Mausrads folgt jetzt dem Browser: diskrete Rastschritte scrollen animiert,
  während hochpräzise Deltas (Trackpad) weiterhin sofort 1:1 angewendet werden. `DispatchEvent` des
  Input Stream erhält ein Flags-Feld, und die ABI-Version steigt von 1 auf 2.
- Die offizielle Website gibt es auf vereinfachtem Chinesisch, traditionellem Chinesisch, Spanisch,
  Französisch, Deutsch, Russisch, Hebräisch, Arabisch, Japanisch und Koreanisch.

## 0.1.0

Erste veröffentlichungsfähige Version. Alle Engineering-Meilensteine P0–M5 sind abgeschlossen, und
`pnpm m5:check` (die automatische Kette von M0 bis M5) läuft vollständig grün.

- Deterministischer Rust/WASM-Core + TypeScript-Schale: Schema mit einer einzigen Quelle, versionierte
  binäre Mutation-/Input-/DisplayList-/Rückkanalströme, atomare Ablehnung fehlerhafter Eingaben.
- Rendering mit zwei Uhren: Kette SAB → postMessage → Canvas2D im Hauptthread; der Worker stellt weiter
  dar, auch wenn der Hauptthread 200 ms blockiert.
- Natives virtuelles Scrollen (Wiedergabe im Submikrosekundenbereich bei P95/P99 mit einer Million
  Zeilen) und Text-Subsystem (explizites Font-Shaping, Glyph-Atlas, Rückfall auf Systemschriften).
- canvas-native Bearbeitung: zwei Wege über EditContext und Eingabe-Proxy, IME-Komposition,
  Cursor-Navigation per Zeiger und Tastatur, Zwischenablage, Undo/Redo, Passwortmaskierung und
  Scroll-into-View des Cursors.
- Hit-Testing (inkrementelles BVH mit Property-Tests gegen ein naives Orakel) und dreiphasige Events
  Capture/Ziel/Bubble samt Protokoll für synchrones `preventDefault` in nicht passiven Regionen.
- Barrierefreiheit: Export des Semantikbaums, Spiegelung in den DOM-Schattenbaum, semantische
  E2E-Selektoren über `getByRole` und Weiterleitung des Tastaturfokus.
- Migration und Produktivbetrieb: `@dopejs/pingo-compat` für seitenweises Ausrollen und Zurücknehmen,
  Migrationsscanner, SHA-256-Integritätsprüfung von Paket und WASM, Diagnose und Betriebshandbuch.
- Isolierter WebGPU-Prototyp mit abweichungsfreiem Vergleich gegen das Headless-Orakel (ADR-0006:
  Continue Experiment, standardmäßig deaktiviert).

Ausdrücklich zurückgestellt: visuelle bidi-Navigation, Platzhalter in den Widgets, WebGPU standardmäßig
aktiv. Die Plattformqualifizierung (Leistung auf echten Geräten, echte Eingabemethoden, Screenreader)
wird getrennt verfolgt und nicht über die Paketversion zugesagt.
