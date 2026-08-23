---
title: Sélecteur de date
description: Sélecteur de calendrier contextuel qui lie une date, rendu sur le canevas pingo.
---

# Sélecteur de date

Le sélecteur de date est un [Calendrier](/components/calendar) lié à une valeur : un déclencheur plus un calendrier mensuel contextuel. L'aperçu ci-dessous est rendu en temps réel par le moteur pingo — le calendrier est déjà déplié, vous pouvez tourner les pages, choisir une date, et il suit le thème clair ou sombre du site.

:::preview date-picker-basic
:::

## Utilisation

```tsx
import { createElement } from "@dopejs/pingo";
import { DatePicker, type CalendarDate } from "@dopejs/pingo-ui";

root.render(
  createElement(DatePicker, {
    placeholder: "选择日期",
    onSelect: (date: CalendarDate) => console.log(date),
  }),
);
```

La date est représentée par `CalendarDate` (`{ year, month, day }`) — stockée en champs séparés, aucun fuseau horaire ne peut la décaler d'un jour. Une fois la date choisie, le panneau se referme automatiquement : un sélecteur qui reste ouvert n'est plus qu'un calendrier.

## Exemples

### Formatage et texte indicatif

Le déclencheur affiche par défaut la date sélectionnée au format `YYYY-MM-DD` ; `format` personnalise le rendu, `placeholder` personnalise le texte indicatif lorsqu'aucune date n'est sélectionnée.

### Ouverture contrôlée

`open` et `onOpenChange` forment une ouverture contrôlée ; par défaut, le composant gère lui-même son état d'ouverture.

## Props

| Prop            | Type                              | Valeur par défaut                      | Description                                                   |
| --------------- | --------------------------------- | -------------------------------------- | ------------------------------------------------------------- |
| `value`         | `CalendarDate`                    | —                                      | Date sélectionnée                                             |
| `month`         | `CalendarDate`                    | —                                      | Mois affiché contrôlé                                         |
| `defaultMonth`  | `CalendarDate`                    | `value ?? 2026-01-01`                  | Mois initial non contrôlé                                     |
| `onSelect`      | `(date: CalendarDate) => void`    | —                                      | Rappel à la sélection d'une date (puis fermeture automatique) |
| `onMonthChange` | `(month: CalendarDate) => void`   | —                                      | Rappel au changement de page                                  |
| `weekdayLabels` | `readonly string[]`               | `["日","一","二","三","四","五","六"]` | En-têtes des jours de la semaine                              |
| `monthLabel`    | `(month: CalendarDate) => string` | —                                      | Titre de mois personnalisé                                    |
| `isDisabled`    | `(date: CalendarDate) => boolean` | —                                      | Désactive des dates précises                                  |
| `open`          | `boolean`                         | —                                      | Ouverture contrôlée                                           |
| `onOpenChange`  | `(open: boolean) => void`         | —                                      | Rappel d'ouverture et de fermeture                            |
| `placeholder`   | `string`                          | `"选择日期"`                           | Texte indicatif lorsqu'aucune date n'est sélectionnée         |
| `format`        | `(date: CalendarDate) => string`  | `formatDate` (`YYYY-MM-DD`)            | Rendu de la date sur le déclencheur                           |
| `className`     | `string`                          | —                                      | Ajouté après le nom de classe du composant                    |

## Accessibilité

Le déclencheur porte la sémantique d'un bouton et bascule entre `expanded` et `collapsed` ; la partie calendrier hérite de la sémantique de grille du Calendrier. Lorsque le panneau s'ouvre, le focus entre dans le panneau ; lorsqu'il se referme, il revient au déclencheur.
