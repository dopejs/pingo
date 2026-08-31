---
title: StatCard
description: Sous-composant de carte d’indicateur, affiche la valeur, la variation périodique et la coloration de tendance, rendu sur le canvas pingo.
---

# StatCard

StatCard est une molécule de produit propre à pingo : une tuile d’indicateur composée d’un libellé, d’une valeur, d’un delta périodique et d’un texte descriptif. `trend` n’affecte que la coloration du delta — `flat` reste en gris neutre, car un indicateur stable n’est ni bon ni mauvais. L’aperçu ci-dessous est rendu en temps réel par le moteur pingo et suit le thème clair/sombre du site.

:::preview statcard-basic
:::

Relation de composition avec les primitives shadcn : StatCard est une molécule d’affichage autonome qui n’utilise en interne que les primitives Text/View, sans réserver d’emplacement ; dans une mise en page de tableau de bord, on utilise généralement un container avec `flexDirection: "row"` pour aligner plusieurs StatCard sur une ligne, ou on les combine avec Card et Divider pour former un bloc de rapport. Le formatage de la valeur (séparateurs de milliers, symbole monétaire) est à la charge de l’appelant, `value`/`delta` étant de simples chaînes.

## Utilisation

```tsx
import { StatCard } from "@dopejs/pingo-ui";

root.render(
  <StatCard label="本月营收" value="¥128,400" delta="+12.5%" trend="up" description="较上月" />,
);
```

## Exemples

### Coloration de tendance

`trend` accepte `"up"` / `"down"` / `"flat"`, et colore respectivement le delta en hausse, en baisse ou en neutre ; si `trend` n’est pas fourni, le comportement est celui de `flat`.

### Sans delta

Lorsque `delta` est omis, la valeur occupe seule une ligne, `trend` est sans effet ; `description` peut également être omis.

```tsx
<StatCard label="在线设备" value="1,024" />
```

## Props

| Prop          | Type                       | Défaut   | Description                                                                      |
| ------------- | -------------------------- | -------- | -------------------------------------------------------------------------------- |
| `label`       | `string`                   | —        | Nom de l’indicateur (obligatoire)                                                |
| `value`       | `string`                   | —        | Valeur de l’indicateur, le formatage est à la charge de l’appelant (obligatoire) |
| `delta`       | `string`                   | —        | Variation périodique, par exemple `+12.5%`                                       |
| `trend`       | `"up" \| "down" \| "flat"` | `"flat"` | Sens de coloration du delta, sans effet sur les autres parties                   |
| `description` | `string`                   | —        | Texte descriptif en bas, comme la période de comparaison                         |
| `className`   | `string`                   | —        | Ajouté après le nom de classe du composant                                       |

## Accessibilité

StatCard possède le rôle sémantique `group`, le nom accessible reprend `label`, et le libellé, la valeur ainsi que le delta sont lus successivement par les technologies d’assistance en tant que texte du groupe. Lorsque la tendance est exprimée uniquement par la couleur, veillez à ce que le texte `delta` porte lui-même l’information de sens (par exemple un préfixe `+`/`-`), et ne dépendez pas uniquement du coloriage rouge/vert.
