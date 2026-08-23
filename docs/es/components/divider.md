---
title: Divider
description: Línea divisoria visual horizontal o vertical, renderizada en el lienzo de pingo.
---

# Divider

Las líneas divisorias proporcionan agrupación visual entre contenidos. La vista previa siguiente se renderiza en tiempo real mediante el motor de pingo y sigue el cambio de tema claro/oscuro del sitio.

:::preview divider-horizontal
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { Divider } from "@dopejs/pingo-ui";

root.render(createElement(Divider, {}));
```

## Ejemplos

### Línea divisoria vertical

Pasa `orientation: "vertical"` para obtener una línea divisoria vertical. La altura de una línea divisoria vertical es el 100 % del contenedor padre, por lo que el contenedor padre debe tener una altura definida.

:::preview divider-vertical
:::

## Props

| Prop | Tipo | Valor predeterminado | Descripción |
| --- | --- | --- | --- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Dirección de la línea divisoria |
| `className` | `string` | — | Se añade después del nombre de clase del componente |

Una línea divisoria horizontal tiene un ancho del 100 % del contenedor padre y una altura de 1 px; una línea divisoria vertical tiene una altura del 100 % del contenedor padre y un ancho de 1 px.

## Accesibilidad

Divider es un elemento puramente visual, no tiene rol semántico y las tecnologías de asistencia lo ignorarán; la agrupación de contenido debe expresarse mediante estructuras semánticas como los encabezados.
