---
title: Avatar
description: Avatar circulaire avec repli sur des initiales quand l'image manque, rendu dans le canvas pingo.
---

# Avatar

Avatar affiche la photo d'un utilisateur : avec une ressource image déjà décodée, elle est
affichée rognée en cercle ; sans image, repli sur l'abréviation `fallback`. L'aperçu ci-dessous
est rendu en direct par le moteur pingo et suit le thème clair/sombre du site.

:::preview avatar-basic
:::

## Utilisation

```tsx
import { Avatar } from "@dopejs/pingo-ui";

root.render(<Avatar fallback="张" />);
```

Avec une image, passez la ressource `PingoImage` pré-décodée ; l'image est remplie en
`object-fit: cover` et rognée en cercle :

```tsx
<Avatar image={decodedImage} fallback="张" />
```

## Exemples

### Tailles

`size` est le côté du carré (px) et fixe aussi le rayon de bordure à `size / 2`. Sans `size`,
c'est le 40 px par défaut de l'habillage. L'aperçu montre dans l'ordre 32, défaut, 56.

```tsx
<Avatar fallback="李" size={32} />
```

## Props

| Prop        | Type         | Valeur par défaut                | Description                                                                 |
| ----------- | ------------ | -------------------------------- | --------------------------------------------------------------------------- |
| `image`     | `PingoImage` | —                                | Ressource image pré-décodée ; sans elle, l'abréviation `fallback` s'affiche |
| `fallback`  | `string`     | —                                | Texte d'abréviation, affiché quand l'image manque (obligatoire)             |
| `size`      | `number`     | `40` par défaut dans l'habillage | Côté du carré (px)                                                          |
| `className` | `string`     | —                                | Ajouté après les classes du composant                                       |

## Accessibilité

L'abréviation `fallback` sert aussi de nom lisible : utilisez un caractère qui représente
l'utilisateur (nom de famille ou initiales), jamais un symbole de remplissage.
