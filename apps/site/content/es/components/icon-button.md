---
title: Icon Button
description: Botón que solo contiene un icono; debe proporcionar un nombre accesible y se renderiza en el canvas de pingo.
---

# Icon Button

El botón de icono se utiliza para acciones compactas sin etiqueta de texto. La vista previa siguiente es renderizada en tiempo real por el motor pingo: se puede hacer clic, enfocar y sigue el cambio de tema claro/oscuro del sitio.

:::preview icon-button-basic
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { IconButton } from "@dopejs/pingo-ui";

root.render(
  createElement(IconButton, {
    icon: createElement("text", { value: "★" }),
    semanticLabel: "收藏",
    variant: "outline",
    onPress: () => toggleFavorite(),
  }),
);
```

`icon` es un slot transparente que acepta cualquier `PingoNode`: fuentes de iconos, SVG o glifos de texto. Como no hay texto visible, `semanticLabel` es obligatorio.

## Ejemplos

### Variantes

`variant` está completamente alineado con [Button](/components/button): `default`, `secondary`, `outline`, `ghost`, `destructive`.

### Limitaciones conocidas

`size` admite `default`, `sm`, `lg`, pero el skin actual no incluye reglas compuestas para `sm`/`lg` en la variante de icono; el tamaño del icono anula los modificadores de tamaño, por lo que `sm`/`lg` no tienen efecto visual por ahora.

## Props

| Prop            | Tipo                                                                | Valor predeterminado | Descripción                                               |
| --------------- | ------------------------------------------------------------------- | -------------------- | --------------------------------------------------------- |
| `icon`          | `PingoNode`                                                         | —                    | Slot de icono, se pasa tal cual (obligatorio)             |
| `semanticLabel` | `string`                                                            | —                    | Nombre accesible (obligatorio)                            |
| `variant`       | `"default" \| "secondary" \| "outline" \| "ghost" \| "destructive"` | `"default"`          | Variante visual                                           |
| `size`          | `"default" \| "sm" \| "lg"`                                         | `"default"`          | Tamaño (`sm`/`lg` no tienen efecto por ahora; ver arriba) |
| `disabled`      | `boolean`                                                           | `false`              | Estado deshabilitado                                      |
| `onPress`       | `() => void`                                                        | —                    | Callback de activación por puntero/teclado                |
| `className`     | `string`                                                            | —                    | Se añade después del nombre de clase del componente       |

## Accesibilidad

El botón de icono no tiene texto visible; los lectores de pantalla solo pueden depender de `semanticLabel`, por lo que esta prop es obligatoria. El botón tiene semántica de button y soporte de activación por teclado.
