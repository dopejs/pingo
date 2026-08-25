---
title: Skeleton
description: Bloque de esqueleto de marcador de posición durante la carga de contenido, renderizado en el lienzo de pingo.
---

# Skeleton

Skeleton muestra bloques de marcador de posición con una forma similar al diseño final antes de que termine de cargar el contenido, reduciendo la sensación de salto durante la espera. La vista previa a continuación es renderizada en tiempo real por el motor de pingo y sigue el tema del sitio para alternar entre claro y oscuro.

:::preview skeleton-card
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { Skeleton } from "@dopejs/pingo-ui";

root.render(createElement(Skeleton, { width: 320, height: 16 }));
```

Tanto `width` como `height` pueden omitirse; en ese caso, el tamaño queda completamente a cargo del layout exterior y de tu hoja de estilos.

## Ejemplos

### Componer un esqueleto de página

Usa múltiples Skeleton de distintos tamaños para armar la estructura del contenido que está por aparecer; la vista previa superior es un esqueleto de tarjeta de «avatar + título + dos líneas de texto». pingo no tiene una propiedad gap; el espaciado entre bloques se logra con contenedores vacíos de tamaño fijo, consulta la [guía de estilos](/guide/styling).

## Props

| Prop        | 类型     | 默认值 | 说明                                                                               |
| ----------- | -------- | ------ | ---------------------------------------------------------------------------------- |
| `width`     | `number` | —      | Ancho del bloque de marcador de posición (px); si se omite, lo determina el layout |
| `height`    | `number` | —      | Alto del bloque de marcador de posición (px); si se omite, lo determina el layout  |
| `className` | `string` | —      | Se agrega después de la clase del componente                                       |

## Accesibilidad

Skeleton es un marcador de posición decorativo y no aporta semántica. Una vez finalizada la carga, debe reemplazarse por completo con el contenido real; permanecer mucho tiempo en la pantalla de esqueleto significa que la carga falló, por lo que debes ofrecer un mensaje de error y una vía de reintento.

Actualmente es un marcador de posición estático (sin animación de pulso); el subconjunto de animaciones básicas aún no admite CSS keyframes.
