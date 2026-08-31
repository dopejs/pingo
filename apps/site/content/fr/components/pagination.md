---
title: Pagination
description: Contrôle de pagination de style shadcn avec ellipse de numéros de page et désactivation aux limites, rendu sur le canvas pingo.
---

# Pagination

Contrôle de pagination : la page active est mise en surbrillance, les séries de numéros trop longues se replient automatiquement en ellipses, et les flèches correspondantes sont désactivées en première/dernière page. L’aperçu ci-dessous est rendu en temps réel par le moteur pingo — vous pouvez cliquer sur les numéros et les flèches pour tourner les pages, et suivre la bascule clair/sombre du thème du site.

:::preview pagination-basic
:::

## Utilisation

Le numéro de page est **contrôlé** : `page` commence à 1, le changement de page est remonté via `onPageChange`, et c’est à vous de le réécrire.

```tsx
import { useSignal, type PingoNode } from "@dopejs/pingo";
import { Pagination } from "@dopejs/pingo-ui";

function PagedList(): PingoNode {
  const page = useSignal(1);
  return <Pagination page={page.get()} pageCount={12} onPageChange={(next) => page.set(next)} />;
}
```

## Exemples

### Mode compact

`siblingCount` contrôle le nombre de numéros de page affichés de part et d’autre de la page active (hors première et dernière pages, qui sont toujours affichées). Avec `0`, seules la première page, la dernière et la page active sont conservées ; sur la première page, la flèche vers la page précédente est désactivée.

:::preview pagination-compact
:::

La règle de repli de la séquence de numéros est implémentée par la fonction pure exportée `paginationRange(page, pageCount, siblingCount)`, utilisable isolément pour les tests.

## Props

| Prop            | Type                     | Défaut | Description                                                                                                                        |
| --------------- | ------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `page`          | `number`                 | —      | Page active, à partir de 1 (obligatoire) ; une valeur hors limites est ramenée dans `[1, pageCount]`                               |
| `pageCount`     | `number`                 | —      | Nombre total de pages (obligatoire) ; aucun numéro n’est rendu si inférieur à 1                                                    |
| `onPageChange`  | `(page: number) => void` | —      | Rappel de changement de page ; ne se déclenche pas en cliquant sur la page active ou sur une cible hors limites                    |
| `siblingCount`  | `number`                 | `1`    | Nombre de pages affichées de chaque côté de la page active                                                                         |
| `previousLabel` | `string`                 | —      | Libellé de la page précédente réservé dans le type ; la version actuelle rend une icône, ce champ ne participe pas encore au rendu |
| `nextLabel`     | `string`                 | —      | Libellé de la page suivante réservé dans le type ; la version actuelle rend une icône, ce champ ne participe pas encore au rendu   |
| `className`     | `string`                 | —      | Ajouté après le nom de classe du composant                                                                                         |

## Accessibilité

Le contrôle global utilise la sémantique `navigation` ; la page active porte la valeur sémantique `current`, et les noms accessibles des boutons précédent/suivant sont « previous page » / « next page ». Aux limites, ils sont désactivés et ne répondent pas au pointeur. Au clavier, `ArrowLeft` / `ArrowRight` changent de page depuis n’importe quel focus à l’intérieur du contrôle. Pour en savoir plus, consultez le [guide d’accessibilité](/guide/accessibility).
