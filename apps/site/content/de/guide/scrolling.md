# Scrollen und Virtualisierung

## Scrollen entsteht aus overflow

Sobald ein View auf einer Achse `overflow-x` / `overflow-y` als `auto`, `scroll` oder
`hidden` deklariert, ist er auf dieser Achse ein Scroll-Container. Ein anderes Element
ist dafür nicht nötig:

```ts
View({
  style: { height: 480, overflowY: "auto" },
  children: rows,
});
```

Gesten, Mausrad, Scroll-Verkettung und die Scrollbar folgen alle aus dieser einen
Deklaration: der Hit-Pfad sucht nach oben den nächsten scrollenden Vorfahren, und die
Bar zeichnet der Core aus dem Scroll-Zustand, den er ohnehin hält -- ein Scroll-Frame
erreicht die Shell also nicht. `hidden` verhält sich wie in CSS: keine Bar für den
Benutzer, programmatisches Scrollen weiterhin möglich.

**Scrollen ist nicht Virtualisierung.** `overflow` lässt die Box scrollen und rät nicht,
ob die Daten gefenstert werden sollen. Das `virtual` weiter unten ist ein ausdrücklicher
Vertrag und wird niemals aus `overflow` oder aus bereits materialisierten Kindern
abgeleitet.

## Warum die Virtualisierung in der Engine sitzt

Die Ausreißerlatenz DOM-basierter virtueller Listen entsteht durch die Kette: das Scroll-Ereignis geht
zurück in den Hauptthread, löst setState aus, dann Diff, dann Neulayout. Sobald der Hauptthread
beschäftigt ist, fallen Frames aus.

pingo legt die Fensterberechnung in den Core: laufendes Scrollen **ruft die TypeScript-Schale nie auf**.
Sie materialisiert nur den sichtbaren Bereich gemäß dem vom Core geplanten Vorwärmfenster; sind die Daten
noch nicht da, wird ein Platzhalter gezeichnet und in späteren Frames nachgereicht.

## Einem View ein Datenfenster geben

Virtualisierung ist eine Eigenschaft des Views, keine andere Komponente: dieselbe scrollende Box trägt gewöhnliche Kinder ebenso wie eine Million Zeilen.

```ts
View({
  style: { width: 480, height: 640, overflowY: "auto" },
  virtual: {
    axis: "y",
    itemCount: 1_000_000,
    estimatedItemSize: 32,
    getItemKey: (index: number) => `order-${index}`,
    renderItem: (index: number) =>
      View({
        style: { height: 32 },
        children: Text({ value: `Zeile ${index}` }),
      }),
  },
});
```

`estimatedItemSize` ist nur eine Anfangsschätzung. Sobald die echte Größe gemessen ist,
korrigiert der Core die Ankerposition über einen Präfixsummenbaum (Fenwick), damit die
Scrollbar nicht springt.

`axis` ist einachsig: ein Fenster bedient `x` oder `y`, nicht beides.

Die Komponente `VirtualList` gibt es weiterhin; sie ist die Kurzform für eine vertikale Liste
und landet auf demselben Core-Vertrag. Für die horizontale Achse, für `getItemKey` oder wenn
dieselbe Box gewöhnlichen Inhalt und ein Fenster tragen soll, nimm `virtual` am View.

## Einstellbare Größen

| `virtual`-Feld           | Rolle                                                                    |
| ------------------------ | ------------------------------------------------------------------------ |
| `axis`                   | Achse des Fensters, `x` oder `y` (Standard `y`)                          |
| `itemCount`              | Gesamtzahl der logischen Einträge                                        |
| `estimatedItemSize`      | Anfangsschätzung, nach der Messung vom Core korrigiert                   |
| `getItemKey`             | Stabile Kennung eines Eintrags, für Wiederverwendung über Fenster hinweg |
| `renderItem`             | Materialisiert einen Eintrag, nur für Indizes im Vorwärmfenster          |
| `baseOverscanViewports`  | Symmetrischer Vorwärmbereich (Vielfache des Viewports)                   |
| `velocityHorizonSeconds` | Projektionsdauer der Geschwindigkeit für die Richtungsvorhersage         |
| `maximumAheadViewports`  | Obergrenze des Vorwärmens in eine Richtung                               |

Die Richtungsvorhersage wärmt bei einem schnellen Wisch bevorzugt die Bewegungsrichtung vor, statt das
Budget symmetrisch auf beide Seiten zu verteilen.

## Programmatisches Scrollen

`scrollX` / `scrollY` sind Eigenschaften des Views selbst und unabhängig davon, ob
virtualisiert wird. Nur eine Wertänderung sendet genau eine `ScrollTo`-Mutation:

```ts
View({ style: { height: 480, overflowY: "auto" }, scrollY: 500_000 * 32, children: rows });
```

Oder über die API zur direkten Manipulation am Root, gedacht für eigene Gesten:

```ts
root.beginScroll(handle);
root.scrollBy(handle, 0, deltaY, elapsedMs);
root.endScroll(handle); // der Core schätzt die Schwunggeschwindigkeit
```

`handle` stammt aus dem `ref`-Callback des Elements (`NodeHandle`).

## Mausrad und Trackpad

Die **Wegstrecke** des Mausrads entspricht der des Browsers, doch die Übertragungskurve trennt sich nach
Eingabequelle: hochpräzise Deltas (Trackpad) werden sofort 1:1 angewendet, und die Trägheit liefert
weiterhin der Ereignisstrom des Betriebssystems; diskrete Rastschritte summieren sich zu einem animierten
Ziel, dem exponentiell abklingend gefolgt wird — hart auf die Inhaltsgrenzen begrenzt und ohne
Überscrollen, genau wie im Browser.

## Verschachtelung und Bearbeitung

Das Mausrad scrollt den nächsten scrollenden Vorfahren, also den nächsten View mit
deklariertem `overflow`. Beginnt ein Zeiger-Drag über editierbarem Text, hat die
Textauswahl Vorrang vor dem Scroll-Drag. Diese Reihenfolge ergibt sich aus der Tiefe im
Hit-Pfad; die Anwendung muss nichts tun.

## Leistungsmaßstab

Der automatische Benchmark auf einem festen Fixture (eine Million Zeilen, 20.000 Frames) ist Teil des
Merge-Gates. Aktuell liegen P95/P99 der Wiedergabe im Submikrosekundenbereich, und dreißig Minuten
durchgehendes Scrollen zeigen kein unkontrolliertes Speicherwachstum.

P95/P99 auf echten Geräten und die Eingabelatenz gehören zur Plattformqualifizierung und sind keine
Abschlussbedingung der Entwicklung. Diese Trennlinie ist bewusst gezogen: Sie verhindert, dass nicht
reproduzierbare Gerätedaten die Arbeit blockieren, und ebenso, dass Entwicklungszahlen als Gerätezusage
ausgegeben werden.

In der [Scroll-Demo im Playground](/de/playground#/scroll) sehen Sie die Frame-Metriken in Echtzeit.
