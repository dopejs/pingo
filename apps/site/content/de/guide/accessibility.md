# Barrierefreiheit und Testbarkeit

## Vom ersten Tag an in der Architektur

Canvas-Inhalte sind für Screenreader von Natur aus unsichtbar. pingo behandelt Barrierefreiheit nicht als
Schicht, die nach der Veröffentlichung übergestülpt wird: Der Core pflegt einen Semantikbaum
(role / label / value / bounds / focusable), und `@dopejs/pingo-a11y` bildet ihn inkrementell auf einen
absolut positionierten DOM-Schattenbaum neben dem canvas ab.

Die Schattenelemente sind optisch transparent, existieren aber im Barrierefreiheitsbaum und in der
Tabulatorreihenfolge; ihr Fokussieren wird an die Bearbeitungssitzung der Engine weitergeleitet, sodass
Tastaturnutzende die Eingabefelder im canvas tatsächlich bedienen können.

## Semantik deklarieren

```tsx
<container semanticRole="region" semanticLabel="Zahlungsbereich">
  <text value="Zahlung" semanticRole="heading" semanticLabel="Zahlung" />
  {TextField({ semanticLabel: "Empfänger", value, revision })}
</container>
```

`editableText` besitzt standardmäßig Textbox-Semantik. Der Wert eines Passwortfelds gelangt **niemals**
in den Semantikbaum.

## E2E-Tests über Semantik

Weil der Semantikbaum in echtes DOM gespiegelt wird, können E2E-Tests über Rolle und Name auswählen
statt Pixel zu vergleichen:

```ts
import { getByRole, queryAllByRole } from "@dopejs/pingo";

const email = getByRole(document.body, "textbox", { name: "Empfänger" });
email.focus(); // wird an die Bearbeitungssitzung der Engine weitergeleitet
expect(queryAllByRole(document.body, "textbox")).toHaveLength(2);
```

Pixel-Schnappschüsse bleiben erhalten, aber als **ergänzender Nachweis** der Renderkorrektheit, nicht
als einzige Zusicherung. Diese Entscheidung verhindert, dass UI-Tests reihenweise scheitern, sobald sich
Font-Rendering oder Kantenglättung ändern.

## Behaupten, was tatsächlich gezeichnet wurde

Der Semantikbaum beantwortet, was ein Knoten ist -- nicht, ob dieser Frame die
Zeichenkette wirklich gezeichnet hat. Dazwischen liegen Sichtbarkeit,
Zeichenreihenfolge, Virtualisierung und der Subtree-Cache, und die Befehle des
Hauptzeichenpfads führen die Zeichenkette gar nicht mit. `onPaintedText` liefert
die andere Hälfte:

```ts
let painted: PaintedTextSnapshot | undefined;
const root = await createHostedCanvasRoot(canvas, {
  onPaintedText: (snapshot) => (painted = snapshot),
});

// Der Semantikbaum sagt, der Button ist da; die Sonde sagt, er wurde gezeichnet.
getByRole(document.body, "button", { name: "Speichern" });
expect(painted?.records.some((record) => record.text === "Speichern")).toBe(true);
```

Der Snapshot trifft einmal pro Frame ein, `root.paintedText()` liefert den letzten.
Jeder Eintrag nennt `nodeId`, `text`, den Geräteursprung `origin`, den Zeichenkanal
`channel` und `originClipped`. Ohne `onPaintedText` berechnet die Engine ihn gar
nicht; ein Frame kostet dann genau so viel wie ohne diese Fähigkeit.

Zwei Grenzen: gemeldet wird, was der **Core ausgegeben** hat, nicht was nach dem
Replay noch sichtbar ist -- das Viewport-Culling passiert im Backend. Und ein
Passwortfeld meldet die Maske `•`, weil genau das gezeichnet wird.

## Den Semantikbaum beobachten

```ts
const root = await createHostedCanvasRoot(canvas, {
  onSemantics: (nodes) => inspect(nodes),
  accessibility: true, // standardmäßig aktiv; false schaltet den Schattenbaum ab
});
```

Jeder Knoten liefert `nodeId`, `role`, `label`, `value`, die `bounds` in Weltkoordinaten, `focusable`,
`focused` und das `password`-Flag. In der Frame-Diagnose lässt sich über `dirtySemanticsNodes` die
Häufigkeit semantischer Invalidierung beobachten.

## Plattformqualifizierung

Automatisiert abgedeckt sind der Export des Semantikbaums, die Abbildung auf den Schattenbaum, die
Selektoren über Rolle und Beschriftung sowie der Tastaturvertrag.
**Die Verhaltensmatrix echter Screenreader (VoiceOver, NVDA, TalkBack) gehört zur
Plattformqualifizierung**, wird getrennt verfolgt und zählt nicht als Abschlussbedingung der Entwicklung.
Diese Grenze verhindert, dass ungeprüfte Geräteergebnisse als Supportzusage ausgegeben werden.

In der [Semantik-Demo im Playground](/de/playground#/semantics) können Sie den aktuellen Semantikbaum
direkt auslesen.
