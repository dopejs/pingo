---
title: Badge
description: "Nicht interaktives Status-Label, gerendert auf dem pingo-Canvas."
---

# Badge

Badge ist ein nicht interaktives Status-Label zum Markieren von Zustand, Kategorie oder Anzahl, etwa
„Admin“ oder „Beta“. Die Vorschau unten wird von der pingo-Engine in Echtzeit gerendert und folgt
dem Hell-/Dunkel-Theme der Website.

:::preview badge-variants
:::

## Verwendung

```tsx
import { Badge } from "@dopejs/pingo-ui";

root.render(<Badge>Beta</Badge>);
```

## Beispiele

### Varianten

Vier Varianten decken die üblichen Bedeutungen ab: `default` (betont), `secondary` (zurückgenommen),
`destructive` (Fehler/Gefahr), `outline` (umrandet). Die Vorschau zeigt sie in dieser Reihenfolge.

```tsx
<Badge variant="secondary">只读</Badge>
```

### Kombination mit anderen Komponenten

Badge wird oft als Trailing-Element einer Listenzeile oder Karte verwendet und mit `Avatar` und
`ListRow` kombiniert:

```tsx
<ListRow
  title="张三"
  leading={<Avatar fallback="张" size={32} />}
  trailing={<Badge>管理员</Badge>}
  onPress={() => {}}
/>
```

## Props

| Prop            | Typ                                                      | Standardwert | Beschreibung                                                 |
| --------------- | -------------------------------------------------------- | ------------ | ------------------------------------------------------------ |
| `children`      | `string`                                                 | —            | Labeltext (Pflicht)                                          |
| `variant`       | `"default" \| "secondary" \| "destructive" \| "outline"` | `"default"`  | Visuelle Variante                                            |
| `semanticLabel` | `string`                                                 | —            | Barrierefreiheitsname; ohne Angabe gilt die Standardsemantik |
| `className`     | `string`                                                 | —            | Wird hinter die Komponentenklassen gehängt                   |

## Barrierefreiheit

Badge reagiert weder auf Zeiger noch auf Tastatur und ist ein reines Anzeigeelement. Wenn der Text
die Bedeutung nicht allein trägt (etwa ein reines Zahlen-Badge), geben Sie die vollständige
Beschreibung über `semanticLabel` an.
