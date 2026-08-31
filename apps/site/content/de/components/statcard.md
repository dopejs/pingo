---
title: StatCard
description: Metrik-Karten-Molekülkomponente, die Wert, Veränderung zum Vorzeitraum und Trendfärbung anzeigt und auf der Pingo-Canvas gerendert wird.
---

# StatCard

StatCard ist ein pingo-spezifisches Produktmolekül: eine Metrik-Kachel, bestehend aus Label, Wert, Delta zum Vorzeitraum und Beschreibungstext. `trend` beeinflusst nur die Färbung des Deltas – `flat` bleibt neutral grau, denn ein unveränderter Indikator ist weder gut noch schlecht. Die folgende Vorschau wird von der Pingo-Engine in Echtzeit gerendert und folgt dem Hell-/Dunkel-Theme der Website.

:::preview statcard-basic
:::

Zusammensetzung mit den shadcn-Basiskomponenten: StatCard ist ein eigenständiges Anzeige-Molekül, das intern nur Text-/View-Primitive verwendet und keine Slots reserviert; bei Dashboard-Layouts werden mehrere StatCards üblicherweise mit einem Container mit `flexDirection: "row"` in einer Zeile angeordnet oder mit Card und Divider zu einem Berichtsabschnitt kombiniert. Die Formatierung des Werts (Tausendertrennzeichen, Währungssymbole) übernimmt der Aufrufer; `value`/`delta` sind reine Zeichenketten.

## Verwendung

```tsx
import { StatCard } from "@dopejs/pingo-ui";

root.render(
  <StatCard label="本月营收" value="¥128,400" delta="+12.5%" trend="up" description="较上月" />,
);
```

## Beispiele

### Trendfärbung

`trend` nimmt `"up"` / `"down"` / `"flat"` an und färbt das Delta entsprechend als Anstieg, Rückgang oder neutral; ohne `trend` wird es wie `flat` behandelt.

### Ohne Delta

Wird `delta` weggelassen, steht der Wert allein in einer Zeile und `trend` hat keine Wirkung; `description` kann ebenfalls weggelassen werden.

```tsx
<StatCard label="在线设备" value="1,024" />
```

## Props

| Prop          | Typ                        | Standard | Beschreibung                                                            |
| ------------- | -------------------------- | -------- | ----------------------------------------------------------------------- |
| `label`       | `string`                   | —        | Name des Indikators (erforderlich)                                      |
| `value`       | `string`                   | —        | Wert des Indikators, Formatierung übernimmt der Aufrufer (erforderlich) |
| `delta`       | `string`                   | —        | Veränderung zum Vorzeitraum, z. B. `+12.5%`                             |
| `trend`       | `"up" \| "down" \| "flat"` | `"flat"` | Färbungsrichtung des Deltas, beeinflusst keine anderen Teile            |
| `description` | `string`                   | —        | Beschreibungstext am unteren Rand, z. B. Vergleichszeitraum             |
| `className`   | `string`                   | —        | Wird an den Komponenten-Klassennamen angehängt                          |

## Barrierefreiheit

StatCard hat die semantische Rolle `group`, der barrierefreie Name stammt aus `label`; Label, Wert und Delta werden von Hilfstechnologien als Text innerhalb der Gruppe nacheinander vorgelesen. Wenn der Trend nur über Farbe ausgedrückt wird, stellen Sie sicher, dass der `delta`-Text selbst Richtungsinformationen enthält (z. B. ein `+`-/`-`-Präfix), und verlassen Sie sich nicht allein auf die Rot-Grün-Färbung.
