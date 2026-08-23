---
title: SCSS / Less
description: "pingo-Stylesheets in SCSS oder Less schreiben: Build-Zeit-Pipeline, Vite-Plugin, Sicherheitsgrenzen und Fehlerdiagnose."
---

# SCSS / Less

Das CSS-Subset von pingo (siehe [Styling-Leitfaden](/guide/styling)) akzeptiert zur Laufzeit nur
CSS-Text oder Objekte. Wer Autorenkomfort wie Variablen, Mixins, `@use` / import möchte, nutzt die
**Build-Zeit-Kompilierung**: SCSS/Less wird auf Node-Seite von `@dopejs/pingo-style-preprocess` zu
CSS kompiliert, anschließend mit dem vorhandenen `compileStyleSheet` validiert und als
JavaScript-Modul erzeugt, das standardmäßig ein `PingoStyleSheet` exportiert.

**Sass und Less gelangen niemals in das Browser-Bundle, die Facade oder den Core** — zur Laufzeit
gibt es keinen Präprozessor, nur den ohnehin vorhandenen leichtgewichtigen CSS-Compiler. Auch die
Subset-Grenzen erweitern sich dadurch nicht: Nachfahrenselektoren, `@media`, `var()`, `calc()`,
`em/rem/vw/vh` und ähnliches werden weiterhin mit den bestehenden Diagnostics abgelehnt — der Build
schlägt fehl statt still durchzuwinken.

## Zwei Import-Semantiken strikt trennen

### Gewöhnliche DOM-Stile (Vite-nativ)

```ts
import "./site.scss";
import "./probe.less";
```

Dieser Pfad ist die eingebaute CSS-Vorverarbeitung von Vite und erzeugt **DOM-CSS**, das Vite
injiziert oder extrahiert. Er gilt nur für DOM-Seiten wie die Dokumentationswebsite oder eine
Storybook-Hülle, **erzeugt kein `PingoStyleSheet`** und darf nicht für Stile im Canvas verwendet
werden.

### pingo-Stylesheets (`?pingo-style`)

```ts
import { createHostedCanvasRoot } from "@dopejs/pingo";
import buttonSheet from "./button.scss?pingo-style";
import themeSheet from "./theme.less?pingo-style";

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [buttonSheet, themeSheet],
});
```

`?pingo-style` ist eine explizite Typgrenze: Zur Build-Zeit wird erst vorverarbeitet und dann gegen
das CSS-Subset validiert; das erzeugte ESM-Modul exportiert standardmäßig ein `PingoStyleSheet` und
**injiziert keinerlei CSS in das DOM**.

## Vite-Plugin

Installieren Sie das Node-only-Werkzeugpaket (erfordert Node >= 22.12, Vite ^8):

```sh
pnpm add -D @dopejs/pingo-style-preprocess
```

Registrierung in `vite.config.ts`:

```ts
import { pingoStylePreprocess } from "@dopejs/pingo-style-preprocess/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    pingoStylePreprocess({
      // optional: zusätzliche Sass load paths / Less paths
      scssLoadPaths: ["styles"],
      lessPaths: ["styles"],
      // optional: Abhängigkeiten müssen in diesen Verzeichnissen liegen
      // (Standard: nur das Verzeichnis des Entry und die load paths)
      allowRoots: ["src", "styles"],
    }),
  ],
});
```

Die Typdeklarationen stellt der Einstiegspunkt `./client` des Pakets bereit; einmalig in der
`tsconfig.json` referenzieren:

```json
{
  "compilerOptions": {
    "types": ["@dopejs/pingo-style-preprocess/client"]
  }
}
```

Verhaltenszusagen des Plugins:

- Es matcht nur das exakte Query-Flag `pingo-style` zusammen mit der Erweiterung `.scss` / `.less`;
  alle übrigen Dateien bleiben unberührt.
- Über ein Virtual Module wird die native CSS-Pipeline von Vite isoliert — keine doppelte
  Vorverarbeitung und kein injiziertes DOM-CSS.
- Entry und sämtliche Partials/Imports landen im Watch-Graph — **eine Änderung an Token oder Mixin
  löst HMR und Produktions-Rebuild aus**, ein manuelles Leeren des Caches ist nicht nötig.
- Jede Diagnose auf Error-Stufe lässt den Build fehlschlagen; Warnings werden mit Quellposition
  ausgegeben. Schlägt die Kompilierung während HMR fehl, bleibt das zuletzt committete Modul aktiv
  und der Dev-Server meldet den Fehler.
- Das erzeugte Modul prüft bei der Initialisierung die `CSS_SUBSET_VERSION`: Stimmen die
  Subset-Versionen der Laufzeit-Facade und der Build-Zeit-Validierung nicht überein, wirft das Modul
  bereits beim Laden — zwei Semantiken laufen nie vermischt.
- Dev-, Production- und SSR-Umgebung erzeugen semantisch identische Stylesheets.

