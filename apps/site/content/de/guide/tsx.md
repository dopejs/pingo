---
title: TSX
description: pingo-Komponenten in TSX schreiben und im selben Repository mit React koexistieren.
---

# pingo in TSX schreiben

## Konfiguration

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@dopejs/pingo"
  }
}
```

`jsx` wählt die automatische Runtime von TypeScript; `jsxImportSource` richtet sie auf die
`jsx-runtime` von pingo statt auf die von React. Der Name `react-jsx` bezeichnet den
Transformationsmodus und hat mit React nichts zu tun.

## Was als Tag stehen darf

```tsx
import { createContext, memo, Text, useState, View, type PingoNode } from "@dopejs/pingo";
import { Button } from "@dopejs/pingo-ui";

const Theme = createContext("light");

function Row({ label }: { readonly label: string }): PingoNode {
  const [count, setCount] = useState(0);
  return (
    <View width={240} padding={8}>
      <text value={`${label} ${count}`} />
      <Button onPress={() => setCount(count + 1)}>Erhöhen</Button>
    </View>
  );
}

root.render(
  <Theme.Provider value="dark">
    <Row label="Klicks" />
  </Theme.Provider>,
);
```

Alle fünf Formen funktionieren:

| Form                            | Beispiel                                              |
| ------------------------------- | ----------------------------------------------------- |
| Eingebaute Elemente             | `<container>`, `<text>`, `<scroll>`, `<editableText>` |
| Basiskomponenten                | `<View>`, `<Text>`, `<Image>`, `<Input>`              |
| Eigene Funktionskomponenten     | `<Row label="…" />`                                   |
| Mit `memo` umhüllte Komponenten | alle aus `@dopejs/pingo-ui`                           |
| Context-Provider                | `<Theme.Provider value={…}>`                          |

::: warning Eine Komponente mit Hooks wird gemountet, nicht aufgerufen
`Row({ label })` besteht die Typprüfung, scheitert aber mit
`hooks may only run in a function component`: Hooks brauchen den Komponenten-Scope, den der
Reconciler anlegt. Schreiben Sie `<Row label="…" />`.
:::

Der Rückgabetyp darf `PingoNode` sein. Er enthält `undefined`, aber die Verträglichkeit mit
JSX-Tags erklärt das `JSX.ElementType` der Engine — die Signatur muss nicht umgeschrieben
werden.

## Koexistenz mit React

React- und pingo-TSX-Dateien im selben Repository sind der Normalfall: die Hülle in React,
die leistungskritischen Flächen von pingo gezeichnet.

### Der Mechanismus ist die Deklaration im Dateikopf

`jsxImportSource` gilt **pro Datei**. In die erste Zeile einer pingo-Datei gehört:

```tsx
/** @jsxImportSource @dopejs/pingo */
```

Die `tsconfig.json` des Projekts behält ihre React-Einstellung, und nur Dateien mit dieser
Zeile verwenden die pingo-Runtime. `tsc`, esbuild/Vite und babel respektieren sie alle.

**Die beiden anderen Ideen tragen nicht**, gemessen:

| Ansatz                                                            | Ergebnis                                                                                                                                       |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Eine `tsconfig.json` im Verzeichnis mit anderem `jsxImportSource` | `tsc` ignoriert sie vollständig, Vite wendet sie an — Build und Typprüfung weichen voneinander ab                                              |
| Über `exclude` nach Dateinamen ausschließen                       | `exclude` betrifft nur die Auswahl der Wurzeldateien; sobald eine React-Datei sie `import`iert, kommt sie zurück und wird als React kompiliert |

Damit der Dateiname die Toolchain wirklich steuert, braucht es Composite Project References:
Das pingo-Projekt gibt `.d.ts` aus, das React-Projekt liest Deklarationen statt Quellen.

Die Zeile zu vergessen bricht nicht stillschweigend, sondern beim Kompilieren:

```
error TS2322: Type 'Element' is not assignable to type 'PingoNode'.
error TS2786: 'View' cannot be used as a JSX component.
```

### Das Namenssuffix ist eine Konvention

Wenn beide Dateiarten in einem Verzeichnis liegen, geben Sie den pingo-Dateien ein Suffix wie
`scene.pingo.tsx`: in der Dateiliste sofort unterscheidbar, und brauchbar für Konfiguration
nach Dateinamen wie babels `overrides`. Es ist eine Konvention für Menschen und Werkzeuge und
**ersetzt den Dateikopf nicht**. Ist ein ganzes Verzeichnis pingo, ist das Verzeichnis bereits
das Signal und das Suffix nur Rauschen.

### Die Grenze ist die Dateigrenze

Eine Datei kennt nur eine Art JSX, also lassen sich **in einer React-Komponente keine
pingo-Tags schreiben**. Die pingo-Datei exportiert die Szene, die React-Datei importiert sie:

```tsx
/** @jsxImportSource @dopejs/pingo */
// scene.pingo.tsx
import { Text, View, type PingoNode } from "@dopejs/pingo";

export function scene(label: string): PingoNode {
  return (
    <View width={240} height={80} padding={12}>
      <Text value={label} />
    </View>
  );
}
```

### Mit `PingoContainer` mounten

```tsx
// App.tsx — die Tags dieser Datei gehören React
import { PingoContainer } from "@dopejs/pingo/react";

import { scene } from "./scene.pingo";

export function App() {
  return <PingoContainer scene={scene("Hello")} style={{ height: 320, width: 480 }} />;
}
```

Die Szene kommt als Prop `scene` und nicht als Children, weil die Tags dieser Datei React
gehören und hier keine pingo-Children stehen können.

`PingoContainer` erzeugt das Canvas selbst, statt React es rendern zu lassen und eine Ref zu
nehmen. Das ist **erforderlich**: Der Root übergibt sein Canvas an ein OffscreenCanvas, diese
Übergabe ist endgültig, und React StrictMode führt Effekte in der Entwicklung zweimal aus —
ein von React gerendertes Canvas ginge an einen zweiten Root und scheiterte:

```
this canvas already transferred control to an OffscreenCanvas and cannot host
a second root; create a new canvas element per root
```

Das von der Komponente erzeugte Canvas verschwindet mit dem verworfenen Mount, deshalb tritt
der Fall nicht ein. Auch die Größe braucht keine Behandlung: Der Root folgt der Box seines
eigenen Canvas, den Container per CSS zu dimensionieren genügt.

Wenn Sie den Root brauchen (Scroll-Steuerung, Diagnose-Callbacks), nehmen Sie `onRoot`; für
einen Startfehler `onStartupError`. Laufzeitfehler gehen weiterhin an `options.onHostError`.

### Die beiden Bäume teilen keinen Zustand

Reacts State und Context erreichen den pingo-Komponentenbaum nicht, und umgekehrt ebenso
wenig. Es sind zwei unabhängige Reconciler. Kommunikation über die Grenze ist gewöhnlicher
Datenfluss: React berechnet den Wert und reicht ihn als `scene` hinein, pingo meldet
Ergebnisse über Event-Callbacks zurück.

## Dieses Repository ist das Beispiel

`apps/site` ist eine React-Anwendung und enthält zugleich 73 in pingo-TSX geschriebene
Komponentenvorschauen. Das Verzeichnis, in dem beide zusammenliegen, ist
[`apps/site/src/interop`](https://github.com/dopejs/pingo/tree/main/apps/site/src/interop);
sein Test läuft unter `StrictMode`.
