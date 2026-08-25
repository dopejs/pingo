---
title: Toast
description: Notification légère qui apparaît dans un coin, portée par ToastViewport et rendue sur le canevas pingo.
---

# Toast

Toast est une notification légère qui apparaît brièvement dans un coin, idéale pour un retour immédiat comme une sauvegarde réussie ou un échec de synchronisation. L'aperçu ci-dessous est rendu en temps réel par le moteur pingo — cliquez sur le bouton pour déclencher un toast, qui suit le thème clair ou sombre du site.

:::preview toast-basic
:::

## Utilisation

Toast doit être utilisé avec `ToastViewport`. Le viewport est un conteneur d'angle positionné en absolu (en haut à droite par défaut), **qui doit être monté sous un conteneur proche de la racine** — dans ce moteur, le bloc conteneur est le nœud parent et non l'ancêtre positionné le plus proche ; monté dans un petit conteneur, il ne couvrira que ce petit conteneur.

```tsx
import { createElement } from "@dopejs/pingo";
import { Button, Toast, ToastViewport } from "@dopejs/pingo-ui";

let open = false;

function scene() {
  return createElement("container", {
    width: surfaceWidth,
    height: surfaceHeight,
    children: [
      createElement(Button, {
        children: "Enregistrer",
        onPress: () => {
          open = true;
          root.render(scene());
        },
      }),
      createElement(ToastViewport, {
        children: createElement(Toast, {
          open,
          title: "Enregistré",
          description: "La configuration a été écrite en local.",
        }),
      }),
    ],
  });
}
```

L'affichage, le masquage et le moment de fermeture automatique sont contrôlés par l'application : il suffit d'inverser `open` et d'appeler à nouveau `root.render(...)` (c'est le modèle utilisé par le bouton de l'aperçu).

## Exemples

### Variantes

`variant="destructive"` est utilisé pour les notifications d'échec. Dans ce cas, le texte de description n'utilise plus la couleur de premier plan atténuée — le fond destructif a déjà inversé le premier plan ; l'atténuer davantage donnerait du texte gris sur fond rouge.

:::preview toast-variants
:::

## Props

### Toast

| Prop          | Type                         | Défaut      | Description                                                                 |
| ------------- | ---------------------------- | ----------- | --------------------------------------------------------------------------- |
| `open`        | `boolean`                    | —           | Indique s'il est affiché ; rend `null` lorsque `false` (obligatoire)        |
| `title`       | `string`                     | —           | Titre (obligatoire)                                                         |
| `description` | `string`                     | —           | Corps de la description ; la ligne de description n'est pas rendue si omise |
| `variant`     | `"default" \| "destructive"` | `"default"` | Variante visuelle                                                           |
| `className`   | `string`                     | —           | Ajouté après le nom de classe du composant                                  |

### ToastViewport

| Prop        | Type        | Défaut | Description                                                                                                      |
| ----------- | ----------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| `children`  | `PingoNode` | —      | Liste des toasts dans le viewport ; plusieurs sont empilés verticalement avec un espacement de 8px (obligatoire) |
| `className` | `string`    | —      | Ajouté après le nom de classe du composant                                                                       |

## Accessibilité

Toast porte le rôle sémantique `status` ; les technologies d'assistance l'annoncent comme message d'état. Un toast n'interrompt pas le focus courant ; conservez également un retour persistant sur la page (comme `Alert`) pour le résultat des actions critiques.
