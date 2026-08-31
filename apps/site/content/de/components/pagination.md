---
title: Pagination
description: Shadcn-Stil Paginierungssteuerelement mit Seitenzahl-Auslassungen und Rand-Deaktivierungszuständen, gerendert auf dem Pingo-Canvas.
---

# Pagination

Paginierungssteuerelement: Die aktuelle Seite wird hervorgehoben, zu lange Seitenzahlfolgen werden automatisch zu Auslassungspunkten zusammengefaltet, und die entsprechenden Pfeile werden deaktiviert, wenn die erste bzw. letzte Seite erreicht ist. Die folgende Vorschau wird von der Pingo-Engine in Echtzeit gerendert – Sie können auf Seitenzahlen und Pfeile klicken, um zu blättern, und der Hell/Dunkel-Wechsel folgt dem Theme der Website.

:::preview pagination-basic
:::

## Verwendung

Die Seitenzahl ist **kontrolliert**: `page` beginnt bei 1, das Blättern wird über `onPageChange` gemeldet und von Ihnen zurückgeschrieben.

```tsx
import { useSignal, type PingoNode } from "@dopejs/pingo";
import { Pagination } from "@dopejs/pingo-ui";

function PagedList(): PingoNode {
  const page = useSignal(1);
  return <Pagination page={page.get()} pageCount={12} onPageChange={(next) => page.set(next)} />;
}
```

## Beispiele

### Kompakter Modus

`siblingCount` steuert die Anzahl der Seitenzahlen, die auf beiden Seiten der aktuellen Seite angezeigt werden (ohne erste und letzte Seite, die immer angezeigt werden). Bei `0` bleiben nur die erste, die letzte und die aktuelle Seite erhalten; auf der ersten Seite ist der Pfeil für die vorherige Seite deaktiviert.

:::preview pagination-compact
:::

Die Faltregeln für die Seitenzahlfolge werden durch die exportierte reine Funktion `paginationRange(page, pageCount, siblingCount)` umgesetzt und können separat getestet werden.

## Props

| Prop            | Typ                      | Standard | Beschreibung                                                                                                                                             |
| --------------- | ------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `page`          | `number`                 | —        | Aktuelle Seite, beginnend bei 1 (erforderlich); Werte außerhalb des Bereichs werden auf `[1, pageCount]` begrenzt                                        |
| `pageCount`     | `number`                 | —        | Gesamtzahl der Seiten (erforderlich); bei weniger als 1 werden keine Seitenzahlen gerendert                                                              |
| `onPageChange`  | `(page: number) => void` | —        | Callback beim Blättern; wird beim Klick auf die aktuelle Seite oder auf ein Ziel außerhalb des Bereichs nicht ausgelöst                                  |
| `siblingCount`  | `number`                 | `1`      | Anzahl der Seitenzahlen, die auf jeder Seite der aktuellen Seite angezeigt werden                                                                        |
| `previousLabel` | `string`                 | —        | Im Typ vorgesehener Text für die vorherige Seite; in der aktuellen Version wird ein Icon gerendert, dieses Feld wird beim Rendering noch nicht verwendet |
| `nextLabel`     | `string`                 | —        | Im Typ vorgesehener Text für die nächste Seite; in der aktuellen Version wird ein Icon gerendert, dieses Feld wird beim Rendering noch nicht verwendet   |
| `className`     | `string`                 | —        | Wird nach den Komponenten-Klassennamen angehängt                                                                                                         |

## Barrierefreiheit

Das Steuerelement hat insgesamt die Semantik `navigation`; die aktuelle Seite trägt den Semantikwert `current`, und die Barrierefreiheitsnamen der Schaltflächen zum Vor- und Zurückblättern lauten "previous page" / "next page". An den Rändern sind sie deaktiviert und reagieren nicht auf Zeiger. Auf der Tastatur blättern `ArrowLeft` / `ArrowRight` bei jedem Fokus innerhalb des Steuerelements. Weitere Informationen finden Sie im [Barrierefreiheitsleitfaden](/guide/accessibility).
