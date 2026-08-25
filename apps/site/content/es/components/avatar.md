---
title: Avatar
description: Avatar circular que recurre a iniciales cuando falta la imagen, renderizado en el canvas de pingo.
---

# Avatar

Avatar muestra el avatar de un usuario: con un recurso de imagen ya decodificado se muestra
recortado en círculo; sin él, recurre a las iniciales de `fallback`. La vista previa de abajo se
renderiza en vivo con el motor pingo y sigue el tema del sitio al cambiar entre claro y oscuro.

:::preview avatar-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { Avatar } from "@dopejs/pingo-ui";

root.render(createElement(Avatar, { fallback: "张" }));
```

Cuando hay imagen, pasa el recurso `PingoImage` predecodificado; la imagen rellena con
`object-fit: cover` y se recorta en círculo:

```tsx
createElement(Avatar, { image: decodedImage, fallback: "张" });
```

## Ejemplos

### Tamaños

`size` es el lado del cuadrado (px) y además fija el radio de esquina a `size / 2`. Si se omite se
usa el valor por defecto de la piel, 40 px. En la vista previa aparecen, en orden, 32, el valor
por defecto y 56.

```tsx
createElement(Avatar, { fallback: "李", size: 32 });
```

## Props

| Prop        | Tipo         | Valor predeterminado  | Descripción                                                                         |
| ----------- | ------------ | --------------------- | ----------------------------------------------------------------------------------- |
| `image`     | `PingoImage` | —                     | Recurso de imagen predecodificado; si falta se muestran las iniciales de `fallback` |
| `fallback`  | `string`     | —                     | Texto de iniciales mostrado cuando falta la imagen (obligatorio)                    |
| `size`      | `number`     | piel por defecto `40` | Lado del cuadrado (px)                                                              |
| `className` | `string`     | —                     | Se añade tras las clases del propio componente                                      |

## Accesibilidad

Las iniciales de `fallback` también actúan como nombre legible: usa caracteres que representen al
usuario (como el apellido o las iniciales del nombre) y no pases símbolos de marcador de posición.
