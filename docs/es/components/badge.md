---
title: Badge
description: Pequeña etiqueta de estado no interactiva, renderizada en el canvas de pingo.
---

# Badge

Badge es una etiqueta de estado no interactiva para anotar estados, categorías o cantidades, por
ejemplo «Administrador» o «Beta». La vista previa de abajo se renderiza en vivo con el motor
pingo y sigue el tema del sitio al cambiar entre claro y oscuro.

:::preview badge-variants
:::

## Uso

```tsx
import { createElement } from "@dopejs/pingo";
import { Badge } from "@dopejs/pingo-ui";

root.render(createElement(Badge, { children: "Beta" }));
```

## Ejemplos

### Variantes

Cuatro variantes cubren la semántica habitual: `default` (énfasis), `secondary` (atenuado),
`destructive` (error/peligro) y `outline` (contorno). La vista previa las muestra en ese orden.

```tsx
createElement(Badge, { children: "只读", variant: "secondary" });
```

### Combinación con otros componentes

Badge suele usarse como elemento trailing de una fila de lista o de una tarjeta, combinado con
`Avatar` y `ListRow`:

```tsx
createElement(ListRow, {
  title: "张三",
  leading: createElement(Avatar, { fallback: "张", size: 32 }),
  trailing: createElement(Badge, { children: "管理员" }),
  onPress: () => {},
});
```

## Props

| Prop            | Tipo                                                     | Valor predeterminado | Descripción                                                   |
| --------------- | -------------------------------------------------------- | -------------------- | ------------------------------------------------------------- |
| `children`      | `string`                                                 | —                    | Texto de la etiqueta (obligatorio)                            |
| `variant`       | `"default" \| "secondary" \| "destructive" \| "outline"` | `"default"`          | Variante visual                                               |
| `semanticLabel` | `string`                                                 | —                    | Nombre accesible; si se omite se usa la semántica por defecto |
| `className`     | `string`                                                 | —                    | Se añade tras las clases del propio componente                |

## Accesibilidad

Badge no responde al puntero ni al teclado: es un elemento puramente expositivo. Cuando el texto
no basta para transmitir el significado (como un contador puramente numérico), usa
`semanticLabel` para dar la explicación completa.
