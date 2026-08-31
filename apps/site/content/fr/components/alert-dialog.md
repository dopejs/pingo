---
title: Alert Dialog
description: Boîte de dialogue de confirmation pour les opérations destructives, avec paire de boutons annuler/confirmer intégrée.
---

# Alert Dialog

La boîte de dialogue de confirmation est un Dialog doté d'une paire de boutons « Annuler /
Confirmer » intégrée, pour une seconde confirmation avant une opération irréversible. L'aperçu
ci-dessous est rendu en direct par le moteur pingo et suit le thème clair/sombre du site.

:::preview alert-dialog-basic
:::

## Utilisation

```tsx
import { AlertDialog } from "@dopejs/pingo-ui";

root.render(
  <AlertDialog
    open={open}
    onOpenChange={(next) => setOpen(next)}
    title="确认退出？"
    description="未保存的修改将会丢失。"
    onCancel={() => {}}
    onAction={() => quit()}
  >
    {null}
  </AlertDialog>,
);
```

Comme Dialog, le surlayer remplit son propre conteneur parent — montez-le près de la racine. Notez
que `children`, hérité de `DialogProps`, reste obligatoire mais est remplacé par la structure
titre/description/boutons intégrée au composant : passez `null`. Un clic sur Annuler ou Confirmer
déclenche d'abord le callback correspondant, puis demande la fermeture via `onOpenChange(false)` ;
un clic sur le masque ferme également.

## Exemples

### Opération destructive

`destructive` rend le bouton de confirmation en couleur danger.

:::preview alert-dialog-destructive
:::

## Props

Hérite de `DialogProps` (`open`, `onOpenChange`, `children`, `className`), plus :

| Prop          | Type         | Valeur par défaut | Description                                  |
| ------------- | ------------ | ----------------- | -------------------------------------------- |
| `title`       | `string`     | —                 | Titre (obligatoire)                          |
| `description` | `string`     | —                 | Explication complémentaire                   |
| `cancelLabel` | `string`     | `"取消"`          | Texte du bouton Annuler                      |
| `actionLabel` | `string`     | `"确定"`          | Texte du bouton Confirmer                    |
| `onCancel`    | `() => void` | —                 | Callback d'annulation (fermeture ensuite)    |
| `onAction`    | `() => void` | —                 | Callback de confirmation (fermeture ensuite) |
| `destructive` | `boolean`    | `false`           | Bouton de confirmation en couleur danger     |

## Accessibilité

Possède la sémantique dialog ; les boutons Annuler et Confirmer sont tous deux inscrits dans le
cycle de Tab — les utilisateurs au clavier ne restent jamais piégés dans la boîte de dialogue.
