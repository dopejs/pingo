# Architekturüberblick

## Beidseitige Eigentümerschaft

```
TSX / hooks          →  Mutation Stream  →   Scene / Layout / Paint
(TypeScript-Shell)       Binär, gebündelt     (Rust Core, wasm)
                                                    ↓
Canvas2D-Player       ←   DisplayList      ←    Picture
```

**Die Shell besitzt den Komponentenbaum, der Core besitzt die Scene. Beide teilen keine veränderlichen Objekte.**
Jede grenzüberschreitende Kommunikation ist ein versionierter Binärstream: Little-Endian, vier Byte ausgerichtet,
instruktionsbasiert. Der Empfänger führt vor dem Speicherzugriff Opcode-, Längen-, Ausrichtungs-, ID- und
Arithmetik-Prüfungen durch; fehlerhafte Eingaben werden atomar abgelehnt statt teilweise angewendet.

Diese Grenze ist keine Performance-Optimierung, sondern eine Korrektheitsgrenze: Auch wenn die Bytes
normalerweise vom eigenen Encoder dieses Projekts stammen, behandelt der Decoder sie als nicht vertrauenswürdige
Eingabe – mit Fuzz-Abdeckung.

## Doppelte Uhr

Die UI-Uhr (Haupt-Thread) und die Rendering-Uhr (Worker) sind voneinander unabhängig:

- Der Haupt-Thread erfasst Eingaben, durchläuft den Komponentenbaum und committet Mutation-Frames.
- Der Worker treibt Scroll-Physik, Animation, Layout und Compositing an.

**Im Scroll-Dauerzustand wird die Shell nicht aufgerufen.** Fehlende Daten werden mit Platzhaltern gerendert
und in nachfolgenden Frames nachgebaut. Wenn der Haupt-Thread daher 200 ms durch Geschäftscode blockiert ist,
bleiben Scrollen und Animation dennoch flüssig – dieses Szenario wird durch automatische Fehlerinjektionstests
abgesichert.

## Fallback-Kette

Die Fähigkeitserkennung wählt den Transportpfad in Reihenfolge aus; alle drei Stufen sind funktional äquivalent:

1. **SharedArrayBuffer** —— erfordert Cross-Origin-Isolation (COOP/COEP)
2. **postMessage** —— wenn kein SAB verfügbar ist
3. **Haupt-Thread Canvas2D** —— wenn kein Worker / OffscreenCanvas verfügbar ist

```ts
const root = await createHostedCanvasRoot(canvas, {
  transport: { preference: "sab" }, // optionale Präferenz, wird bei Nichterfüllung dennoch degradiert
});
console.log(root.mode); // "sab" | "post-message" | "main-thread"
```

Der [Playground](/playground) dieser Website ist ein lebendes Beispiel: GitHub Pages kann keine
COOP/COEP-Response-Header ausliefern, daher läuft die Online-Version über den postMessage-Pfad –
die Transport-Kennzeichnung oben auf der Seite zeigt dies wahrheitsgemäß an.

## Invalidierungsmodell

**Die Prop-Semantik bestimmt die Invalidierungsdomäne**; Aufrufer markieren nichts manuell als dirty,
und es gibt keinen `forceUpdate`-Notausgang.

Jede Eigenschaft deklariert in einem Single-Source-Schema, ob sie Layout, Zeichnen, Hit-Testing oder
Semantik beeinflusst. Eine Änderung von `opacity` löst kein Reflow aus; eine Änderung von `width` schon.
Die Dirty-Bitmap wird pro Domäne geführt, und `onFrame` legt die Anzahl der dirty Nodes je Domäne offen.

Diese Entscheidung ist „aggressivste minimale Invalidierung + Property-Tests als Absicherung“: Das Ergebnis
des inkrementellen Renderings muss pixelgenau mit dem vollständigen Rendering übereinstimmen; Differenztests
konvergieren Gegenbeispiele auf den minimalen Fehlerfall.

## Scene-Repräsentation

Die Scene im Core ist SoA (Structure of Arrays statt Array of Structures):

- Node-IDs enthalten eine **Generation**; bei Slot-Wiederverwendung werden veraltete IDs nicht erneut gültig.
- Nach dem Commit bleibt die **topologische Ordnung** erhalten: Eltern-Nodes stehen immer vor Kind-Nodes.
- Strukturbearbeitungen werden einmal pro Commit verdichtet, nicht bei jeder Mutation.
- Layout-Ergebnisse werden mit doppelt gepufferten SoA stapelweise verglichen; auf dem Hot Path gibt es
  keine Allokation von Closures oder Listenern pro Node.

## Austauschbares Backend

Der Core gibt eine flache binäre DisplayList aus; das Backend ist nur ein Player. Das Canvas2D-Backend ist
eine sparsam allozierende Typed-Array-Schleife – **ein wasm→JS-Aufruf pro Zeichenvorgang ist kein
akzeptabler Rendering-Pfad**.

Dieselbe DisplayList speist auch einen isolierten wgpu-Prototypen; die Ausgaben beider werden per
Pixel-Differenz verglichen. Ob WebGPU übernommen wird, ist eine datengestützte Entscheidung, siehe
[ADR-0006](/adr/0006-webgpu-backend-decision).

## Determinismus

Zeit, Zufallsquelle und Eingabestrom können injiziert oder wiedergegeben werden; die Core-Ausgabe hängt
nicht von der Thread-Scheduling-Reihenfolge ab. `DOPR`-Archive zeichnen Mutation- und Input-Streams in
Originalreihenfolge auf und können ohne Browser in einer Headless-Umgebung deterministisch wiedergegeben
werden – Online-Probleme lassen sich dadurch lokal reproduzieren; sensible Bearbeitungsströme werden
explizit von der Aufzeichnung ausgeschlossen.

## Komponenten und Styles

Auf diesem Kernel liegen drei autorengerichtete API-Ebenen:

- **Basiskomponenten** —— Engine-Elemente wie View/Text/Image, Input/TextArea, SVG/Path, siehe
  [Basiskomponenten](/guide/elements).
- **Styles** —— eine versionierte CSS-Teilmenge, die auf Shell-Seite geparst wird (Unterstützungstabelle
  [hier](/style-support)), sowie die [SCSS/Less-Pipeline](/guide/scss-less) zur Build-Zeit; der Core
  konsumiert nur normalisierte typisierte Werte und parst keinen CSS-Text.
- **UI-Komponentenbibliothek** —— `@dopejs/pingo-ui`, fertige Komponenten, die an shadcn/ui ausgerichtet
  sind und vollständig auf Canvas rendern, siehe [Komponentendokumentation](/components).

## Vertiefung

Die vollständigen Algorithmen, Datenstrukturen und Abnahmekriterien finden sich im
[technischen Designdokument](/design).