## Node-Compile-API

Build-Systeme ohne Vite (CLI, Codegen) können die Node-API direkt verwenden:

```ts
import {
  compileLessString,
  compilePingoStyleFile,
  compileScssString,
  createStyleSheetFromLess,
  createStyleSheetFromScss,
} from "@dopejs/pingo-style-preprocess";
```

- `compileScssString(source, options)`: synchron und verarbeitet daher **nur Quelltext ohne
  Imports**; bei Imports wird die Diagnose `file-api-required` zurückgegeben.
- `compileLessString(source, options)`: asynchron (Less' `render` ist ein Promise); relative Imports
  werden nur aufgelöst, wenn ein absoluter `sourceName` angegeben ist.
- `compilePingoStyleFile(filename, options)`: asynchrone Datei-API — genau sie nutzt das
  Vite-Plugin; die Auflösungsbasis für relative Pfade ist eindeutig und der Abhängigkeitsgraph
  vollständig.
- Die `compile*`-Familie **wirft bei Autorenfehlern keine Ausnahme**, sondern liefert
  `styleSheet: null` zusammen mit stabil sortierten Diagnostics;
  `createStyleSheetFromScss` / `createStyleSheetFromLess` sind werfende Convenience-Wrapper, die
  Autorenfehler einheitlich als `StylePreprocessError` werfen und alle Diagnostics beibehalten.

Das zurückgegebene `StylePreprocessResult` enthält `cssText`, `styleSheet`, `diagnostics` und
`dependencies` (die vollständige Liste der Abhängigkeitsdateien, etwa für ein eigenes Watching).

## Source Maps und Fehlerdiagnose

Jede Diagnose trägt eine Phasenmarkierung:

| `stage`       | Herkunft                                                              |
| ------------- | -------------------------------------------------------------------- |
| `"scss"`      | Sass-Compile-Fehler (Syntaxfehler, undefinierte Variablen usw.)       |
| `"less"`      | Rejection des Less-Compilers                                          |
| `"pingo-css"` | `compileStyleSheet`-Diagnose: Ergebnis verlässt das CSS-Subset        |

Beide Compiler aktivieren Source Maps, und die Erzeugungspositionen der pingo-CSS-Diagnostics werden
**nach bestem Bemühen auf die ursprüngliche SCSS-/Less-Datei mit Zeile und Spalte zurückgemappt**
(`sourceLocation`); wo kein Mapping möglich ist, bleiben Erzeugungsposition (`generatedLocation`)
und Entry-Name erhalten — eine Originalposition wird nie vorgetäuscht. Diagnostics werden stabil nach
Erzeugungsposition und Code sortiert, damit CI-Ausgaben und Snapshots reproduzierbar sind.

## Sicherheitsgrenzen

Der Präprozessor führt zur Build-Zeit Autorencode aus und ist deshalb standardmäßig strikt:

- **Sass**: keine Custom Importer, keine Custom Functions und kein Node Package Importer; nur
  `file:`-Abhängigkeiten werden akzeptiert.
- **Less**: fest `javascriptEnabled: false`, keine Plugins, ein Pre-Scan lehnt `@plugin` ab;
  HTTP(S)- und protokollrelative Imports sind nicht erlaubt.
- **Gemeinsame Grenzen**: Abhängigkeiten müssen nach der Kanonisierung innerhalb der Allow Roots
  liegen (Verzeichnis des Entry + explizite load paths); Symlink-Ausbrüche, Nicht-Datei- und
  Remote-Abhängigkeiten werden durchweg abgelehnt. Das kompilierte CSS durchläuft vor der
  Subset-Validierung eine Obergrenze von 1.048.576 Code Units; Entry, Anzahl der Abhängigkeiten und
  deren Gesamtbytes haben explizite Budgets, deren Überschreitung einen stabilen Build-Fehler
  erzeugt.
- Compiler-Versionen sind per Lockfile fixiert; CSS, Diagnostics und Abhängigkeitslisten der
  Fixtures werden als Reproduzierbarkeits-Snapshot geführt — ein Upgrade von Sass/Less erfordert eine
  explizite Review der Ausgabedifferenzen.

Diese Einschränkungen gelten nur für die `?pingo-style`-Toolchain; gewöhnliche `.scss`- / `.less`-
Dateien fürs DOM folgen weiterhin der eigenen Vite-Konfiguration.

## Farbfunktionen

Präprozessoren geben häufig Farbfunktionen aus; dafür unterstützt das Subset `rgb()` / `rgba()` /
`hsl()` / `hsla()` (sowohl die Legacy-Form mit Kommas als auch die moderne Form mit
Leerzeichen/Slash), einheitlich auf 8-Bit-RGBA normiert. Ausgaben außerhalb dieser Menge —
`color(display-p3 ...)`, CSS Custom Properties, `calc()` — führen weiterhin zum Build-Fehler.
