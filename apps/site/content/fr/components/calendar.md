---
title: Calendar
description: Calendrier mensuel de style shadcn à grille fixe de six lignes, dates exprimées en parties année/mois/jour pour éviter tout décalage de fuseau horaire.
---

# Calendar

Calendrier mensuel de style shadcn. Les dates s'expriment en trois parties `{ year, month, day }`
(`month` commence à 1), qu'aucun fuseau horaire ne peut décaler ; la grille compte toujours six
lignes, donc la hauteur du composant ne change pas quand on tourne les mois. L'aperçu ci-dessous
est rendu en direct par le moteur pingo — cliquez pour choisir une date, tournez les mois avec les
flèches ; il suit le thème clair/sombre du site.

:::preview calendar-basic
:::

## Utilisation

La sélection est **contrôlée** : cliquer sur une date déclenche `onSelect`, et c'est à vous de
réécrire `value`. Le mois, lui, peut être géré en interne (`defaultMonth`) ou entièrement contrôlé
via `month` + `onMonthChange`.

```tsx
import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
import { Calendar, type CalendarDate } from "@dopejs/pingo-ui";

function DateField(): PingoNode {
  const selected = useSignal<CalendarDate>({ year: 2026, month: 8, day: 22 });
  return createElement(Calendar, {
    defaultMonth: { year: 2026, month: 8, day: 1 },
    value: selected.get(),
    onSelect: (date) => selected.set(date),
  });
}
```

## Exemples

### Dates désactivées

`isDisabled` indique, date par date, si elle est sélectionnable ; une date désactivée ne répond ni
au pointeur ni au clavier. Ici, les week-ends sont désactivés :

:::preview calendar-disabled
:::

## Props

### CalendarProps

| Prop            | Type                              | Valeur par défaut                      | Description                                                  |
| --------------- | --------------------------------- | -------------------------------------- | ------------------------------------------------------------ |
| `value`         | `CalendarDate`                    | —                                      | Date sélectionnée (contrôlé)                                 |
| `month`         | `CalendarDate`                    | —                                      | Mois affiché (contrôlé) ; géré par l'état interne si omis    |
| `defaultMonth`  | `CalendarDate`                    | `value` ?? janvier 2026                | Mois initial en mode non contrôlé                            |
| `onSelect`      | `(date: CalendarDate) => void`    | —                                      | Callback de clic sur une date                                |
| `onMonthChange` | `(month: CalendarDate) => void`   | —                                      | Callback de changement de mois (contrôlé comme non contrôlé) |
| `weekdayLabels` | `readonly string[]`               | `["日","一","二","三","四","五","六"]` | En-têtes de jours de semaine, à partir du dimanche           |
| `monthLabel`    | `(month: CalendarDate) => string` | Format `"2026 年 8 月"`                | Titre de mois personnalisé                                   |
| `isDisabled`    | `(date: CalendarDate) => boolean` | —                                      | Désactive certaines dates                                    |
| `className`     | `string`                          | —                                      | Ajouté après les classes du composant                        |

### CalendarDate

| Champ   | Type     | Description |
| ------- | -------- | ----------- |
| `year`  | `number` | Année       |
| `month` | `number` | Mois, 1–12  |
| `day`   | `number` | Jour, 1–31  |

Le paquet exporte aussi des fonctions pures comme `daysInMonth`, `monthGrid`, `shiftMonth` et
`sameDate`, pratiques pour une logique de dates personnalisée.

## Accessibilité

Le calendrier entier porte la sémantique `group` ; les flèches de changement de mois ont pour noms
d'accessibilité « previous month » / « next month », les cellules de date la sémantique button, et
la date sélectionnée la valeur sémantique `selected`. Au clavier, `PageUp` / `PageDown` changent
de mois depuis n'importe quel point de la grille — l'utilisateur clavier n'est jamais coincé dans
le mois courant. Plus de détails dans le [guide d'accessibilité](/guide/accessibility).
